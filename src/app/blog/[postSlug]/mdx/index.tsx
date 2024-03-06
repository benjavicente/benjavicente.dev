import { MDXRemoteProps, MDXRemote } from "next-mdx-remote-client/rsc";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { headingsComponents } from "./headings";
import { remarkMdxEvalCodeBlock } from "./evalJSBlock";
import { rehypeShiki, rehypeShikiOptions } from "./codeHiglighter";
import { remarkCallouts } from "./callouts";

const MDXRemoteOptions: MDXRemoteProps["options"] = {
	mdxOptions: {
		remarkPlugins: [remarkGfm, remarkDirective, remarkCallouts, remarkMdxEvalCodeBlock, () => (e) => {}],
		rehypePlugins: [[rehypeShiki, rehypeShikiOptions]],
	},
};

export async function MDX({ source, components }: { source: string; components: MDXRemoteProps["components"] }) {
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
