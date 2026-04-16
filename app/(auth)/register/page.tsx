"use client";

import { useState ,useEffect} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";


export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    // 加载中或已认证时，返回 null 或加载状态
    if (isLoading || isAuthenticated) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("密码不匹配");
            return;
        }

        if (password.length < 6) {
            setError("密码至少为 6 个字符");
            return;
        }

        setIsSubmitting(true);

        try {
            await register({ email, password, name });
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "注册失败");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <h2 className="card-title text-2xl justify-center">创建账号</h2>
            <p className="text-center text-base-content/70">
                加入以创建和分享 Agent Skills
            </p>

            <form onSubmit={handleSubmit} className="mt-4">
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}

                <div className="form-control">
                    <label className="label">
                        <span className="label-text">用户名</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入用户名"
                        className="input input-bordered w-full"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">邮箱</span>
                    </label>
                    <input
                        type="email"
                        placeholder="请输入邮箱"
                        className="input input-bordered w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">密码</span>
                    </label>
                    <input
                        type="password"
                        placeholder="请输入密码"
                        className="input input-bordered w-full"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-control mt-4">
                    <label className="label">
                        <span className="label-text">确认密码</span>
                    </label>
                    <input
                        type="password"
                        placeholder="请再次输入密码"
                        className="input input-bordered w-full"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="form-control mt-6">
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            "创建账户"
                        )}
                    </button>
                </div>
            </form>

            <div className="divider">OR</div>

            <p className="text-center">
                已有账号?{" "}
                <Link href="/login" className="link link-primary">
                    登录
                </Link>
            </p>
        </>
    );
}