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
			// 1. 添加用户消息
			setMessages((prev) => [...prev, { content: prompt, role: "user" }]);
			setError("");
			setIsBotTyping(true);

			// 2. 请求流式接口
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

			// 处理 HTTP 错误
			if (!response.ok) {
				throw new Error("请求失败");
			}

			// 3. 获取流读取器
			const reader = response.body?.getReader();
			if (!reader) {
				throw new Error("浏览器不支持流式输出");
			}

			const decoder = new TextDecoder();
			let fullText = "";

			// 4. 先添加一条空的机器人消息
			setMessages((prev) => [...prev, { content: "", role: "bot" }]);

			// 5. 逐字读取流
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				// 解码收到的文字
				const chunk = decoder.decode(value, { stream: true });
				fullText += chunk;

				// 6. 实时更新最后一条消息（打字机效果）
				setMessages((prev) => {
					const newMessages = [...prev];
					newMessages[newMessages.length - 1].content = fullText;
					return newMessages;
				});
			}
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
