import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get("auth_token")?.value;

		if (!token) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const agents = await prisma.agent.findMany({
			where: { authorId: payload.userId },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				description: true,
				model: true,
				temperature: true,
				isPublic: true,
				createdAt: true,
				skills: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		return NextResponse.json({ agents });
	} catch (error) {
		console.error("Get agents error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
