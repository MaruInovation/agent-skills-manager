import "./css/jsonHighligh.css";

import type { ReactNode } from "react";

type JsonHighlighterProps = {
	value: unknown;
	className?: string;
};

function normalizeJson(value: unknown): { text: string; valid: boolean } {
	if (typeof value === "string") {
		try {
			const parsed = JSON.parse(value);
			return { text: JSON.stringify(parsed, null, 2), valid: true };
		} catch {
			return { text: value, valid: false };
		}
	}

	try {
		return { text: JSON.stringify(value, null, 2), valid: true };
	} catch {
		return { text: String(value ?? ""), valid: false };
	}
}

function highlightJson(text: string): ReactNode[] {
	const tokenReg =
		/("(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?|[\[\]]|[{}])/g;

	const nodes: ReactNode[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = tokenReg.exec(text)) !== null) {
		if (match.index > lastIndex) {
			nodes.push(text.slice(lastIndex, match.index));
		}

		const token = match[0];
		let className = "json-token-string";
		if (/^"/.test(token) && /^\s*:/.test(text.slice(match.index + token.length))) {
			className = "json-token-key";
		} else if (/^-?\d/.test(token)) {
			className = "json-token-number";
		} else if (token === "[" || token === "]") {
			className = "json-token-bracket";
		} else if (token === "{" || token === "}") {
			className = "json-token-brace";
		} else if (token === "true" || token === "false") {
			className = "json-token-boolean";
		} else if (token === "null") {
			className = "json-token-value";
		}

		nodes.push(
			<span className={className} key={`${match.index}-${token}`}>
				{token}
			</span>
		);
		lastIndex = tokenReg.lastIndex;
	}

	if (lastIndex < text.length) {
		nodes.push(text.slice(lastIndex));
	}

	return nodes;
}

export default function JsonHighlighter({ value, className }: JsonHighlighterProps) {
	const { text, valid } = normalizeJson(value);

	if (!text.trim()) {
		return <p className="text-base-content/50 text-sm">暂无内容</p>;
	}

	return (
		<div className={`rounded-lg bg-base-300 p-4 ${className ?? ""}`.trim()}>
			{!valid ? (
				<p className="text-warning text-xs mb-2">JSON 格式不合法，以下为原始文本：</p>
			) : null}
			<pre className="json-block">
				<code>{highlightJson(text)}</code>
			</pre>
		</div>
	);
}
