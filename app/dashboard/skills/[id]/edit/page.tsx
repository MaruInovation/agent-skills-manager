"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { updateSkill } from "@/actions/skills";
import SkillForm from "@/dashboard/components/SkillForm";
import { SkillFormData } from "@/types/skill.type";

// 路由参数类型
interface PageProps {
	params: Promise<{ id: string }>;
}

export default function EditSkillPage({ params }: PageProps) {
	const router = useRouter();
	const { user, isAuthenticated, isLoading } = useAuth(); // 获取用户认证状态

	// 表单状态管理
	const [skillId, setSkillId] = useState<number | null>(null);
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [loadingSkill, setLoadingSkill] = useState(true);
	const [editForm, setEditForm] = useState<SkillFormData>();

	// 从路由参数获取 skill ID
	useEffect(() => {
		params.then((p) => setSkillId(parseInt(p.id)));
	}, [params]);

	// 未登录则重定向到登录页
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// 当 skillId 和用户存在时，加载 skill 数据
	useEffect(() => {
		if (skillId && user) {
			fetchSkill();
		}
	}, [skillId, user]);

	// 从 API 获取当前 skill 详情
	const fetchSkill = async () => {
		try {
			if (!skillId) return;

			// 请求接口，自动携带 cookie 认证
			const response = await fetch(`/api/skills/${skillId}`, {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();

				if (data.skill) {
					setEditForm(data.skill);
				}
			} else if (response.status === 404) {
				setError("加载 skill 失败");
			} else if (response.status === 403) {
				setError("你没有编辑这个 skill 的权限");
			}
		} catch (err) {
			setError("加载 skill 失败");
		} finally {
			setLoadingSkill(false);
		}
	};

	// 表单提交：更新 skill
	const onSubmit = async (data: SkillFormData) => {
		if (!skillId || !user?.id) return;
		setIsSubmitting(true);

		try {
			const res = await updateSkill(skillId, data, user.id);

			if (res.success) router.push("/dashboard");
			else alert(res.error || "编辑失败");
		} catch (err) {
			alert("编辑失败");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading || loadingSkill) {
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
				<Link href="/dashboard" className="btn btn-ghost mt-4">
					← 返回控制台
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-2xl">
			<div className="mb-6">
				<Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
					← 返回控制台
				</Link>
			</div>

			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h1 className="card-title text-2xl">编辑 Skill</h1>
					<p className="text-base-content/70">更新你的 agent skill 内容</p>

					<SkillForm
						onSubmit={onSubmit}
						isSubmitting={isSubmitting}
						defaultValues={editForm}
					/>
				</div>
			</div>
		</div>
	);
}
