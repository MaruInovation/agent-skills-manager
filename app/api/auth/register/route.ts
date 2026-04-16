import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

// 用户注册接口
export async function POST(request: NextRequest) {
    try {
        // 获取请求体数据
        const body = await request.json();
        const { email, password, name } = body;

        // 校验必填参数
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "邮箱、密码和姓名均为必填项" },
                { status: 400 }
            );
        }

        // 检查邮箱是否已被注册
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "该邮箱已被注册" },
                { status: 409 }
            );
        }

        // 加密密码并创建用户
        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // 生成登录令牌
        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });

        // 构造响应结果
        const response = NextResponse.json(
            {
                message: "用户注册成功",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );

        // 设置安全Cookie，保持登录状态
        setAuthCookie(response, token);

        return response;
    } catch (error) {
        // 打印错误日志并返回服务端异常
        console.error("注册接口异常：", error);
        return NextResponse.json(
            { error: "服务器内部错误" },
            { status: 500 }
        );
    }
}