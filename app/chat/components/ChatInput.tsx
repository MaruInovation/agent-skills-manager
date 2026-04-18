import React from "react";
import { FaArrowUp } from "react-icons/fa";
import { useForm } from "react-hook-form";
import type { ChatFormData } from "@/types/chat.type";

type Props = {
	onSubmit: (data: ChatFormData) => void;
};

const ChatInput = ({ onSubmit }: Props) => {
	const { register, handleSubmit, reset, watch, formState } = useForm<ChatFormData>({
		mode: "onChange",
		defaultValues: {
			prompt: "",
		},
	});

	const promptValue = watch("prompt", "");

	const submitPrompt = ({ prompt }: ChatFormData) => {
		const trimmedPrompt = prompt.trim();
		if (!trimmedPrompt) return;

		console.log("prompt=", trimmedPrompt);
		onSubmit({ prompt: trimmedPrompt });
		reset({ prompt: "" });
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(submitPrompt)();
		}
	};

	return (
		<form
			onSubmit={handleSubmit(submitPrompt)}
			onKeyDown={onKeyDown}
			className="flex flex-col gap-2 items-end border-2 p-4 rounded-2xl"
		>
			<textarea
				{...register("prompt", {
					required: true,
					validate: (value) => value.trim().length > 0,
				})}
				autoFocus
				className="w-full border-0 focus:outline-0 resize-none"
				placeholder="请输入"
				maxLength={1000}
			/>
			<button
				type="submit"
				disabled={!promptValue.trim() || formState.isSubmitting}
				className="rounded-full w-9 h-9 flex items-center justify-center cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
			>
				<FaArrowUp />
			</button>
		</form>
	);
};

export default ChatInput;
