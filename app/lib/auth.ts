import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// 密码加密强度，数值越高加密越慢越安全
const SALT_ROUNDS = 10;
// 登录令牌有效期，从环境变量读取，默认24小时
const TOKEN_EXPIRY_HOURS = parseInt(process.env.AUTH_TOKEN_EXPIRY_HOURS || "24");
// 认证Cookie的名称
const AUTH_COOKIE_NAME = "auth_token";

/**
 * 登录令牌的数据结构
 */
export interface TokenPayload {
    userId: number;    // 用户ID
    email: string;     // 用户邮箱
    name: string;      // 用户名
    exp: number;       // 令牌过期时间戳
}

/**
 * 对用户密码进行加密
 * @param password 明文密码
 * @returns 加密后的密码字符串
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 校验明文密码与加密密码是否匹配
 * @param password 明文密码
 * @param hash 数据库中存储的加密密码
 * @returns 校验结果：true匹配/false不匹配
 */
export async function verifyPassword(
    password: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * 生成用户登录令牌（Base64编码）
 * 生产环境建议使用标准JWT库替代
 * @param user 用户基础信息
 * @returns 加密后的登录令牌
 */
export function generateToken(user: {
    id: number;
    email: string;
    name: string;
}): string {
    // 组装令牌数据，包含过期时间
    const payload: TokenPayload = {
        userId: user.id,
        email: user.email,
        name: user.name,
        exp: Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000,
    };

    // 转为JSON字符串后进行Base64编码
    return Buffer.from(JSON.stringify(payload)).toString("base64");
}

/**
 * 校验并解析登录令牌
 * @param token 前端传递的令牌字符串
 * @returns 解析后的用户信息 | null（令牌无效/过期）
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        // Base64解码并转为JSON对象
        const payload = JSON.parse(
            Buffer.from(token, "base64").toString("utf-8")
        ) as TokenPayload;

        // 校验令牌是否过期
        if (payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch {
        // 解码/解析失败，令牌无效
        return null;
    }
}

/**
 * 设置认证Cookie到响应头（安全配置）
 * @param response Next响应对象
 * @param token 登录令牌
 */
export function setAuthCookie(response: NextResponse, token: string): void {
    response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,    // 禁止JS访问，防止XSS攻击
        secure: process.env.NODE_ENV === "production", // 生产环境启用HTTPS-only
        sameSite: "lax",   // 防止CSRF跨站请求伪造
        maxAge: TOKEN_EXPIRY_HOURS * 60 * 60, // Cookie有效期（秒）
        path: "/",         // 全站生效
    });
}

/**
 * 清除认证Cookie（用户登出时调用）
 * @param response Next响应对象
 */
export function clearAuthCookie(response: NextResponse): void {
    response.cookies.set(AUTH_COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,  // 立即过期
        path: "/",
    });
}

/**
 * 从Cookie中获取登录令牌（服务端组件/服务端动作使用）
 * @returns 令牌 | null
 */
export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * 获取当前登录用户信息（服务端组件/服务端动作使用）
 * @returns 用户信息 | null（未登录）
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
    const token = await getAuthToken();
    if (!token) return null;
    return verifyToken(token);
}

/**
 * 从请求头的Cookie中提取登录令牌（API路由使用）
 * @param request 请求对象
 * @returns 令牌 | null
 */
export function extractTokenFromRequest(request: Request): string | null {
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) return null;

    // 解析Cookie字符串为键值对
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies[AUTH_COOKIE_NAME] ?? null;
}