import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "@/types/chat.type";

type Props = {
	messages: Message[];
};

const ChatMessage = ({ messages }: Props) => {
	const lastMessageRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const onCopyMessage = (e: React.ClipboardEvent<HTMLParagraphElement>) => {
		const selection = window.getSelection()?.toString().trim();

		if (selection) {
			e.preventDefault();
			e.clipboardData.setData("text/plain", selection);
		}
	};

	return (
		<div className=" flex flex-col gap-3">
			{messages.map((msg, index) => (
				<div
					ref={index === messages.length - 1 ? lastMessageRef : null}
					key={index}
					className={`p-3 py-1 max-w-md rounded-xl ${
						msg.role === "user"
							? "bg-blue-600 text-white self-end"
							: "bg-gray-100 text-black self-start"
					}`}
					onCopy={onCopyMessage}
				>
					<ReactMarkdown>{msg.content}</ReactMarkdown>
				</div>
			))}
		</div>
	);
};

export default ChatMessage;
