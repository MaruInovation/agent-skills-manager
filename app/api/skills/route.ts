import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// 获取当前登录用户创建的所有 skill 列表
export async function GET(request: NextRequest) {
    try {
        const includePublic = request.nextUrl.searchParams.get("includePublic") === "true";
        // 从请求 cookie 中获取认证 token
        const token = request.cookies.get("auth_token")?.value;

        // 未提供 token，返回未授权错误
        if (!token) {
            return NextResponse.json({ error: "token 无效" }, { status: 401 });
        }

        // 校验 token 有效性，获取用户信息
        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "token 无效" }, { status: 401 });
        }

        // 从数据库查询当前用户创建的所有 skill
        const skills = await prisma.skill.findMany({
            where: includePublic
                ? {
                    OR: [{ authorId: payload.userId }, { isPublic: true }],
                }
                : { authorId: payload.userId }, // 默认只查询当前用户的 skill
            orderBy: { createdAt: "desc" },      // 按创建时间倒序排列
            select: {                            // 只返回需要的字段，优化性能
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
            },
        });




        // 返回查询到的 skill 列表
        return NextResponse.json({ skills });
    } catch (error) {
        console.error("获取skill失败:", error);
        return NextResponse.json(
            { error: "服务器异常" },
            { status: 500 }
        );
    }
}
