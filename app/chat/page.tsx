"use client";

import { useEffect, useMemo, useState } from "react";
import TypingIndicator from "./components/TypingIndicator";
import type { ChatSubmitData, Message } from "@/types/chat.type";
import type OpenAI from "openai";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import { Agent } from "@/types/agent.type";
import ConversationSidebar from "./components/ConversationSidebar";

type Conversation = {
	id: string;
	title: string;
	messages: Message[];
	updatedAt: number;
};

type ChatMessageRow = {
	id: number;
	conversationId: string;
	message: string;
	agentId: number | null;
	updatedAt: string;
};

const createConversation = (): Conversation => ({
	id: crypto.randomUUID(),
	title: "新对话",
	messages: [],
	updatedAt: Date.now(),
});

const buildConversationTitle = (prompt: string) => {
	const trimmed = prompt.trim();
	if (trimmed.length <= 20) return trimmed;
	return `${trimmed.slice(0, 20)}...`;
};

const parseConversationMessages = (raw: string): Message[] => {
	try {
		const parsed = JSON.parse(raw) as OpenAI.ChatCompletionMessageParam[];
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((item) => {
				if (item.role === "user") {
					return { role: "user" as const, content: String(item.content ?? "") };
				}

				if (item.role === "assistant") {
					return { role: "bot" as const, content: String(item.content ?? "") };
				}

				return null;
			})
			.filter((item): item is Message => Boolean(item));
	} catch {
		return [];
	}
};

const ChatBot = () => {
	const [conversations, setConversations] = useState<Conversation[]>(() => [createConversation()]);
	const [activeConversationId, setActiveConversationId] = useState<string>(() => conversations[0].id);
	const [isBotTyping, setIsBotTyping] = useState(false);
	const [error, setError] = useState("");
	const [agents, setAgents] = useState<Agent[]>([]);

	const sortedConversations = useMemo(
		() => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
		[conversations]
	);
	const sidebarConversations = useMemo(
		() =>
			sortedConversations.map((conversation) => ({
				id: conversation.id,
				title: conversation.title,
				lastMessage: conversation.messages[conversation.messages.length - 1]?.content ?? "",
			})),
		[sortedConversations]
	);

	const activeConversation = useMemo(
		() => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
		[conversations, activeConversationId]
	);

	const activeMessages = activeConversation?.messages ?? [];

	const updateConversation = (
		conversationId: string,
		updater: (conversation: Conversation) => Conversation
	) => {
		setConversations((prev) =>
			prev.map((conversation) =>
				conversation.id === conversationId ? updater(conversation) : conversation
			)
		);
	};

	const createNewConversation = () => {
		const existingDraftConversation = conversations.find(
			(conversation) => conversation.messages.length === 0
		);

		if (existingDraftConversation) {
			setActiveConversationId(existingDraftConversation.id);
			setError("");
			return;
		}

		const nextConversation = createConversation();
		setConversations((prev) => [nextConversation, ...prev]);
		setActiveConversationId(nextConversation.id);
		setError("");
	};

	const onSubmit = async ({ prompt, agent }: ChatSubmitData) => {
		if (!activeConversationId) return;

		const targetConversationId = activeConversationId;

		try {
			updateConversation(targetConversationId, (conversation) => {
				const hasUserMessage = conversation.messages.some((msg) => msg.role === "user");
				const nextTitle = hasUserMessage ? conversation.title : buildConversationTitle(prompt);

				return {
					...conversation,
					title: nextTitle,
					messages: [...conversation.messages, { content: prompt, role: "user" }],
					updatedAt: Date.now(),
				};
			});

			setError("");
			setIsBotTyping(true);

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					conversationId: targetConversationId,
					agent,
				}),
			});

			if (!response.ok) {
				throw new Error("请求失败");
			}

			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("浏览器不支持流式输出");
			}

			const decoder = new TextDecoder();
			let fullText = "";

			updateConversation(targetConversationId, (conversation) => ({
				...conversation,
				messages: [...conversation.messages, { content: "", role: "bot" }],
				updatedAt: Date.now(),
			}));

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				fullText += chunk;

				updateConversation(targetConversationId, (conversation) => {
					if (conversation.messages.length === 0) return conversation;

					const nextMessages = [...conversation.messages];
					nextMessages[nextMessages.length - 1] = {
						...nextMessages[nextMessages.length - 1],
						content: fullText,
					};

					return {
						...conversation,
						messages: nextMessages,
						updatedAt: Date.now(),
					};
				});
			}
		} catch (e) {
			console.error(e);
			setError("出了点问题，请重试");
		} finally {
			setIsBotTyping(false);
		}
	};

	const getAgents = async () => {
		const response = await fetch("/api/agents");
		if (!response.ok) return;

		const data = await response.json();
		setAgents(data.agents ?? []);
	};

	const getConversations = async () => {
		const response = await fetch("/api/chat/message");
		if (!response.ok) return;

		const data = (await response.json()) as { conversations?: ChatMessageRow[] };
		const rows = data.conversations ?? [];

		if (rows.length === 0) {
			const initialConversation = createConversation();
			setConversations([initialConversation]);
			setActiveConversationId(initialConversation.id);
			return;
		}

		const mappedConversations: Conversation[] = rows.map((row) => {
			const messages = parseConversationMessages(row.message);
			const firstUserMessage = messages.find((message) => message.role === "user")?.content ?? "";

			return {
				id: row.conversationId,
				title: firstUserMessage ? buildConversationTitle(firstUserMessage) : "新对话",
				messages,
				updatedAt: new Date(row.updatedAt).getTime(),
			};
		});

		setConversations(mappedConversations);
		setActiveConversationId(mappedConversations[0].id);
	};

	const deleteConversation = async (conversationId: string) => {
		const response = await fetch("/api/chat/message", {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ conversationId }),
		});

		if (!response.ok) {
			throw new Error("删除会话失败");
		}

		setConversations((prev) => {
			const next = prev.filter((conversation) => conversation.id !== conversationId);
			if (next.length === 0) {
				const draftConversation = createConversation();
				setActiveConversationId(draftConversation.id);
				return [draftConversation];
			}

			if (activeConversationId === conversationId) {
				setActiveConversationId(next[0].id);
			}

			return next;
		});
		setError("");
	};

	useEffect(() => {
		getAgents();
		getConversations();
	}, []);

	return (
		<div className="p-4 h-[90vh]">
			<div className="h-full flex gap-4 overflow-hidden">
				<ConversationSidebar
					conversations={sidebarConversations}
					activeConversationId={activeConversationId}
					onCreateConversation={createNewConversation}
					onSelectConversation={(conversationId) => {
						setActiveConversationId(conversationId);
						setError("");
					}}
					onDeleteConversation={deleteConversation}
				/>

				<div className="h-full flex-1 flex flex-col overflow-hidden">
					<div className="flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
						<ChatMessage messages={activeMessages} />
						{isBotTyping && <TypingIndicator />}
						{error && <p className="text-red-500">{error}</p>}
					</div>
					<ChatInput onSubmit={onSubmit} agents={agents} />
				</div>
			</div>
		</div>
	);
};

export default ChatBot;
