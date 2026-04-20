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

		const conversations = await prisma.chatMessage.findMany({
			where: { userId: payload.userId },
			orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
			select: {
				id: true,
				conversationId: true,
				message: true,
				agentId: true,
				updatedAt: true,
			},
		});

		return NextResponse.json({ conversations });
	} catch (error) {
		console.error("获取会话列表失败:", error);
		return NextResponse.json({ error: "服务器异常" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const token = request.cookies.get("auth_token")?.value;
		if (!token) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const payload = verifyToken(token);
		if (!payload) {
			return NextResponse.json({ error: "token 无效" }, { status: 401 });
		}

		const body = (await request.json()) as { conversationId?: string };
		const conversationId = body.conversationId?.trim();

		if (!conversationId) {
			return NextResponse.json({ error: "conversationId 不能为空" }, { status: 400 });
		}

		const result = await prisma.chatMessage.deleteMany({
			where: {
				userId: payload.userId,
				conversationId,
			},
		});

		return NextResponse.json({ deletedCount: result.count });
	} catch (error) {
		console.error("删除会话失败:", error);
		return NextResponse.json({ error: "服务器异常" }, { status: 500 });
	}
}
