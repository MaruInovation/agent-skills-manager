import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowUp, FaCheck } from "react-icons/fa";
import { useForm, useWatch } from "react-hook-form";
import type { ChatFormData, ChatSubmitData } from "@/types/chat.type";
import type { Agent } from "@/types/agent.type";

type Props = {
	onSubmit: (data: ChatSubmitData) => void;
	agents: Agent[];
};

const ChatInput = ({ onSubmit, agents }: Props) => {
	const wrapperRef = useRef<HTMLDivElement | null>(null);
	const { register, handleSubmit, reset, control, formState } = useForm<ChatFormData>({
		mode: "onChange",
		defaultValues: {
			prompt: "",
		},
	});
	const [isAgentListOpen, setIsAgentListOpen] = useState(false);
	const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

	const promptValue = useWatch({ control, name: "prompt", defaultValue: "" });
	const selectedAgent = useMemo(
		() => agents.find((agent) => agent.id === selectedAgentId) ?? null,
		[agents, selectedAgentId]
	);
	const finalSelectedAgent = selectedAgent ?? agents[0] ?? null;

	useEffect(() => {
		const handleDocumentClick = (event: MouseEvent) => {
			if (!isAgentListOpen || !wrapperRef.current) return;

			const target = event.target as Node | null;
			if (target && !wrapperRef.current.contains(target)) {
				setIsAgentListOpen(false);
			}
		};

		document.addEventListener("mousedown", handleDocumentClick);
		return () => {
			document.removeEventListener("mousedown", handleDocumentClick);
		};
	}, [isAgentListOpen]);

	const submitPrompt = ({ prompt }: ChatFormData) => {
		const trimmedPrompt = prompt.trim();
		if (!trimmedPrompt || !finalSelectedAgent) return;
		onSubmit({ prompt: trimmedPrompt, agent: finalSelectedAgent });
		reset({ prompt: "" });
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(submitPrompt)();
		}
	};

	return (
		<div ref={wrapperRef}>
			<form
				onSubmit={handleSubmit(submitPrompt)}
				onKeyDown={onKeyDown}
				className="flex flex-col gap-2 items-end border border-base-300 bg-base-100/70 p-4 rounded-2xl"
			>
				<textarea
					{...register("prompt", {
						required: true,
						validate: (value) => value.trim().length > 0,
					})}
					onFocus={() => setIsAgentListOpen(false)}
					autoFocus
					className="w-full border-0 bg-transparent focus:outline-0 resize-none"
					placeholder="请输入"
					maxLength={1000}
				/>
				<div className="w-full flex items-center justify-between gap-2">
					<button
						type="button"
						onClick={() => setIsAgentListOpen((prev) => !prev)}
						className="h-9 px-3 rounded-full border border-base-content/30 text-sm bg-base-200 text-base-content hover:bg-base-300 transition-colors"
					>
						{finalSelectedAgent ? `Agent: ${finalSelectedAgent.name}` : "选择 Agent"}
					</button>
					<button
						type="submit"
						disabled={
							!promptValue.trim() || formState.isSubmitting || !finalSelectedAgent
						}
						className="rounded-full w-9 h-9 flex items-center justify-center cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
					>
						<FaArrowUp />
					</button>
				</div>
			</form>

			{isAgentListOpen && (
				<div className="max-w-full border border-base-300 rounded-xl p-3 mt-2 max-h-64 overflow-y-auto bg-base-200/70">
					{agents.length === 0 ? (
						<p className="text-sm text-base-content/70 px-2 py-1">暂无可用 Agent</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
							{agents.map((agent) => {
								const isSelected = (finalSelectedAgent?.id ?? null) === agent.id;

								return (
									<button
										key={agent.id}
										type="button"
										onClick={() => setSelectedAgentId(agent.id)}
										className={`w-full text-left px-3 py-3 rounded-xl text-sm border transition-all ${
											isSelected
												? "bg-primary/10 text-primary border-primary/40 shadow-sm ring-1 ring-primary/20"
												: "bg-base-100 border-base-300 text-base-content hover:border-base-content/30 hover:bg-base-200"
										}`}
									>
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<div className="font-medium">{agent.name}</div>
												{agent.description && (
													<div className="text-xs text-base-content/70 truncate mt-1">
														{agent.description}
													</div>
												)}
											</div>
											{isSelected && (
												<span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-content">
													<FaCheck className="text-[10px]" />
												</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default ChatInput;
