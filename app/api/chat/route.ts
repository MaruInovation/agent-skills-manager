import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { llmClient } from "@/llm/cliemt";
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parseResult = chatSchema.safeParse(body);

        if (!parseResult.success) {
            return NextResponse.json(
                { error: parseResult.error.format() },
                { status: 400 }
            );
        }

        const { prompt, conversationId } = parseResult.data;

        const messages = [
            ...conversationRepository.getMessages(conversationId),
            { role: "user", content: prompt },
        ] as ChatMessage[];

        const result = await llmClient.generateText({
            messages: [ { role: "system", content: instructions }, ...messages ],
        });

        const updatedMessages: ChatMessage[] = [
            ...messages,
            { role: "assistant", content: result.text },
        ];
        conversationRepository.setMessages(conversationId, updatedMessages);

        return NextResponse.json({ id: result.id, message: result.text });
    } catch (error) {
        console.error("Chat route error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

