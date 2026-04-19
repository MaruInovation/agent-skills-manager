import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// 路由参数类型定义
interface RouteParams {
    params: Promise<{ id: string }>;
}

// 获取单条 skill 详情（仅允许作者本人访问）
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // 解析并转换路由参数中的 ID
        const { id } = await params;
        const skillId = parseInt(id);

        // 校验 ID 是否为有效数字
        if (isNaN(skillId)) {
            return NextResponse.json({ error: "skill ID 无效" }, { status: 400 });
        }

        // 从 Cookie 中获取登录 token
        const token = request.cookies.get("auth_token")?.value;

        // 未登录直接返回 401
        if (!token) {
            return NextResponse.json({ error: "token 无效" }, { status: 401 });
        }

        // 校验 token 有效性，获取用户信息
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "token 无效" }, { status: 401 });
        }

        // 从数据库查询对应的 skill
        const skill = await prisma.skill.findUnique({
            where: { id: skillId },
            select: {
                id: true,
                name: true,
                description: true,
                isPublic: true,
                tags: true,
                inputSchema: true,
                outputSchema: true,
                content: true,
                errorHandling: true,
                examples: true,
                authorId: true
            },
        });

        // skill 不存在返回 404
        if (!skill) {
            return NextResponse.json({ error: "skill 不存在" }, { status: 404 });
        }

        // 权限校验：只有作者本人可以获取该 skill 详情
        if (skill.authorId !== payload.userId) {
            return NextResponse.json(
                { error: "只有作者本人可以获取该 skill 详情l" },
                { status: 403 }
            );
        }


        return NextResponse.json({ skill });
    } catch (error) {
        console.error("获取skill失败:", error);
        return NextResponse.json(
            { error: "服务器异常" },
            { status: 500 }
        );
    }
}
