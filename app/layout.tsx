import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Providers } from "@/components/Providers";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Agent Skills Manager",
	description:
		"创建、管理并分享 AI Agent Skills。这是一个 Next.js 演示项目，展示了 SSG、SSR、ISR 及 CSR 渲染模式，并集成了 Prisma 与 DaisyUI。",
	openGraph: {
		title: "Agent Skills Manager",
		description: "公开创建、管理和分享 AI Agent Skills",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" data-theme="dark">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
			>
				<Providers>
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
