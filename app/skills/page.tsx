import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export const metadata = {
	title: "浏览 Skill | Agent Skills 管理工具",
	description: "探索社区创建的公开 AI agent skill",
};

// 获取公开 skill 列表
async function getPublicSkills() {
	const skills = await prisma.skill.findMany({
		where: { isPublic: true },
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			authorId: true,
		},
		orderBy: { createdAt: "desc" },
	});

	const authorIds = [...new Set(skills.map((skill) => skill.authorId))];
	const authors = await prisma.user.findMany({
		where: { id: { in: authorIds } },
		select: { id: true, name: true },
	});
	const authorNameById = new Map(authors.map((author) => [author.id, author.name]));

	return skills.map((skill) => ({
		...skill,
		authorName: authorNameById.get(skill.authorId) ?? `User #${skill.authorId}`,
	}));
}

export default async function SkillsPage() {
	const skills = await getPublicSkills();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold">公共 Skill 库</h1>
					<p className="text-base-content/70 mt-2">本页面使用 ISR，每 60 秒刷新一次</p>
				</div>
				<div className="badge badge-secondary badge-lg">ISR: 60s</div>
			</div>

			{skills.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-6xl mb-4">📭</div>
					<h2 className="text-xl font-semibibold mb-2">暂无 skill</h2>
					<p className="text-base-content/70 mb-4">成为第一个创建 skill 的用户吧！</p>
					<Link href="/dashboard/skills/new" className="btn btn-primary">
						开始创建
					</Link>
				</div>
			) : (
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{skills.map((skill) => (
						<Link
							key={skill.id}
							href={`/skills/${skill.id}`}
							className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
						>
							<div className="card-body">
								<h2 className="card-title">{skill.name}</h2>
								<p className="text-base-content/70 line-clamp-2">
									{skill.description}
								</p>
								<div className="card-actions justify-between items-center mt-4">
									<span className="text-sm text-base-content/60">
										作者 {skill.authorName}
									</span>
									<span className="text-xs text-base-content/50">
										{new Date(skill.createdAt).toLocaleDateString()}
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
