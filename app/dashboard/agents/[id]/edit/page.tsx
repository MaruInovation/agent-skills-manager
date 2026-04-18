"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateAgent } from "@/actions/agents";
import AgentForm from "@/dashboard/components/AgentForm";
import { AgentFormData } from "@/types/agent.type";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default function EditAgentPage({ params }: PageProps) {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();

	const [agentId, setAgentId] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingAgent, setLoadingAgent] = useState(true);
	const [editForm, setEditForm] = useState<AgentFormData>();

	useEffect(() => {
		params.then((p) => setAgentId(parseInt(p.id)));
	}, [params]);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	const fetchAgent = useCallback(async () => {
		try {
			if (!agentId) return;

			const response = await fetch(`/api/agents/${agentId}`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				if (data.agent) {
					setEditForm(data.agent);
				}
			} else if (response.status === 404) {
				setError("加载 agent 失败");
			} else if (response.status === 403) {
				setError("你没有编辑这个 agent 的权限");
			}
		} catch {
			setError("加载 agent 失败");
		} finally {
			setLoadingAgent(false);
		}
	}, [agentId]);

	useEffect(() => {
		if (agentId && user) {
			fetchAgent();
		}
	}, [agentId, user, fetchAgent]);

	const onSubmit = async (data: AgentFormData) => {
		if (!agentId || !user?.id) return;
		setIsSubmitting(true);

		try {
			const res = await updateAgent(agentId, data, user.id);
			if (res.success) router.push("/dashboard?tab=agent");
			else alert(res.error || "编辑失败");
		} catch {
			alert("编辑失败");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading || loadingAgent) {
		return (
			<div className="flex justify-center items-center min-h-[50vh]">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container mx-auto px-4 py-8 max-w-2xl">
				<div className="alert alert-error">
					<span>{error}</span>
				</div>
				<Link href="/dashboard?tab=agent" className="btn btn-ghost mt-4">
					← 返回控制台
				</Link>
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
					<h1 className="card-title text-2xl">编辑 Agent</h1>
					<p className="text-base-content/70">更新你的 agent 配置和绑定 skill。</p>
					<AgentForm
						onSubmit={onSubmit}
						isSubmitting={isSubmitting}
						defaultValues={editForm}
					/>
				</div>
			</div>
		</div>
	);
}
