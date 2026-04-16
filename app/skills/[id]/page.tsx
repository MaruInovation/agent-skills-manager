import {notFound} from "next/navigation";
import Link from "next/link";
import {prisma} from "@/lib/prisma";


export const revalidate = 60;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({params}: PageProps) {
    const {id} = await params;
    const skill = await prisma.skill.findUnique({
        where: {id: parseInt(id)},
        select: {name: true, description: true},
    });

    if (!skill) {
        return {title: "Skill 不存在"};
    }

    return {
        title: `${skill.name} | Agent Skills Manager`,
        description: skill.description,
    };
}

async function getSkill(id: string) {
    const skill = await prisma.skill.findUnique({
        where: {id: parseInt(id), isPublic: true},
        include: {
            author: {
                select: {name: true},
            },
        },
    });
    return skill;
}

export default async function SkillDetailPage({params}: PageProps) {
    const {id} = await params;
    const skill = await getSkill(id);

    if (!skill) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <Link href="/skills" className="btn btn-ghost btn-sm gap-2">
                    ← 返回Skill 库
                </Link>
            </div>

            <article className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">{skill.name}</h1>
                            <p className="text-base-content/70 mt-2">{skill.description}</p>
                        </div>
                        <div className="badge badge-secondary">ISR</div>
                    </div>

                    <div className="divider"></div>

                    <div className="flex gap-4 text-sm text-base-content/60 mb-4">
                        <span> {skill.author.name}</span>
                        <span>•</span>
                        <span>创建于 {new Date(skill.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>更新于 {new Date(skill.updatedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="bg-base-300 rounded-lg p-6">
                        <pre className="skill-content whitespace-pre-wrap text-sm">
                            {skill.content}
                        </pre>
                    </div>
                </div>
            </article>
        </div>
    );
}