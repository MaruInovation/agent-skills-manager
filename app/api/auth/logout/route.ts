import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth";

export async function POST() {
    const response = NextResponse.json({ message: "已退出登录" });
    clearAuthCookie(response);
    return response;
}
