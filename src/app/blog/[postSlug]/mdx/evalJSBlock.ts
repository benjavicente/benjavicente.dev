import { visit } from "unist-util-visit";
import jsx from "acorn-jsx";
import { Parser } from "acorn";

const parser = Parser.extend(jsx());
const evaluatedLangs = new Set(["js", "jsx"]);

export function remarkMdxEvalCodeBlock() {
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
