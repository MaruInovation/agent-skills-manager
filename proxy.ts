import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthTokenPayload = {
	exp?: number;
};

function isValidAuthToken(token: string | undefined): boolean {
	if (!token) return false;

	try {
		const payload = JSON.parse(
			Buffer.from(token, "base64").toString("utf-8")
		) as AuthTokenPayload;

		return typeof payload.exp === "number" && payload.exp > Date.now();
	} catch {
		return false;
	}
}

export function proxy(request: NextRequest) {
	const token = request.cookies.get("auth_token")?.value;

	if (!isValidAuthToken(token)) {
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("from", request.nextUrl.pathname + request.nextUrl.search);
		return NextResponse.redirect(loginUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/chat/:path*"],
};
