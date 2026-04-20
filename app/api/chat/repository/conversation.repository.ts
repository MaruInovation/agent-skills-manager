import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

type GetMessagesInput = {
	conversationId: string;
	userId: number;
};

type SetMessagesInput = {
	conversationId: string;
	userId: number;
	agentId?: number | null;
	messages: OpenAI.ChatCompletionMessageParam[];
};

const parseStoredMessage = (raw: string): OpenAI.ChatCompletionMessageParam[] => {
	try {
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return [];

		return parsed.filter(
			(item): item is OpenAI.ChatCompletionMessageParam =>
				Boolean(item) && typeof item === "object" && "role" in item
		);
	} catch {
		return [];
	}
};

async function getMessages({ conversationId, userId }: GetMessagesInput) {
	const row = await prisma.chatMessage.findFirst({
		where: {
			conversationId,
			userId,
		},
		orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
		select: {
			message: true,
		},
	});

	if (!row) return [];
	return parseStoredMessage(row.message);
}

async function setMessages({ conversationId, userId, agentId, messages }: SetMessagesInput) {
	const existingRow = await prisma.chatMessage.findFirst({
		where: {
			conversationId,
			userId,
		},
		orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
		select: {
			id: true,
		},
	});

	if (!existingRow) {
		await prisma.chatMessage.create({
			data: {
				conversationId,
				userId,
				agentId: agentId ?? null,
				message: JSON.stringify(messages),
			},
		});
		return;
	}

	await prisma.chatMessage.update({
		where: { id: existingRow.id },
		data: {
			agentId: agentId ?? null,
			message: JSON.stringify(messages),
		},
	});
}

export const conversationRepository = {
	getMessages,
	setMessages,
};
