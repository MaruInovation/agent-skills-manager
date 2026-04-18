import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteAgent } from "@/actions/agents";
import SkeletonScreen from "./SkeletonScreen";
import Empty from "./Empty";

interface Agent {
	id: number;
	name: string;
	description: string | null;
	model: string;
	isPublic: boolean;
	createdAt: string;
}

const AgentCard = () => {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth();
	const deleteDialogRef = useRef<HTMLDialogElement>(null);
	const currentDeleteId = useRef<number | null>(null);
	const [agents, setAgents] = useState<Agent[]>([]);
	const [loadingAgents, setLoadingAgents] = useState(true);
	const [deletingId, setDeletingId] = useState<number | null>(null);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	useEffect(() => {
		if (user) {
			fetchUserAgents();
		}
	}, [user]);

	const fetchUserAgents = async () => {
		try {
			const response = await fetch("/api/agents", {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setAgents(data.agents || []);
			}
		} catch (error) {
			console.error("获取 agent 失败:", error);
		} finally {
			setLoadingAgents(false);
		}
	};

	const deleteDialogShow = (id: number) => {
		currentDeleteId.current = id;
		deleteDialogRef.current?.showModal();
	};

	const deleteDialogOnClose = () => {
		const dialog = deleteDialogRef.current;
		if (!dialog) return;

		if (dialog.returnValue === "delete" && currentDeleteId.current) {
			handleDelete(currentDeleteId.current);
		}
	};

	const handleDelete = async (id: number) => {
		if (!user) return;

		setDeletingId(id);
		try {
			const result = await deleteAgent(id, user.id);
			if (result.success) {
				setAgents((prev) => prev.filter((agent) => agent.id !== id));
			} else {
				alert(result.error || "删除 agent 失败");
			}
		} catch (error) {
			console.error("删除 agent 失败:", error);
			alert("删除 agent 失败");
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div>
			<div className="stats shadow mb-8">
				<div className="stat">
					<div className="stat-title">Agent 总数</div>
					<div className="stat-value">{agents.length}</div>
				</div>
				<div className="stat">
					<div className="stat-title">公开</div>
					<div className="stat-value text-info">
						{agents.filter((a) => a.isPublic).length}
					</div>
				</div>
				<div className="stat">
					<div className="stat-title">私有</div>
					<div className="stat-value text-secondary">
						{agents.filter((a) => !a.isPublic).length}
					</div>
				</div>
			</div>

			<h2 className="text-xl font-semibold mb-4">我的 Agent 库</h2>

			{loadingAgents ? (
				<SkeletonScreen />
			) : agents.length === 0 ? (
				<Empty title="Agent" href="/dashboard/agents/new" />
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					{agents.map((agent) => (
						<div key={agent.id} className="card bg-base-200">
							<div className="card-body">
								<div className="flex justify-between items-start gap-2">
									<div>
										<h3 className="card-title text-lg">{agent.name}</h3>
										<p className="text-xs text-base-content/60 mt-1">{agent.model}</p>
									</div>
									<div className={`badge ${agent.isPublic ? "badge-info" : "badge-primary"}`}>
										{agent.isPublic ? "公开" : "私有"}
									</div>
								</div>

								<p className="text-base-content/70 text-sm line-clamp-2">
									{agent.description || "暂无描述"}
								</p>

								<div className="card-actions justify-end mt-4">
									<Link
										href={`/dashboard/agents/${agent.id}/edit`}
										className="btn btn-sm"
									>
										<FaEdit />
									</Link>
									<button
										onClick={() => deleteDialogShow(agent.id)}
										className="btn btn-error btn-sm btn-outline"
										disabled={deletingId === agent.id}
									>
										{deletingId === agent.id ? (
											<span className="loading loading-spinner loading-xs"></span>
										) : (
											<MdDeleteForever />
										)}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<dialog
				ref={deleteDialogRef}
				onClose={deleteDialogOnClose}
				className="modal modal-bottom sm:modal-middle"
			>
				<div className="modal-box">
					<p className="py-4">确定要删除这个 agent 吗？此操作不可恢复。</p>
					<div className="modal-action">
						<form method="dialog">
							<button className="btn btn-error mr-4" value="delete">
								删除
							</button>
							<button className="btn">取消</button>
						</form>
					</div>
				</div>
			</dialog>
		</div>
	);
};

export default AgentCard;
