import OpenAI from "openai";
import { Agent } from "@/types/agent.type";
import { getTools } from "./executor";

const client = new OpenAI({
    baseURL: "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// 流式输出方法
const generateTextStream = async ({
    model = "deepseek-chat",
    messages,
    temperature = 0.2,
    max_tokens = 200,
}: {
    model?: string;
    messages: OpenAI.ChatCompletionMessageParam[];
    temperature?: number;
    max_tokens?: number;
}) => {
    const stream = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true,
        // tools,
    });

    return stream;
};

// 非流式方法（用于工具调用循环）
const generateText = async ({
    model = "deepseek-chat",
    messages,
    temperature = 0.2,
    max_tokens = 1000,
}: {
    model?: string;
    messages: OpenAI.ChatCompletionMessageParam[];
    temperature?: number;
    max_tokens?: number;
}) => {
    const completion = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        stream: false,
        // tools,
        tool_choice: "auto",
    });

    return completion.choices[ 0 ].message;
};

//流式处理，实时返回tools
const generateTextStreamWithTools = async ({
    model = "deepseek-chat",
    messages,
    temperature = 0.2,
    max_tokens = 1000,
    agent,
}: {
    model?: string;
    messages: OpenAI.ChatCompletionMessageParam[];
    temperature?: number;
    max_tokens?: number;
    agent: Agent;
}) => {
    const stream = await client.chat.completions.create({
        model: agent.model ? agent.model : model,
        messages,
        temperature: agent.temperature ? agent.temperature : temperature,
        max_tokens,
        stream: true,
        tools: getTools(agent),
        tool_choice: "auto",
    });

    // 用于累积 tool_calls
    const toolCallsMap: Map<
        number,
        {
            id: string;
            index: number;
            type: "function";
            function: { name: string; arguments: string };
        }
    > = new Map();

    let hasToolCalls = false;

    // 创建可读流，边接收边处理
    const readableStream = new ReadableStream({
        // 初始化，可以立即入队数据
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const delta = chunk.choices[ 0 ]?.delta;

                    // 处理普通内容
                    if (delta?.content) {
                        controller.enqueue(new TextEncoder().encode(delta.content));
                    }

                    // 处理 tool_calls

                    if (delta?.tool_calls) {
                        hasToolCalls = true;
                        for (const toolCallDelta of delta.tool_calls) {
                            const index = toolCallDelta.index;

                            if (!toolCallsMap.has(index)) {
                                toolCallsMap.set(index, {
                                    id: toolCallDelta.id || "",
                                    index: 0,
                                    type: "function",
                                    function: {
                                        name: toolCallDelta.function?.name || "",
                                        arguments: toolCallDelta.function?.arguments || "",
                                    },
                                });
                            } else {
                                const existing = toolCallsMap.get(index)!;
                                if (toolCallDelta.function?.arguments) {
                                    existing.function.arguments += toolCallDelta.function.arguments;
                                }
                            }
                        }
                    }
                }

                // 如果有工具调用，将工具调用信息附加到流中
                if (hasToolCalls) {
                    const toolCalls = Array.from(toolCallsMap.values());
                    // 发送特殊标记，表示需要执行工具
                    const toolCallSignal = JSON.stringify({
                        type: "TOOL_CALLS",
                        data: toolCalls,
                    });
                    controller.enqueue(new TextEncoder().encode(`\n${toolCallSignal}\n`));
                }

                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return { stream: readableStream };
};

export const llmClient = {
    generateTextStream,
    generateText,
    generateTextStreamWithTools,
};
