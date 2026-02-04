import { useEffect, useState, useCallback } from "react";
import { codeToHtml, type BundledLanguage } from "shiki";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
	children: string;
	language?: BundledLanguage | "text";
	title?: string;
	className?: string;
}

export function CodeBlock({
	children,
	language = "json",
	title,
	className,
}: CodeBlockProps) {
	const [html, setHtml] = useState<string>("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		const highlight = async () => {
			try {
				// Treat "text" as plain text with no highlighting
				const lang = language === "text" ? "text" : language;
				const highlighted = await codeToHtml(children.trim(), {
					lang: lang as BundledLanguage,
					theme: "github-dark-default",
				});
				setHtml(highlighted);
			} catch {
				// Fallback to plain text if language not supported
				setHtml(
					`<pre class="shiki"><code>${children.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`,
				);
			}
		};
		highlight();
	}, [children, language]);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(children.trim());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	}, [children]);

	return (
		<div
			className={cn("rounded-md overflow-hidden bg-[#0d1117] relative", className)}
		>
			{title ? (
				<div className="px-16 py-8 bg-[#161b22] flex items-center justify-between border-b border-[#30363d]">
					<span className="body-3-semi-bold text-[#8b949e]">{title}</span>
					<div className="flex items-center gap-12">
						<span className="body-4 text-[#6e7681]">{language}</span>
						<button
							type="button"
							onClick={handleCopy}
							className={cn(
								"body-4 px-8 py-4 rounded-xs transition-colors",
								copied
									? "bg-success/20 text-success"
									: "bg-[#30363d] text-[#8b949e] hover:bg-[#3d444d] hover:text-[#c9d1d9]",
							)}
						>
							{copied ? "Copied!" : "Copy"}
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={handleCopy}
					className={cn(
						"absolute top-8 right-8 z-10 body-4 px-8 py-4 rounded-xs transition-colors",
						copied
							? "bg-success/20 text-success"
							: "bg-[#30363d] text-[#8b949e] hover:bg-[#3d444d] hover:text-[#c9d1d9]",
					)}
				>
					{copied ? "Copied!" : "Copy"}
				</button>
			)}
			<div
				className="p-16 overflow-x-auto [&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_code]:body-2 [&_code]:font-mono"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki HTML output is safe
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}
