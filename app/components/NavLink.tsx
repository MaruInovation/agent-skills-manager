import Link from "next/link";

const NavLink = ({
	isAuthenticated,
	className,
}: {
	isAuthenticated: boolean;
	className?: string;
}) => {
	return (
		<ul tabIndex={0} className={className}>
			{isAuthenticated && (
				<>
					<li className="bg-secondary rounded mr-10">
						<Link href="/chat">前往对话</Link>
					</li>
					<li>
						<Link href="/dashboard">控制台</Link>
					</li>
				</>
			)}
			<li>
				<Link href="/agents">浏览 Agent 库</Link>
			</li>
			<li>
				<Link href="/skills">浏览 Skill 库</Link>
			</li>
		</ul>
	);
};

export default NavLink;
