/// <reference types="mdast-util-to-hast" />

// from https://github.com/withastro/starlight/blob/main/packages/starlight/integrations/asides.ts#L48

import { h } from "hastscript";
import type { Root, Node } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import { type Directives, directiveToMarkdown, type TextDirective, type LeafDirective } from "mdast-util-directive";
import { toMarkdown } from "mdast-util-to-markdown";

function isNodeDirective(node: Node): node is Directives {
	return node.type === "textDirective" || node.type === "leafDirective" || node.type === "containerDirective";
}

function transformUnhandledDirective(node: TextDirective | LeafDirective, index: number, parent: Parent) {
	const textNode = {
		type: "text",
		value: toMarkdown(node, { extensions: [directiveToMarkdown()] }),
	} as const;
	if (node.type === "textDirective") {
		parent.children[index] = textNode;
	} else {
		parent.children[index] = {
			type: "paragraph",
			children: [textNode],
		};
	}
}

export function remarkCallouts(): Transformer<Root> {
	return (tree) => {
		visit(tree, (node, index, parent): void => {
			if (!parent || index === undefined || !isNodeDirective(node)) return;
			if (node.type !== "containerDirective") transformUnhandledDirective(node, index, parent);
			const data = node.data || (node.data = {});
			const attributes = node.attributes || {};
			if (node.name === "note") {
				data.hName = "aside";
				data.hProperties = h("aside").properties;
				return;
			}
		});
	};
}
