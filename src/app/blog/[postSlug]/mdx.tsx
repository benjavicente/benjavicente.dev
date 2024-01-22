import { MDXRemoteProps, MDXRemote } from "next-mdx-remote/rsc";
import { visit } from "unist-util-visit";
import { Parser } from "acorn";
import jsx from "acorn-jsx";
import React, { createElement } from "react";
import rehypeShikiji from "rehype-shikiji";

const MDXRemoteOptions: MDXRemoteProps["options"] = {
	mdxOptions: {
		useDynamicImport: true,
		remarkPlugins: [remarkMdxEvalCodeBlock, () => (e) => {}],
		rehypePlugins: [
			[
				// @ts-ignore (version mismatch)
				rehypeShikiji,
				{
					theme: "slack-dark",
				},
			],
		],
	},
};

function slugify(str: string) {
	return str
		.toString()
		.toLowerCase()
		.trim() // Remove whitespace from both ends of a string
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/&/g, "-and-") // Replace & with 'and'
		.replace(/[^\w\-]+/g, "") // Remove all non-word characters except for -
		.replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(level: number) {
	return function Heading({ children }: { children?: React.ReactNode }) {
		if (typeof children !== "string") {
			console.warn("Heading children is not a string", children);
			return createElement(`h${level}`, {}, children);
		}

		let slug = slugify(children);
		return createElement(`h${level}`, { id: slug }, [
			createElement(
				"a",
				{
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "anchor decoration-transparent hover:underline",
				},
				children,
			),
		]);
	};
}

export function MDX({ source, components }: { source: string; components: MDXRemoteProps["components"] }) {
	return (
		<MDXRemote
			source={source}
			options={MDXRemoteOptions}
			components={{
				h1: createHeading(1),
				h2: createHeading(2),
				h3: createHeading(3),
				h4: createHeading(4),
				h5: createHeading(5),
				h6: createHeading(6),
				...components,
			}}
		/>
	);
}

const parser = Parser.extend(jsx());
const evaluatedLangs = new Set(["js", "jsx"]);

function remarkMdxEvalCodeBlock() {
	// @ts-ignore (can't find types for this)
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (evaluatedLangs.has(node.lang) && node.meta === "eval") {
				const program = parser.parse(node.value, {
					ecmaVersion: "latest",
					sourceType: "module",
				});
				const output = {
					type: "mdxFlowExpression",
					value: "",
					data: {
						estree: {
							type: "Program",
							body: [
								{
									type: "ExpressionStatement",
									expression: {
										type: "CallExpression",
										callee: {
											type: "ArrowFunctionExpression",
											id: null,
											expression: false,
											generator: false,
											async: false,
											params: [],
											body: {
												type: "BlockStatement",
												body: [
													...program.body.slice(0, -1),
													{
														type: "ReturnStatement",
														argument: program.body.at(-1),
													},
												],
											},
										},
										arguments: [],
										optional: false,
									},
								},
							],
						},
					},
				};
				parent.children.splice(index, 1, output);
			}
		});
	};
}
