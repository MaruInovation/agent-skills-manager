import "./css/MarkdownViewer.css";

import Link from "next/link";
import type { ReactNode } from "react";

type MarkdownViewerProps = {
	content?: string | null;
	className?: string;
};

function parseInline(text: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\(([^)]+)\))/g;
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = pattern.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		const token = match[0];
		if (token.startsWith("`") && token.endsWith("`")) {
			nodes.push(
				<code className="markdown-inline-code" key={`${match.index}-${token}`}>
					{token.slice(1, -1)}
				</code>
			);
		} else if (token.startsWith("**") && token.endsWith("**")) {
			nodes.push(<strong key={`${match.index}-${token}`}>{token.slice(2, -2)}</strong>);
		} else {
			const linkTextMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
			if (linkTextMatch) {
				const [, label, href] = linkTextMatch;
				const isExternal = /^https?:\/\//.test(href);
				nodes.push(
					<Link
						className="link link-primary"
						href={href}
						key={`${match.index}-${token}`}
						rel={isExternal ? "noopener noreferrer" : undefined}
						target={isExternal ? "_blank" : undefined}
					>
						{label}
					</Link>
				);
			} else {
				nodes.push(token);
			}
		}

		lastIndex = pattern.lastIndex;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

function renderParagraph(text: string, key: string) {
	const lines = text.split("\n");
	return (
		<p key={key} className="leading-7">
			{lines.map((line, index) => (
				<span key={`${key}-line-${index}`}>
					{parseInline(line)}
					{index < lines.length - 1 ? <br /> : null}
				</span>
			))}
		</p>
	);
}

export default function MarkdownViewer({ content, className }: MarkdownViewerProps) {
	if (!content?.trim()) {
		return <p className="text-base-content/50 text-sm">暂无内容</p>;
	}

	const lines = content.replace(/\r\n/g, "\n").split("\n");
	const blocks: ReactNode[] = [];
	let i = 0;

	while (i < lines.length) {
		const line = lines[i];
		const trimmed = line.trim();

		if (!trimmed) {
			i += 1;
			continue;
		}

		if (trimmed.startsWith("```")) {
			const language = trimmed.slice(3).trim();
			i += 1;
			const codeLines: string[] = [];
			while (i < lines.length && !lines[i].trim().startsWith("```")) {
				codeLines.push(lines[i]);
				i += 1;
			}
			if (i < lines.length) {
				i += 1;
			}
			blocks.push(
				<pre className="markdown-code-block" key={`code-${i}`}>
					{language ? <span className="markdown-code-lang">{language}</span> : null}
					<code>{codeLines.join("\n")}</code>
				</pre>
			);
			continue;
		}

		const heading = line.match(/^(#{1,6})\s+(.*)$/);
		if (heading) {
			const level = heading[1].length;
			const title = heading[2];
			const sizeClass =
				level === 1
					? "text-2xl"
					: level === 2
						? "text-xl"
						: level === 3
							? "text-lg"
							: "text-base";
			blocks.push(
				<h3 className={`font-bold mt-4 ${sizeClass}`} key={`heading-${i}`}>
					{parseInline(title)}
				</h3>
			);
			i += 1;
			continue;
		}

		if (/^[-*+]\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
				i += 1;
			}
			blocks.push(
				<ul className="list-disc pl-6 space-y-1" key={`ul-${i}`}>
					{items.map((item, index) => (
						<li key={`ul-item-${index}`}>{parseInline(item)}</li>
					))}
				</ul>
			);
			continue;
		}

		if (/^\d+\.\s+/.test(trimmed)) {
			const items: string[] = [];
			while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
				items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
				i += 1;
			}
			blocks.push(
				<ol className="list-decimal pl-6 space-y-1" key={`ol-${i}`}>
					{items.map((item, index) => (
						<li key={`ol-item-${index}`}>{parseInline(item)}</li>
					))}
				</ol>
			);
			continue;
		}

		if (/^>\s?/.test(trimmed)) {
			const quoteLines: string[] = [];
			while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
				quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
				i += 1;
			}
			blocks.push(
				<blockquote
					className="border-l-4 border-base-content/30 pl-4 italic"
					key={`quote-${i}`}
				>
					{parseInline(quoteLines.join(" "))}
				</blockquote>
			);
			continue;
		}

		const paragraphLines: string[] = [];
		while (
			i < lines.length &&
			lines[i].trim() &&
			!lines[i].trim().startsWith("```") &&
			!lines[i].match(/^(#{1,6})\s+/) &&
			!/^[-*+]\s+/.test(lines[i].trim()) &&
			!/^\d+\.\s+/.test(lines[i].trim()) &&
			!/^>\s?/.test(lines[i].trim())
		) {
			paragraphLines.push(lines[i]);
			i += 1;
		}
		blocks.push(renderParagraph(paragraphLines.join("\n"), `p-${i}`));
	}

	return <div className={`prose-skill space-y-4 ${className ?? ""}`.trim()}>{blocks}</div>;
}
