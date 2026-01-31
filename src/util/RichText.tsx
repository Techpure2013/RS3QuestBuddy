import React from "react";

/**
 * RichText Parser - Discord/Reddit-style text formatting
 *
 * Supported syntax:
 * - **bold**             → Bold text
 * - *italics*            → Italic text
 * - ***bold italics***   → Bold + Italic text
 * - __underline__        → Underlined text
 * - ~~strikethrough~~    → Strikethrough text
 * - ^superscript         → Superscript (single word)
 * - ^(super script)      → Superscript (multiple words)
 * - [#FFFFFF]{text}      → Colored text (hex)
 * - [255,255,255]{text}  → Colored text (RGB)
 * - [text](url)          → Link (opens in new tab)
 * - ![alt](url)          → Image (48px default, chathead size)
 * - ![alt|32](url)       → Image with custom size
 * - {{img:url}}          → Image shorthand (48px)
 * - {{img:url|64}}       → Image shorthand with size
 * - step(22){text}       → Step link (jump to step 22)
 *
 * Combinations work: __**bold underline**__ or ~~*italic strikethrough*~~
 */

type TextNode =
	| { type: "text"; content: string }
	| { type: "bold"; children: TextNode[] }
	| { type: "italic"; children: TextNode[] }
	| { type: "bolditalic"; children: TextNode[] }
	| { type: "underline"; children: TextNode[] }
	| { type: "strikethrough"; children: TextNode[] }
	| { type: "superscript"; children: TextNode[] }
	| { type: "color"; color: string; children: TextNode[] }
	| { type: "link"; url: string; children: TextNode[] }
	| { type: "image"; url: string; alt: string; size?: number }
	| { type: "steplink"; step: number; children: TextNode[] };

// Token patterns in order of precedence (most specific first)
const patterns: Array<{
	regex: RegExp;
	type: TextNode["type"];
	getColor?: (match: RegExpMatchArray) => string;
	getUrl?: (match: RegExpMatchArray) => string;
	getAlt?: (match: RegExpMatchArray) => string;
	getSize?: (match: RegExpMatchArray) => number | undefined;
	getStep?: (match: RegExpMatchArray) => number;
}> = [
	// Image with size: ![alt|size](url) - e.g., ![NPC|32](https://...)
	{
		regex: /!\[([^\]|]*)\|(\d+)\]\((https?:\/\/[^)]+)\)/,
		type: "image",
		getAlt: (m) => m[1],
		getUrl: (m) => m[3],
		getSize: (m) => parseInt(m[2], 10),
	},
	// Image standard: ![alt](url) - defaults to 48px (chathead size)
	{
		regex: /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/,
		type: "image",
		getAlt: (m) => m[1],
		getUrl: (m) => m[2],
	},
	// Image shorthand: {{img:url}} or {{img:url|size}}
	{
		regex: /\{\{img:(https?:\/\/[^|}]+)(?:\|(\d+))?\}\}/,
		type: "image",
		getUrl: (m) => m[1],
		getSize: (m) => (m[2] ? parseInt(m[2], 10) : undefined),
		getAlt: () => "",
	},
	// Color with hex: [#FFFFFF]{text} - use lazy match to handle nested content
	{
		regex: /\[(#[0-9A-Fa-f]{3,8})\]\{(.+?)\}(?!\})/,
		type: "color",
		getColor: (m) => m[1],
	},
	// Color with RGB: [255,255,255]{text} or [255, 255, 255]{text}
	{
		regex: /\[(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\]\{(.+?)\}(?!\})/,
		type: "color",
		getColor: (m) => `rgb(${m[1]}, ${m[2]}, ${m[3]})`,
	},
	// Link: [text](url) - HTTPS only for security
	{
		regex: /\[([^\]]+)\]\((https:\/\/[^)]+)\)/,
		type: "link",
		getUrl: (m) => m[2],
	},
	// Bold italic: ***text*** - use lazy match
	{ regex: /\*\*\*(.+?)\*\*\*/, type: "bolditalic" },
	// Bold: **text** - use lazy match to allow nested formatting
	{ regex: /\*\*(.+?)\*\*/, type: "bold" },
	// Italic: *text* (but not **) - use lazy match
	{ regex: /(?<!\*)\*([^*]+?)\*(?!\*)/, type: "italic" },
	// Underline bold: __**text**__ or **__text__**
	{ regex: /__\*\*(.+?)\*\*__/, type: "underline" },
	{ regex: /\*\*__(.+?)__\*\*/, type: "bold" },
	// Underline: __text__ - use lazy match
	{ regex: /__(.+?)__/, type: "underline" },
	// Strikethrough: ~~text~~ - use lazy match
	{ regex: /~~(.+?)~~/, type: "strikethrough" },
	// Superscript with parentheses: ^(text with spaces)
	{ regex: /\^\(([^)]+)\)/, type: "superscript" },
	// Superscript single word: ^word
	{ regex: /\^(\S+)/, type: "superscript" },
	// Step link: step(22){text} - jump to specific step
	{
		regex: /step\((\d+)\)\{(.+?)\}(?!\})/,
		type: "steplink",
		getStep: (m) => parseInt(m[1], 10),
	},
];

function parseRichText(text: string): TextNode[] {
	const nodes: TextNode[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		let earliestMatch: {
			index: number;
			length: number;
			content: string;
			type: TextNode["type"];
			color?: string;
			url?: string;
			alt?: string;
			size?: number;
			step?: number;
		} | null = null;

		// Find the earliest matching pattern
		for (const pattern of patterns) {
			const match = remaining.match(pattern.regex);
			if (match && match.index !== undefined) {
				if (earliestMatch === null || match.index < earliestMatch.index) {
					// For color patterns, content is in different capture groups
					let content: string;
					if (pattern.type === "color" && pattern.getColor) {
						// RGB pattern has content in group 4, hex in group 2
						content = match[4] ?? match[2];
					} else if (pattern.type === "image") {
						// Images don't have inner content to parse
						content = "";
					} else if (pattern.type === "steplink") {
						// steplink has content in group 2
						content = match[2];
					} else {
						content = match[1];
					}

					earliestMatch = {
						index: match.index,
						length: match[0].length,
						content,
						type: pattern.type,
						color: pattern.getColor?.(match),
						url: pattern.getUrl?.(match),
						alt: pattern.getAlt?.(match),
						size: pattern.getSize?.(match),
						step: pattern.getStep?.(match),
					};
				}
			}
		}

		if (earliestMatch === null) {
			// No more patterns found, rest is plain text
			if (remaining.length > 0) {
				nodes.push({ type: "text", content: remaining });
			}
			break;
		}

		// Add any text before the match as plain text
		if (earliestMatch.index > 0) {
			nodes.push({
				type: "text",
				content: remaining.substring(0, earliestMatch.index),
			});
		}

		// Handle image type specially (no children)
		if (earliestMatch.type === "image" && earliestMatch.url) {
			nodes.push({
				type: "image",
				url: earliestMatch.url,
				alt: earliestMatch.alt || "",
				size: earliestMatch.size,
			});
		} else {
			// Recursively parse the content inside the matched pattern
			const innerNodes = parseRichText(earliestMatch.content);

			if (earliestMatch.type === "color" && earliestMatch.color) {
				nodes.push({
					type: "color",
					color: earliestMatch.color,
					children: innerNodes,
				});
			} else if (earliestMatch.type === "link" && earliestMatch.url) {
				nodes.push({
					type: "link",
					url: earliestMatch.url,
					children: innerNodes,
				});
			} else if (earliestMatch.type === "steplink" && earliestMatch.step !== undefined) {
				nodes.push({
					type: "steplink",
					step: earliestMatch.step,
					children: innerNodes,
				});
			} else {
				nodes.push({
					type: earliestMatch.type,
					children: innerNodes,
				} as TextNode);
			}
		}

		// Continue with the rest of the string
		remaining = remaining.substring(earliestMatch.index + earliestMatch.length);
	}

	return nodes;
}

interface RenderOptions {
	inheritColor?: string;
	onStepClick?: (step: number) => void;
}

function renderNodes(
	nodes: TextNode[],
	keyPrefix: string = "",
	options: RenderOptions = {},
): React.ReactNode[] {
	return nodes.map((node, index) => {
		const key = `${keyPrefix}-${index}`;

		switch (node.type) {
			case "text":
				return <span key={key}>{node.content}</span>;

			case "bold":
				return (
					<strong key={key}>{renderNodes(node.children, key, options)}</strong>
				);

			case "italic":
				return <em key={key}>{renderNodes(node.children, key, options)}</em>;

			case "bolditalic":
				return (
					<strong key={key}>
						<em>{renderNodes(node.children, key, options)}</em>
					</strong>
				);

			case "underline":
				return <u key={key}>{renderNodes(node.children, key, options)}</u>;

			case "strikethrough":
				return <s key={key}>{renderNodes(node.children, key, options)}</s>;

			case "superscript":
				return (
					<sup key={key} style={{ fontSize: "0.75em", verticalAlign: "super" }}>
						{renderNodes(node.children, key, options)}
					</sup>
				);

			case "color":
				return (
					<span key={key} style={{ color: node.color }}>
						{renderNodes(node.children, key, {
							...options,
							inheritColor: node.color,
						})}
					</span>
				);

			case "link":
				return (
					<a
						key={key}
						href={node.url}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							color: options.inheritColor || "#58a6ff",
							textDecoration: "underline",
						}}
						onClick={(e) => e.stopPropagation()}
					>
						{renderNodes(node.children, key, options)}
					</a>
				);

			case "image":
				const imgSize = node.size || 48;
				return (
					<span
						key={key}
						style={{
							display: "inline-block",
							verticalAlign: "middle",
						}}
					>
						<img
							src={node.url}
							alt={node.alt}
							title={node.alt || node.url}
							style={{
								maxWidth: imgSize,
								maxHeight: imgSize,
								objectFit: "contain",
								verticalAlign: "middle",
								display: "inline-block",
							}}
							onError={(e) => {
								const img = e.target as HTMLImageElement;
								// Replace with error indicator
								img.style.display = "none";
								const parent = img.parentElement;
								if (parent && !parent.querySelector(".img-error")) {
									const errorSpan = document.createElement("span");
									errorSpan.className = "img-error";
									errorSpan.style.cssText = `
										display: inline-flex;
										align-items: center;
										justify-content: center;
										width: ${imgSize}px;
										height: ${imgSize}px;
										background: #7f1d1d;
										border: 1px solid #991b1b;
										border-radius: 4px;
										color: #fca5a5;
										font-size: 10px;
										text-align: center;
									`;
									errorSpan.title = "Failed to load: " + node.url;
									errorSpan.textContent = "IMG ERR";
									parent.appendChild(errorSpan);
								}
							}}
						/>
					</span>
				);

			case "steplink":
				return (
					<a
						key={key}
						href="#"
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							options.onStepClick?.(node.step);
						}}
						style={{
							color: options.inheritColor || "#22c55e",
							textDecoration: "underline",
							cursor: "pointer",
						}}
						title={`Go to step ${node.step}`}
					>
						{renderNodes(node.children, key, options)}
					</a>
				);

			default:
				return null;
		}
	});
}

export interface RichTextProps {
	children: string;
	/** Fallback for plain text if parsing fails */
	fallbackToPlain?: boolean;
	/** Callback when a step link is clicked */
	onStepClick?: (step: number) => void;
}

/**
 * RichText Component
 *
 * Renders text with Discord/Reddit-style formatting.
 *
 * @example
 * <RichText>**bold** and *italic* text</RichText>
 * <RichText>[#FF0000]{red text} and __underlined__</RichText>
 * <RichText>H^2O and x^(super script)</RichText>
 */
export const RichText: React.FC<RichTextProps> = ({
	children,
	fallbackToPlain = true,
	onStepClick,
}) => {
	if (typeof children !== "string") {
		return <>{children}</>;
	}

	try {
		const nodes = parseRichText(children);
		return <>{renderNodes(nodes, "rt", { onStepClick })}</>;
	} catch (error) {
		console.error("RichText parsing error:", error);
		if (fallbackToPlain) {
			return <>{children}</>;
		}
		throw error;
	}
};

/**
 * Parse rich text and return React nodes directly
 * Useful when you need more control over rendering
 */
export function parseAndRender(text: string): React.ReactNode {
	try {
		const nodes = parseRichText(text);
		return <>{renderNodes(nodes, "rt")}</>;
	} catch {
		return text;
	}
}

/**
 * Check if text contains any rich text formatting
 */
export function hasRichTextFormatting(text: string): boolean {
	return patterns.some((p) => p.regex.test(text));
}

/**
 * Strip all rich text formatting and return plain text
 * Recursively removes all formatting markers while preserving the content
 */
export function stripFormatting(text: string): string {
	let result = text;
	let previousResult = "";

	// Keep stripping until no more changes (handles nested formatting)
	while (result !== previousResult) {
		previousResult = result;

		// Image with size: ![alt|size](url) -> alt (or empty)
		result = result.replace(/!\[([^\]|]*)\|\d+\]\((https?:\/\/[^)]+)\)/g, "$1");

		// Image standard: ![alt](url) -> alt (or empty)
		result = result.replace(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, "$1");

		// Image shorthand: {{img:url}} or {{img:url|size}} -> empty
		result = result.replace(/\{\{img:(https?:\/\/[^|}]+)(?:\|\d+)?\}\}/g, "");

		// Color with hex: [#FFFFFF]{text} -> text
		result = result.replace(/\[(#[0-9A-Fa-f]{3,8})\]\{(.+?)\}(?!\})/g, "$2");

		// Color with RGB: [255,255,255]{text} -> text
		result = result.replace(
			/\[(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\]\{(.+?)\}(?!\})/g,
			"$4",
		);

		// Link: [text](url) -> text
		result = result.replace(/\[([^\]]+)\]\((https:\/\/[^)]+)\)/g, "$1");

		// Bold italic: ***text*** -> text
		result = result.replace(/\*\*\*(.+?)\*\*\*/g, "$1");

		// Bold: **text** -> text
		result = result.replace(/\*\*(.+?)\*\*/g, "$1");

		// Italic: *text* -> text (but not **)
		result = result.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, "$1");

		// Underline: __text__ -> text
		result = result.replace(/__(.+?)__/g, "$1");

		// Strikethrough: ~~text~~ -> text
		result = result.replace(/~~(.+?)~~/g, "$1");

		// Superscript with parentheses: ^(text) -> text
		result = result.replace(/\^\(([^)]+)\)/g, "$1");

		// Superscript single word: ^word -> word
		result = result.replace(/\^(\S+)/g, "$1");

		// Step link: step(N){text} -> text
		result = result.replace(/step\(\d+\)\{(.+?)\}(?!\})/g, "$1");
	}

	return result;
}

export default RichText;
