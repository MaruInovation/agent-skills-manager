"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdDeleteForever } from "react-icons/md";

type ConversationItem = {
	id: string;
	title: string;
	lastMessage: string;
};

type Props = {
	conversations: ConversationItem[];
	activeConversationId: string;
	onCreateConversation: () => void;
	onSelectConversation: (conversationId: string) => void;
	onDeleteConversation: (conversationId: string) => Promise<void>;
};

const ConversationSidebar = ({
	conversations,
	activeConversationId,
	onCreateConversation,
	onSelectConversation,
	onDeleteConversation,
}: Props) => {
	const sidebarRef = useRef<HTMLElement | null>(null);
	const [openMenuConversationId, setOpenMenuConversationId] = useState<string | null>(null);
	const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null);
	const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!sidebarRef.current) return;
			const target = event.target as Node | null;
			if (target && !sidebarRef.current.contains(target)) {
				setOpenMenuConversationId(null);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleDeleteConversation = async (conversationId: string) => {
		setDeletingConversationId(conversationId);
		try {
			await onDeleteConversation(conversationId);
		} finally {
			setDeletingConversationId(null);
			setOpenMenuConversationId(null);
		}
	};

	const toggleMenu = (conversationId: string, triggerElement: HTMLDivElement) => {
		if (openMenuConversationId === conversationId) {
			setOpenMenuConversationId(null);
			setMenuPosition(null);
			return;
		}

		const rect = triggerElement.getBoundingClientRect();
		setMenuPosition({
			top: rect.bottom + 4,
			left: rect.right + 4,
		});
		setOpenMenuConversationId(conversationId);
	};

	const onKeyActivate = (event: React.KeyboardEvent<HTMLDivElement>, action: () => void) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			action();
		}
	};

	return (
		<aside
			ref={sidebarRef}
			className="w-72 shrink-0 h-full rounded-2xl border border-base-300 bg-base-100/80 p-3 flex flex-col"
		>
			<div
				role="button"
				tabIndex={0}
				onClick={onCreateConversation}
				onKeyDown={(event) => onKeyActivate(event, onCreateConversation)}
				className="w-full rounded-xl bg-primary text-primary-content py-2 text-sm font-medium hover:opacity-90 transition-opacity text-center cursor-pointer"
			>
				+ 新对话
			</div>

			<div className="mt-3 flex-1 overflow-y-auto overflow-x-visible space-y-2">
				{conversations.map((conversation) => {
					const isActive = conversation.id === activeConversationId;
					const isMenuOpen = openMenuConversationId === conversation.id;
					const isDeleting = deletingConversationId === conversation.id;

					return (
						<div
							key={conversation.id}
							className={`group relative w-full text-left rounded-xl border p-3 transition-colors ${
								isActive
									? "border-primary/40 bg-primary/10"
									: "border-base-300 bg-base-100 hover:bg-base-200"
							}`}
						>
							<div
								role="button"
								tabIndex={0}
								onClick={() => onSelectConversation(conversation.id)}
								onKeyDown={(event) =>
									onKeyActivate(event, () => onSelectConversation(conversation.id))
								}
								className="min-w-0 pr-8 cursor-pointer"
							>
								<p className="text-sm font-medium truncate">{conversation.title}</p>
								<p className="text-xs text-base-content/60 truncate mt-1">
									{conversation.lastMessage || "暂无消息"}
								</p>
							</div>

							<div className="absolute right-2 top-2">
								<div
									tabIndex={0}
									onClick={(event) =>
										toggleMenu(
											conversation.id,
											event.currentTarget as HTMLDivElement
										)
									}
									onKeyDown={(event) =>
										onKeyActivate(event, () =>
											toggleMenu(
												conversation.id,
												event.currentTarget as HTMLDivElement
											)
										)
									}
									className={`h-6 min-w-6 px-1 rounded-md border border-base-300 text-base-content/80 text-center leading-5 cursor-pointer transition-opacity ${
										isMenuOpen
											? "opacity-100"
											: "opacity-0 group-hover:opacity-100"
									} ${isDeleting ? "pointer-events-none" : ""}`}
								>
									...
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{openMenuConversationId && menuPosition && (
				<div
					className="fixed  w-28 rounded-lg border border-base-300 bg-base-100 shadow-lg p-1"
					style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
				>
					<div
						role="button"
						tabIndex={0}
						onClick={() => handleDeleteConversation(openMenuConversationId)}
						onKeyDown={(event) =>
							onKeyActivate(event, () =>
								handleDeleteConversation(openMenuConversationId)
							)
						}
						className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-red-500 hover:bg-red-50 cursor-pointer ${
							deletingConversationId === openMenuConversationId
								? "pointer-events-none opacity-70"
								: ""
						}`}
					>
						{deletingConversationId === openMenuConversationId ? (
							<span className="loading loading-spinner loading-xs"></span>
						) : (
							<MdDeleteForever className="text-base" />
						)}
						<span className="text-sm">删除</span>
					</div>
				</div>
			)}
		</aside>
	);
};

export default ConversationSidebar;
