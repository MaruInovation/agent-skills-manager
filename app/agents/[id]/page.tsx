import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MarkdownViewer from "@/components/MarkdownViewer";

export const revalidate = 60;

interface PageProps {
	params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
	const { id } = await params;
	const agent = await prisma.agent.findUnique({
		where: { id: parseInt(id) },
		select: { name: true, description: true },
	});

	if (!agent) {
		return { title: "Agent 不存在" };
	}

	return {
		title: `${agent.name} | Agent Skills Manager`,
		description: agent.description ?? "公开 Agent 详情",
	};
}

async function getAgent(id: string) {
	const agent = await prisma.agent.findUnique({
		where: {
			id: parseInt(id),
			isPublic: true,
		},
		include: {
			author: {
				select: { name: true },
			},
			skills: {
				select: {
					id: true,
					name: true,
					description: true,
				},
			},
		},
	});

	return agent;
}

export default async function AgentDetailPage({ params }: PageProps) {
	const { id } = await params;
	const agent = await getAgent(id);

	if (!agent) {
		notFound();
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<div className="mb-6">
				<Link href="/agents" className="btn btn-ghost btn-sm gap-2">
					← 返回 Agent 库
				</Link>
			</div>

			<article className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<div className="flex justify-between items-start gap-4">
						<div>
							<h1 className="text-3xl font-bold">{agent.name}</h1>
							<p className="text-base-content/70 mt-2">
								{agent.description || "暂无描述"}
							</p>
						</div>
						<div className="badge badge-info">ISR</div>
					</div>

					<div className="divider"></div>

					<div className="flex flex-wrap gap-4 text-sm text-base-content/60 mb-4">
						<span>作者 {agent.author.name}</span>
						<span>创建于 {new Date(agent.createdAt).toLocaleDateString()}</span>
						<span>更新于 {new Date(agent.updatedAt).toLocaleDateString()}</span>
					</div>

					<div className="grid md:grid-cols-3 gap-4">
						<div className="stat bg-base-300 rounded-box">
							<div className="stat-title">模型</div>
							<div className="stat-value text-lg">{agent.model}</div>
						</div>
						<div className="stat bg-base-300 rounded-box">
							<div className="stat-title">温度</div>
							<div className="stat-value text-lg">{agent.temperature}</div>
						</div>
						<div className="stat bg-base-300 rounded-box">
							<div className="stat-title">绑定 Skill</div>
							<div className="stat-value text-lg">{agent.skills.length}</div>
						</div>
					</div>

					<div className="mt-4">
						<label className="label">
							<span className="label-text">系统会话</span>
						</label>
						<div className="bg-base-300 rounded-lg p-6">
							<MarkdownViewer content={agent.systemContent} />
						</div>
					</div>

					<div className="mt-4">
						<label className="label">
							<span className="label-text">Skill 列表</span>
						</label>
						{agent.skills.length === 0 ? (
							<div className="alert alert-info">
								<span>当前 agent 未绑定 skill。</span>
							</div>
						) : (
							<div className="flex flex-wrap gap-2">
								{agent.skills.map((skill) => (
									<Link
										key={skill.id}
										href={`/skills/${skill.id}`}
										className="badge badge-outline badge-lg hover:badge-primary"
									>
										{skill.name}
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</article>
		</div>
	);
}
