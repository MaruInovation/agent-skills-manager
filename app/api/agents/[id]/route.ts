import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	try {
		const { id } = await params;
		const agentId = parseInt(id);

		if (isNaN(agentId)) {
			return NextResponse.json({ error: "agent ID 无效" }, { status: 400 });
		}

		const token = request.cookies.get("auth_token")?.value;
		if (!token) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const agent = await prisma.agent.findUnique({
			where: { id: agentId },
			select: {
				id: true,
				name: true,
				description: true,
				systemContent: true,
				model: true,
				temperature: true,
				isPublic: true,
				authorId: true,
				skills: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!agent) {
			return NextResponse.json({ error: "agent 不存在" }, { status: 404 });
		}

		if (agent.authorId !== payload.userId) {
			return NextResponse.json(
				{ error: "只有作者本人可以获取该 agent 详情" },
				{ status: 403 }
			);
		}

		return NextResponse.json({
			agent: {
				...agent,
				skillIds: agent.skills.map((skill) => skill.id),
			},
		});
	} catch (error) {
		console.error("获取agent失败:", error);
		return NextResponse.json({ error: "服务器异常" }, { status: 500 });
	}
}
