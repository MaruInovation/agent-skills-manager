import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
export const revalidate = 60;

export const metadata = {
	title: "浏览 Agent | Agent Skills 管理工具",
	description: "探索社区创建的公开 AI agent",
};

async function getPublicAgents() {
	const publicAgentSelect = {
		id: true,
		name: true,
		description: true,
		model: true,
		temperature: true,
		createdAt: true,
		authorId: true,
		skills: {
			select: { id: true },
		},
	} satisfies Prisma.AgentSelect;

	type PublicAgent = Prisma.AgentGetPayload<{ select: typeof publicAgentSelect }>;
	const agents = (await prisma.agent.findMany({
		where: { isPublic: true },
		select: publicAgentSelect,
		orderBy: { createdAt: "desc" },
	})) as unknown as PublicAgent[];

	const authorIds = [...new Set(agents.map((agent) => agent.authorId))];
	const authors = await prisma.user.findMany({
		where: { id: { in: authorIds } },
		select: { id: true, name: true },
	});
	const authorNameById = new Map(authors.map((author) => [author.id, author.name]));

	return agents.map((agent) => ({
		...agent,
		authorName: authorNameById.get(agent.authorId) ?? `User #${agent.authorId}`,
		skillCount: agent.skills.length,
	}));
}

export default async function AgentsPage() {
	const agents = await getPublicAgents();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">公共 Agent 库</h1>
					<p className="text-base-content/70 mt-2">本页面使用 ISR，每 60 秒刷新一次。</p>
				</div>
				<div className="badge badge-secondary badge-lg">ISR: 60s</div>
			</div>

			{agents.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-6xl mb-4">🤖</div>
					<h2 className="text-xl font-semibold mb-2">暂无 Agent</h2>
					<p className="text-base-content/70 mb-4">成为第一个创建 Agent 的用户吧！</p>
					<Link href="/dashboard/agents/new" className="btn btn-info">
						开始创建
					</Link>
				</div>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{agents.map((agent) => (
						<Link
							key={agent.id}
							href={`/agents/${agent.id}`}
							className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
						>
							<div className="card-body">
								<div className="flex justify-between items-start gap-2">
									<h2 className="card-title">{agent.name}</h2>
									<div className="badge badge-info">{agent.model}</div>
								</div>

								<p className="text-base-content/70 line-clamp-2">
									{agent.description || "暂无描述"}
								</p>

								<div className="flex items-center gap-2 text-xs text-base-content/60">
									<span>温度 {agent.temperature}</span>
									<span>•</span>
									<span>{agent.skillCount} 个 Skill</span>
								</div>

								<div className="card-actions justify-between items-center mt-4">
									<span className="text-sm text-base-content/60">
										作者 {agent.authorName}
									</span>
									<span className="text-xs text-base-content/50">
										{new Date(agent.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
