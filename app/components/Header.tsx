"use client";

import { useEffect, useState } from "react";
import { IoLanguage } from "react-icons/io5";
import Link from "next/link";
import { FiMoon, FiSun } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import NavLink from "./NavLink";

const AVATAR_BG_CLASSES = [
	"bg-blue-600",
	"bg-emerald-600",
	"bg-violet-600",
	"bg-amber-600",
	"bg-rose-600",
];

function getRandomAvatarBgClass() {
	return AVATAR_BG_CLASSES[Math.floor(Math.random() * AVATAR_BG_CLASSES.length)];
}

const RANDOM_AVATAR_BG_CLASS = getRandomAvatarBgClass();

export default function Header() {
	const { isAuthenticated, user, logout, isLoading } = useAuth();
	const [isLanguageOpen, setIsLanguageOpen] = useState(false);
	const [selectedLanguage, setSelectedLanguage] = useState<"en" | "zh-CN">("en");
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		if (typeof window === "undefined") {
			return "dark";
		}

		const savedTheme = window.localStorage.getItem("theme");
		const htmlTheme = document.documentElement.dataset.theme;

		if (savedTheme === "light" || savedTheme === "dark") {
			return savedTheme;
		}

		return htmlTheme === "light" ? "light" : "dark";
	});

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem("theme", theme);
	}, [theme]);

	const handleThemeChange = (nextTheme: "light" | "dark") => {
		setTheme(nextTheme);
	};

	const handleLanguageChange = (nextLanguage: "en" | "zh-CN") => {
		setSelectedLanguage(nextLanguage);
		setIsLanguageOpen(false);
		console.log(
			nextLanguage === "en"
				? "Selected language: English"
				: "Selected language: Simplified Chinese"
		);
	};

	return (
		<div className="navbar bg-base-200 shadow-lg">
			<div className="navbar-start">
				<div className="dropdown">
					<div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M4 6h16M4 12h8m-8 6h16"
							/>
						</svg>
					</div>

					<NavLink
						isAuthenticated={isAuthenticated}
						className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
					/>
				</div>

				<Link href="/" className="btn btn-ghost text-xl">
					🤖 Agent Skills
				</Link>
			</div>

			<div className="navbar-center hidden lg:flex">
				<NavLink isAuthenticated={isAuthenticated} className="menu menu-horizontal px-1" />
			</div>

			<div className="navbar-end">
				{isLoading ? (
					<span className="loading loading-spinner loading-sm"></span>
				) : isAuthenticated ? (
					<>
						<div className="relative">
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={() => setIsLanguageOpen((prev) => !prev)}
								aria-label="Language"
							>
								<IoLanguage size={20} />
							</button>
							{isLanguageOpen ? (
								<div className="absolute right-0 top-10 z-20 w-36 rounded-box border border-base-300 bg-base-100 p-2 shadow">
									<button
										type="button"
										className={`btn btn-sm mb-1 w-full justify-start ${
											selectedLanguage === "en" ? "btn-primary" : "btn-ghost"
										}`}
										onClick={() => handleLanguageChange("en")}
									>
										English
									</button>
									<button
										type="button"
										className={`btn btn-sm w-full justify-start ${
											selectedLanguage === "zh-CN"
												? "btn-primary"
												: "btn-ghost"
										}`}
										onClick={() => handleLanguageChange("zh-CN")}
									>
										{"简体中文"}
									</button>
								</div>
							) : null}
						</div>
						<div className="dropdown dropdown-end ml-4">
							<div
								tabIndex={0}
								role="button"
								className="btn btn-ghost btn-circle avatar placeholder"
							>
								<div
									className={`text-white w-10 rounded-full flex items-center justify-center ${RANDOM_AVATAR_BG_CLASS}`}
								>
									<div className="text-lg">
										{user?.name?.charAt(0).toUpperCase()}
									</div>
								</div>
							</div>
							<ul
								tabIndex={0}
								className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
							>
								<li className="menu-title">{user?.name}</li>
								<li className="px-0">
									<button
										type="button"
										aria-label="Toggle theme"
										title={
											theme === "dark" ? "Switch to light" : "Switch to dark"
										}
										onClick={() =>
											handleThemeChange(theme === "dark" ? "light" : "dark")
										}
										className="flex w-full items-center justify-start px-4 py-2 hover:!bg-transparent active:!bg-transparent focus:outline-none"
									>
										<span className="relative h-7 w-14 rounded-full border border-zinc-300 bg-transparent">
											<span
												className={`absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-700 shadow-sm transition-transform ${
													theme === "dark"
														? "translate-x-7"
														: "translate-x-0.5"
												}`}
											>
												{theme === "dark" ? (
													<FiMoon className="h-3.5 w-3.5" />
												) : (
													<FiSun className="h-3.5 w-3.5" />
												)}
											</span>
										</span>
									</button>
								</li>
								<li>
									<Link href="/dashboard">控制台</Link>
								</li>
								<li>
									<Link href="/chat">前往对话</Link>
								</li>
								<li>
									<button onClick={logout}>登出</button>
								</li>
							</ul>
						</div>
					</>
				) : (
					<div className="flex gap-2">
						<Link href="/login" className="btn btn-ghost btn-sm">
							登录
						</Link>
						<Link href="/register" className="btn btn-primary btn-sm">
							注册
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
