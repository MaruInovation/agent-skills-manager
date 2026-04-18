"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AgentForm from "@/dashboard/components/AgentForm";
import { AgentFormData } from "@/types/agent.type";
import { createAgent } from "@/actions/agents";

export default function NewAgentPage() {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!isLoading && !isAuthenticated) {
		router.push("/login");
		return null;
	}

	const onSubmit = async (data: AgentFormData) => {
		if (!user?.id) return;
		setIsSubmitting(true);

		try {
			const res = await createAgent(data, user.id);
			if (res.success) router.push("/dashboard?tab=agent");
			else alert(res.error || "创建失败");
		} catch {
			alert("创建失败");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<div className="mb-6">
				<Link href="/dashboard?tab=agent" className="btn btn-ghost btn-sm gap-2">
					← 返回控制台
				</Link>
			</div>

			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h1 className="card-title text-2xl">创建新 Agent</h1>
					<p className="text-base-content/70">配置模型、指令和绑定 Skill。</p>
					<AgentForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
				</div>
			</div>
		</div>
	);
}
