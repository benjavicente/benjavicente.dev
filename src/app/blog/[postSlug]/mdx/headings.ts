import { ReactNode, createElement } from "react";

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

function getText(node: ReactNode) {
	let text = "";
	if (Array.isArray(node)) {
		for (let child of node) {
			text += getText(child);
		}
		return text;
	} else if (typeof node === "string") {
		return node;
	} else if (node !== null && typeof node === "object" && "props" in node && node.props.children) {
		return getText(node.props.children);
	}
	throw new Error(`Could not get text from heading in node: ${node}`);
}

function createHeading(level: number) {
	return function Heading({ children }: { children?: React.ReactNode }) {
		let text: string;
		try {
			text = getText(children);
		} catch (e) {
			console.error(e);
			return createElement(`h${level}`, {}, children);
		}

		let slug = slugify(text);
		return createElement(`h${level}`, { id: slug, className: "header-anchor" }, [
			createElement(
				"a",
				{
					href: `#${slug}`,
					key: `link-${slug}`,
					className: "decoration-transparent hover:underline",
				},
				children,
			),
		]);
	};
}

export const headingsComponents = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
};
