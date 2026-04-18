

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        console.log(body)

        if (!email || !password) {
            return NextResponse.json(
                { error: "邮箱和密码必填" },
                { status: 400 },
            );
        }


        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return NextResponse.json(
                { error: "用户不存在" },
                { status: 401 },
            );
        }


        const isValidPassword = await verifyPassword(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: "密码无效" },
                { status: 401 },
            );
        }


        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });


        const response = NextResponse.json({
            message: "登录成功",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });


        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error("登录异常:", error);
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 },
        );
    }
}
