// route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import OpenAI from "openai";
import { llmClient } from "@/llm/client";
import { conversationRepository } from "@/api/chat/a/conversation.repository";
import { executeMultipleToolCalls } from "@/llm/executor";
import { Agent } from "@/types/agent.type";

type AgentStream = {
    messages: OpenAI.ChatCompletionMessageParam[];
    conversationId: string;
    originalMessages: OpenAI.ChatCompletionMessageParam[];
    controller: ReadableStreamDefaultController;
    agent: Agent;
};

const chatSchema = z.object({
    prompt: z.string().trim().min(1).max(1000),
    conversationId: z.string().trim().min(1),
    agent: z.object({
        id: z.number(),
        name: z.string(),
        description: z.string().nullable(),
        model: z.string(),
        temperature: z.number(),
        systemContent: z.string().nullable().optional(),
        isPublic: z.boolean(),
        createdAt: z.string(),
        skills: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                content: z.string().nullable(),
            })
        ),
    }),
});

// 处理完整的 Agent 对话（真正的流式）
async function handleAgentStream({
    messages,
    conversationId,
    originalMessages,
    controller,
    agent,
}: AgentStream) {
    let currentMessages = [ ...messages ];
    let maxIterations = 5;
    let iteration = 0;
    let fullResponse = "";

    while (iteration < maxIterations) {
        iteration++;

        // 调用流式 LLM
        // console.log('currentMessages===', currentMessages);

        const { stream } = await llmClient.generateTextStreamWithTools({
            messages: currentMessages,
            agent,
        });

        // 临时存储当前轮的输出
        let currentRoundContent = "";
        let currentRoundToolCalls: any[] = [];

        // 读取流
        const reader = stream.getReader();
        let hasToolCallInThisRound = false;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);

            // 检查是否是工具调用信号
            if (chunk.includes('"type":"TOOL_CALLS"')) {
                try {
                    const signal = JSON.parse(chunk);
                    if (signal.type === "TOOL_CALLS") {
                        hasToolCallInThisRound = true;
                        currentRoundToolCalls = signal.data;
                        // 向前端发送工具调用状态
                        // controller.enqueue(new TextEncoder().encode(`\n[🔧 正在查询信息...]\n`));
                    }
                } catch (e) {
                    // 不是 JSON，是普通内容
                    controller.enqueue(value);
                    currentRoundContent += chunk;
                    fullResponse += chunk;
                }
            } else {
                // 普通内容，直接推送给前端
                controller.enqueue(value);
                currentRoundContent += chunk;
                fullResponse += chunk;
            }
        }

        // 如果有工具调用
        if (hasToolCallInThisRound) {
            const toolCalls = currentRoundToolCalls.length > 0 ? currentRoundToolCalls : [];

            if (toolCalls.length > 0) {
                // 添加助手消息
                currentMessages.push({
                    role: "assistant",
                    content: currentRoundContent || null,
                    tool_calls: toolCalls.map((tc: any) => ({
                        id: tc.id,
                        type: "function",
                        function: {
                            name: tc.function.name,
                            arguments: tc.function.arguments,
                        },
                    })),
                } as any);

                // 执行工具
                // controller.enqueue(new TextEncoder().encode(`\n[✅ 查询完成，正在生成回复...]\n`));

                // console.log("toolCalls", toolCalls);

                const toolResults = await executeMultipleToolCalls(toolCalls);

                currentMessages.push(...toolResults);

                // 继续循环，让模型生成最终回复
                continue;
            }
        }

        // 没有工具调用，说明已经完成
        break;
    }

    // 保存对话历史
    const updatedMessages = [ ...originalMessages, { role: "assistant", content: fullResponse } ];
    conversationRepository.setMessages(conversationId, updatedMessages as any);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const parseResult = chatSchema.safeParse(body);

        if (!parseResult.success) {
            return new Response(JSON.stringify({ error: parseResult.error.format() }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const { prompt, conversationId, agent } = parseResult.data;
        const normalizedAgent: Agent = {
            ...agent,
            description: agent.description ?? "",
            systemContent: agent.systemContent ?? "",
            skills: agent.skills.map((skill) => ({
                ...skill,
                content: skill.content ?? "",
            })),

        };


        // 获取历史消息
        const historyMessages = (conversationRepository.getMessages(conversationId) ||
            []) as OpenAI.ChatCompletionMessageParam[];

        // 构建消息列表
        let instructions = normalizedAgent.systemContent;
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: instructions },
            ...historyMessages,
            { role: "user", content: prompt },
        ];

        // 创建流式响应
        const responseStream = new ReadableStream({
            async start(controller) {
                try {
                    await handleAgentStream({
                        messages,
                        conversationId,
                        originalMessages: [ ...historyMessages, { role: "user", content: prompt } ],
                        controller,
                        agent: normalizedAgent,
                    });
                    controller.close();
                } catch (error) {
                    console.error("Stream error:", error);
                    const errorMsg = `\n[错误] ${error instanceof Error ? error.message : String(error)}`;
                    controller.enqueue(new TextEncoder().encode(errorMsg));
                    controller.close();
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
        console.error("chat异常:", error);
        return new Response(JSON.stringify({ error: "服务器异常" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
