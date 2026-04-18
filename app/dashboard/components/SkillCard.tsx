import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { deleteSkill } from "@/actions/skills";
import SkeletonScreen from "./SkeletonScreen";
import Empty from "./Empty";

// Skill 数据类型定义
interface Skill {
	id: number;
	name: string;
	//描述
	description: string;
	//是否公共
	isPublic: boolean;
	//创建时间
	createdAt: string;
}

const SkillCard = () => {
	const router = useRouter();
	// 认证相关：用户信息、是否登录、加载状态
	const { user, isAuthenticated, isLoading } = useAuth();
	//删除弹框
	const deleteDialogRef = useRef<HTMLDialogElement>(null);
	//要删除的skill ID
	const currentDeleteId = useRef<number | null>(null);
	// 存储 skill 列表
	const [skills, setSkills] = useState<Skill[]>([]);
	// skill 列表加载状态
	const [loadingSkills, setLoadingSkills] = useState(true);
	// 正在删除的 skill ID（用于按钮禁用和加载状态）
	const [deletingId, setDeletingId] = useState<number | null>(null);

	// 监听认证状态：未登录则跳转到登录页
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// 监听用户信息：用户登录后获取 skill 列表
	useEffect(() => {
		if (user) {
			fetchUserSkills();
		}
	}, [user]);

	/**
	 * 获取当前用户的 skill 列表
	 * 自动携带 cookie 进行身份验证
	 */
	const fetchUserSkills = async () => {
		try {
			// 发送请求获取 skill 数据，credentials: include 自动携带 cookie
			const response = await fetch("/api/skills", {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				// 更新 skill 列表
				setSkills(data.skills || []);
			}
		} catch (error) {
			console.error("获取 skill 失败:", error);
		} finally {
			// 无论成功失败，关闭加载状态
			setLoadingSkills(false);
		}
	};

	//删除弹框开启
	const deleteDialogShow = (id: number) => {
		currentDeleteId.current = id;
		deleteDialogRef.current?.showModal();
	};

	//删除弹框关闭
	const deleteDialogOnClose = () => {
		const dialog = deleteDialogRef.current;
		if (!dialog) return;

		if (dialog.returnValue === "delete") {
			if (currentDeleteId.current) {
				handleDelete(currentDeleteId.current);
			}
		}
	};

	/**
	 * 删除 skill
	 * @param id 要删除的 skill ID
	 */
	const handleDelete = async (id: number) => {
		// 未登录 或 取消删除则直接返回
		if (!user) return;

		// 设置正在删除的 ID，禁用删除按钮
		setDeletingId(id);
		try {
			// 调用服务端 action 删除 skill
			const result = await deleteSkill(id, user.id);
			if (result.success) {
				// 删除成功，更新前端列表
				setSkills(skills.filter((s) => s.id !== id));
			} else {
				alert(result.error || "删除 skill 失败");
			}
		} catch (error) {
			console.error("删除错误:", error);
			alert("删除 skill 失败");
		} finally {
			// 重置删除状态
			setDeletingId(null);
		}
	};

	return (
		<div>
			{/* 数据统计卡片 */}
			<div className="stats shadow mb-8">
				<div className="stat">
					<div className="stat-title">Skill 总数</div>
					<div className="stat-value">{skills.length}</div>
				</div>
				<div className="stat">
					<div className="stat-title">公开</div>
					<div className="stat-value text-primary">
						{skills.filter((s) => s.isPublic).length}
					</div>
				</div>
				<div className="stat">
					<div className="stat-title">私有</div>
					<div className="stat-value text-secondary">
						{skills.filter((s) => !s.isPublic).length}
					</div>
				</div>
			</div>

			<h2 className="text-xl font-semibold mb-4">我的 Skill 库</h2>

			{/* Skill 列表区域：三种状态：加载中 / 无数据 / 正常列表 */}
			{loadingSkills ? (
				// 加载中：骨架屏占位
				<SkeletonScreen />
			) : skills.length === 0 ? (
				// 无数据：空状态提示
				<Empty title="Skill" href="/dashboard/skills/new" />
			) : (
				// 正常渲染 Skill 列表
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
					{skills.map((skill) => (
						<div key={skill.id} className="card bg-base-200">
							<div className="card-body">
								{/* Skill 标题 + 公开/私有标签 */}
								<div className="flex justify-between items-start">
									<h3 className="card-title text-lg">{skill.name}</h3>
									<div
										className={`badge ${skill.isPublic ? "badge-success" : "badge-primary"}`}
									>
										{skill.isPublic ? "公开" : "私有"}
									</div>
								</div>
								{/* Skill 描述（最多显示两行） */}
								<p className="text-base-content/70 text-sm line-clamp-2">
									{skill.description}
								</p>
								{/* 操作按钮：编辑 / 删除 */}
								<div className="card-actions justify-end mt-4">
									<Link
										href={`/dashboard/skills/${skill.id}/edit`}
										className="btn btn-sm"
									>
										<FaEdit />
									</Link>
									<button
										onClick={() => deleteDialogShow(skill.id)}
										className="btn btn-error btn-sm btn-outline"
										disabled={deletingId === skill.id}
									>
										{deletingId === skill.id ? (
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
					<p className="py-4">确定要删除这个 skill 吗？此操作不可恢复！</p>
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

export default SkillCard;
