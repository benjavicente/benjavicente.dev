import { MDXRemoteProps, MDXRemote } from "next-mdx-remote/rsc";
import remarkDirective from "remark-directive";

import { headingsComponents } from "./headings";
import { remarkMdxEvalCodeBlock } from "./evalJSBlock";
import { rehypeShiki, rehypeShikiOptions } from "./codeHiglighter";
import { remarkCallouts } from "./callouts";

const MDXRemoteOptions: MDXRemoteProps["options"] = {
	mdxOptions: {
		useDynamicImport: true,
		// @ts-ignore (version mismatch)
		remarkPlugins: [remarkDirective, remarkCallouts, remarkMdxEvalCodeBlock, () => (e) => {}],
		// @ts-ignore (version mismatch)
		rehypePlugins: [[rehypeShiki, rehypeShikiOptions]],
	},
};

export function MDX({ source, components }: { source: string; components: MDXRemoteProps["components"] }) {
	return (
		<MDXRemote
			source={source}
			options={MDXRemoteOptions}
			components={{
				...headingsComponents,
				...components,
			}}
		/>
	);
}
