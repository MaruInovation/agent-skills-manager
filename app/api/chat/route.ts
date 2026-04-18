import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { llmClient } from "@/llm/cliemt"; // 你这里写错了 cliemt → client
import { conversationRepository } from "@/api/chat/a/conversation.repository";

type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

const chatSchema = z.object({
    prompt: z
        .string()
        .trim()
        .min(1, "prompt is required")
        .max(1000, "prompt must be at most 1000 characters"),
    conversationId: z.string().trim().min(1, "conversationId is required"),
});

const promptsDir = path.join(process.cwd(), "app", "prompts");
const parkInfo = fs.readFileSync(path.join(promptsDir, "WonderWorld.md"), "utf-8");
const template = fs.readFileSync(path.join(promptsDir, "chatbot.txt"), "utf-8");
const instructions = template.replace("{{parkInfo}}", parkInfo);

export const runtime = "nodejs";

// 流式响应必须用 Response，不能用 NextResponse
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = chatSchema.safeParse(body);

        if (!parseResult.success) {
            return new Response(
                JSON.stringify({ error: parseResult.error.format() }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const { prompt, conversationId } = parseResult.data;

        // 获取历史消息 + 当前用户提问
        const messages = [
            ...conversationRepository.getMessages(conversationId),
            { role: "user", content: prompt },
        ] as ChatMessage[];

        // 1. 调用流式 LLM
        const stream = await llmClient.generateTextStream({
            messages: [ { role: "system", content: instructions }, ...messages ],
        });

        // 2. 拼接完整回答（用于保存上下文）
        let fullText = "";

        // 3. 创建流式转换（ReadableStream → 前端可接收的流）
        const responseStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const content = chunk.choices[ 0 ]?.delta?.content || "";
                        if (content) {
                            fullText += content;
                            // 把内容推送给前端
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                    // 流结束
                    controller.close();

                    // 4. 保存完整对话上下文（关键！）
                    const updatedMessages: ChatMessage[] = [
                        ...messages,
                        { role: "assistant", content: fullText },
                    ];
                    conversationRepository.setMessages(conversationId, updatedMessages);

                } catch (error) {
                    console.error("Stream error:", error);
                    controller.error(error);
                }
            },
        });

        // 5. 返回流式响应
        return new Response(responseStream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
            },
        });

    } catch (error) {
        console.error("Chat route error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}