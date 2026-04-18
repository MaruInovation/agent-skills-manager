import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Email, password and name are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Email is already registered" },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            name: user.name,
        });

        const response = NextResponse.json(
            {
                message: "Register success",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
            { status: 201 }
        );

        setAuthCookie(response, token);

        return response;
    } catch (error) {
        console.error("Register API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
