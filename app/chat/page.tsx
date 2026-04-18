"use client";

import { useRef, useState } from "react";
import TypingIndicator from "./components/TypingIndicator";
import type { ChatFormData, Message } from "@/types/chat.type";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";

type ChatResponse = {
	message: string;
};

const ChatBot = () => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [isBotTyping, setIsBotTyping] = useState(false);
	const [error, setError] = useState("");

	const conversationId = useRef(crypto.randomUUID());

	const onSubmit = async ({ prompt }: ChatFormData) => {
		try {
			setMessages((prev) => [...prev, { content: prompt, role: "user" }]);
			setError("");
			setIsBotTyping(true);

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					prompt,
					conversationId: conversationId.current,
				}),
			});

			const data = await response.json();

			setMessages((prev) => [...prev, { content: data.message, role: "bot" }]);
		} catch (e) {
			console.error(e);
			setError("出了点问题，请重试");
		} finally {
			setIsBotTyping(false);
		}
	};

	return (
		<div className="p-4 h-[90vh]">
			<div className=" h-full flex flex-col overflow-hidden">
				<div className=" flex flex-col flex-1 gap-3 mb-10 overflow-y-auto">
					<ChatMessage messages={messages} />
					{isBotTyping && <TypingIndicator />}
					{error && <p className=" text-red-500">{error}</p>}
				</div>
				<ChatInput onSubmit={onSubmit} />
			</div>
		</div>
	);
};

export default ChatBot;
