import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
try {
const body = await request.json();
const response = NextResponse.json(
{
message: "路由 msg",
body,
},
{ status: 201 }
);

        return response;
    } catch (error) {
        console.error("skill/new API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }

}
