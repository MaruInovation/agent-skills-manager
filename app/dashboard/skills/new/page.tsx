"use client"; // 标记为客户端组件

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { createSkill } from "@/actions/skills";

// 创建新 skill 页面
export default function NewSkillPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth(); // 获取用户认证状态

    // 表单状态管理
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 如果未加载完成且未登录，跳转到登录页
    if (!isLoading && !isAuthenticated) {
        router.push("/login");
        return null;
    }

    // 表单提交处理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // 校验必填字段
        if (!name.trim() || !description.trim() || !content.trim()) {
            setError("所有字段均为必填");
            return;
        }

        setIsSubmitting(true);

        try {
            // 调用服务端 action 创建 skill
            const result = await createSkill(
                {
                    name: name.trim(),
                    description: description.trim(),
                    content: content.trim(),
                    isPublic,
                },
                user!.id // 传入当前登录用户 ID
            );

            if (result.success) {
                // 创建成功，跳转到控制台
                router.push("/dashboard");
            } else {
                setError(result.error || "创建 skill 失败");
            }
        } catch (err) {
            setError("创建 skill 时发生错误");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 加载状态显示
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
                <Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
                    ← 返回控制台
                </Link>
            </div>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl">创建新 Skill</h1>
                    <p className="text-base-content/70">
                        使用 Markdown 格式定义你的 agent skill
                    </p>

                    <form onSubmit={handleSubmit} className="mt-4">
                        {/* 错误提示 */}
                        {error && (
                            <div className="alert alert-error mb-4">
                                <span>{error}</span>
                            </div>
                        )}


                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Skill 名称</span>
                            </label>
                            <input
                                type="text"
                                placeholder="例如：my-skill"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                                required
                            />
                        </div>


                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">描述</span>
                            </label>
                            <input
                                type="text"
                                placeholder="简要说明此 skill 的作用"
                                className="input input-bordered w-full"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                maxLength={500}
                                required
                            />
                        </div>


                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Skill 内容 (Markdown)</span>
                            </label>
                            <textarea
                                placeholder="输入你的 skill 内容"
                                className="textarea textarea-bordered w-full h-64 font-mono text-sm skill-content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            />
                        </div>


                        <div className="form-control mt-4">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-primary"
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                                <span className="label-text">公开 skill</span>
                            </label>
                            <p className="text-sm text-base-content/60 ml-14">
                                公开的 skill 会显示在资源库中，所有人均可查看
                            </p>
                        </div>


                        <div className="card-actions justify-end mt-6">
                            <Link href="/dashboard" className="btn btn-ghost">
                                取消
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        创建中...
                                    </>
                                ) : (
                                    "创建 Skill"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}