"use client";

import {useState, useEffect} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {updateSkill} from "@/actions/skills";

// 路由参数类型
interface PageProps {
    params: Promise<{ id: string }>;
}


export default function EditSkillPage({params}: PageProps) {
    const router = useRouter();
    const {user, isAuthenticated, isLoading} = useAuth(); // 获取用户认证状态

    // 表单状态管理
    const [skillId, setSkillId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingSkill, setLoadingSkill] = useState(true);

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
                    // 赋值到表单
                    setName(data.skill.name);
                    setDescription(data.skill.description);
                    setContent(data.skill.content);
                    setIsPublic(data.skill.isPublic);
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 校验必填字段
        if (!name.trim() || !description.trim() || !content.trim()) {
            setError("所有字段均为必填");
            return;
        }

        if (!skillId || !user) return;

        setIsSubmitting(true);

        try {
            // 调用服务端 action 更新
            const result = await updateSkill(
                skillId,
                {
                    name: name.trim(),
                    description: description.trim(),
                    content: content.trim(),
                    isPublic,
                },
                user.id
            );

            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "更新 skill 失败");
            }
        } catch (err) {
            setError("更新 skill 时发生错误");
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


    if (error && !name) {
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
                    <h1 className="card-title text-2xl">Edit Skill</h1>
                    <p className="text-base-content/70">
                        更新你的 agent skill 内容
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {error && (
                            <div className="alert alert-error">
                                <span>{error}</span>
                            </div>
                        )}


                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Skill Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., web-design-guidelines"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                            />
                        </div>


                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Brief description of what this skill does"
                                className="input input-bordered w-full"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                required
                            />
                        </div>


                        <div className="form-control w-full">
                            <label className="label">
                <span className="label-text font-medium">
                 Skill 内容（Markdown）
                </span>
                            </label>
                            <textarea
                                placeholder="Enter your skill content in markdown format..."
                                className="textarea textarea-bordered w-full h-64 font-mono text-sm"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>


                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                                <span className="label-text">将此 skill 设为公开</span>
                            </label>
                            <p className="text-sm text-base-content/60 ml-14">
                                公开的 skill 会展示在资源库中，任何人都可以查看。
                            </p>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/dashboard" className="btn btn-ghost">
                                返回
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        保存中…
                                    </>
                                ) : (
                                    "保存"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}