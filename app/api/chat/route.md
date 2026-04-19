// 老版本---先拿出来在流出去
import { NextRequest } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { llmClient } from "@/llm/client";
import { conversationRepository } from "@/api/chat/a/conversation.repository";
import { tools, generalInstructions } from "@/llm/skill";
import { executeMultipleToolCalls } from "@/llm/executor";

const chatSchema = z.object({
prompt: z.string().trim().min(1, "prompt 不能为空").max(1000, "prompt 长度限制不能超过1000字"),
conversationId: z.string().trim().min(1, "conversationId 不能为空"),
});

// 处理 agent 响应（自动执行工具）
async function handleAgentResponse({
messages,
conversationId,
originalMessages,
}: {
messages: OpenAI.ChatCompletionMessageParam[];
conversationId: string;
originalMessages: OpenAI.ChatCompletionMessageParam[];
}) {
let currentMessages = [ ...messages ];
let maxIterations = 5;
let iteration = 0;

    //每次对话最多只能只能调用五次工具
    while (iteration < maxIterations) {
        iteration++;

        // 使用非流式方法调用 LLM
        const responseMessage = await llmClient.generateText({
            messages: currentMessages,
        });

        // 检查是否有工具调用
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
            // 添加助手的工具调用消息
            currentMessages.push({
                role: "assistant",
                content: responseMessage.content,
                tool_calls: responseMessage.tool_calls,
            });

            console.log(responseMessage.tool_calls);

            // 批量执行工具调用（直接传入 OpenAI 类型）
            const toolResults = await executeMultipleToolCalls(responseMessage.tool_calls);

            // 添加工具执行结果
            currentMessages.push(...toolResults);

            continue;
        }

        // 没有工具调用，返回最终回复
        const finalResponse = responseMessage.content || "";

        // 保存对话历史
        const updatedMessages = [
            ...originalMessages,
            { role: "assistant", content: finalResponse },
        ];
        conversationRepository.setMessages(conversationId, updatedMessages as any);

        return finalResponse;
    }

    throw new Error("工具调用次数超过限制");

}

// 流式输出最终回复
async function\* streamFinalResponse(text: string) {
const chunkSize = 20;
for (let i = 0; i < text.length; i += chunkSize) {
yield text.slice(i, i + chunkSize);
await new Promise((resolve) => setTimeout(resolve, 30));
}
}

export async function POST(request: NextRequest) {
try {
const body = await request.json();
//数据校验
const parseResult = chatSchema.safeParse(body);
if (!parseResult.success) {
return new Response(JSON.stringify({ error: parseResult.error.format() }), {
status: 400,
headers: { "Content-Type": "application/json" },
});
}

        const { prompt, conversationId } = parseResult.data;

        // 获取历史消息
        const historyMessages = (conversationRepository.getMessages(conversationId) ||
            []) as OpenAI.ChatCompletionMessageParam[];

        // 构建消息列表（使用通用指令）
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: generalInstructions },
            ...historyMessages,
            { role: "user", content: prompt },
        ];

        // 处理 agent 调用
        const finalResponse = await handleAgentResponse({
            messages,
            conversationId,
            originalMessages: [ ...historyMessages, { role: "user", content: prompt } ],
        });

        // 创建流式响应
        const responseStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of streamFinalResponse(finalResponse)) {
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });
    } catch (error) {
        console.error("Chat route error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

}
