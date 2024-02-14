import { createElement } from "react";

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

export const headingsComponents = {
	h1: createHeading(1),
	h2: createHeading(2),
	h3: createHeading(3),
	h4: createHeading(4),
	h5: createHeading(5),
	h6: createHeading(6),
};
