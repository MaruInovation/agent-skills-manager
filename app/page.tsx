import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="min-h-[calc(100vh-8rem)]">
			<section className="hero min-h-[60vh] bg-linear-to-br from-primary/20 via-base-100 to-secondary/20">
				<div className="hero-content text-center">
					<div className="max-w-2xl">
						<h1 className="text-5xl font-bold">
							<span>创建&分享</span>
							<span className="text-info"> Agent</span>
							<span className="text-primary"> Skills</span>
						</h1>
						<p className="py-6 text-lg opacity-80">
							使用 Markdown 创建强大的 AI Agent Skills。
						</p>
						<div className="flex gap-4 justify-center">
							<Link
								href="/agents"
								className="btn btn-info btn-lg"
							>
								浏览 Agent 库
							</Link>
							<Link
								href="/skills"
								className="btn btn-primary btn-lg"
							>
								浏览 Skill 库
							</Link>
							<Link
								href="/chat"
								className="btn btn-outline btn-lg"
							>
								开始使用
							</Link>
						</div>
					</div>
				</div>
			</section>

			<section className="py-16 px-4">
				<div className="container mx-auto">
					<h2 className="text-3xl font-bold text-center mb-12">
						已演示的渲染策略
					</h2>
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
						<div className="card bg-base-200 shadow-xl">
							<div className="card-body">
								<h3 className="card-title text-primary">
									📄 SSG（静态生成）
								</h3>
								<p>
									构建时一次性生成好页面，访问最快，适合首页、文档。
								</p>
								<div className="badge badge-outline">
									当前页
								</div>
							</div>
						</div>

						<div className="card bg-base-200 shadow-xl">
							<div className="card-body">
								<h3 className="card-title text-secondary">
									🔄 ISR（增量静态更新）
								</h3>
								<p>
									先生成静态页，后台自动悄悄更新，不用重新构建，适合经常变但不极端实时的内容。
								</p>
								<div className="badge badge-outline">
									/skills
								</div>
							</div>
						</div>

						<div className="card bg-base-200 shadow-xl">
							<div className="card-body">
								<h3 className="card-title text-accent">
									⚡ SSR（服务端渲染）
								</h3>
								<p>
									每次访问都在服务器现拼页面，首屏 SEO
									好、数据实时，压力稍大。t.
								</p>
								<div className="badge badge-outline">
									/dashboard
								</div>
							</div>
						</div>

						<div className="card bg-base-200 shadow-xl">
							<div className="card-body">
								<h3 className="card-title text-warning">
									🎯 CSR（客户端渲染）
								</h3>
								<p>
									前端 JS
									接管渲染，首次慢、交互流畅，适合后台管理、纯前端应用。
								</p>
								<div className="badge badge-outline">
									/login
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="py-12 bg-base-200">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-2xl font-bold mb-8">技术栈</h2>
					<div className="flex flex-wrap justify-center gap-4">
						<div className="badge badge-lg badge-primary gap-2">
							Next.js 16
						</div>
						<div className="badge badge-lg badge-secondary gap-2">
							React 19
						</div>
						<div className="badge badge-lg badge-accent gap-2">
							Prisma 7
						</div>
						<div className="badge badge-lg badge-info gap-2">
							MySQL
						</div>
						<div className="badge badge-lg badge-success gap-2">
							DaisyUI
						</div>
						<div className="badge badge-lg gap-2">
							Tailwind CSS 4
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
