import { MDXRemoteProps, MDXRemote } from "next-mdx-remote-client/rsc";
import { serialize } from "next-mdx-remote-client/serialize";
import { jsx } from "react/jsx-runtime";
import * as jsxRuntime from "react/jsx-runtime";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import * as React from "react";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { headingsComponents } from "./headings";
import { remarkMdxEvalCodeBlock } from "./evalJSBlock";
import { rehypeShiki, rehypeShikiOptions } from "./codeHiglighter";
import { remarkCallouts } from "./callouts";

const MDXRemoteOptions: MDXRemoteProps["options"] = {
	mdxOptions: {
		remarkPlugins: [remarkGfm, remarkDirective, remarkCallouts, remarkMdxEvalCodeBlock, () => () => {}],
		rehypePlugins: [[rehypeShiki, rehypeShikiOptions]],
	},
};

type MDXContent = React.ComponentType<{ components?: MDXRemoteProps["components"] }>;

const compiledPosts = new Map<string, MDXContent>();

async function compilePost(source: string): Promise<MDXContent | undefined> {
	const cached = compiledPosts.get(source);
	if (cached) return cached;

	const result = await serialize({ source, options: MDXRemoteOptions });
	if (!("compiledSource" in result)) return;

	const content = await runCompiledMdx(result.compiledSource);
	compiledPosts.set(source, content);
	if (compiledPosts.size > 24) {
		const oldest = compiledPosts.keys().next().value;
		if (oldest) compiledPosts.delete(oldest);
	}
	return content;
}

async function runCompiledMdx(compiledSource: string): Promise<MDXContent> {
	const scope = {
		runMdxOptions: {
			jsx: jsxRuntime.jsx,
			jsxs: jsxRuntime.jsxs,
			jsxDEV: jsxDevRuntime.jsxDEV,
			Fragment: jsxRuntime.Fragment,
			React,
			useMDXComponents: () => ({}),
		},
	};
	const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
		...args: string[]
	) => (...values: unknown[]) => Promise<{ default: MDXContent }>;
	const hydrate = Reflect.construct(AsyncFunction, [...Object.keys(scope), compiledSource]) as (
		...values: unknown[]
	) => Promise<{ default: MDXContent }>;
	const { default: Content } = await hydrate(...Object.values(scope));
	return Content;
}

export async function MDX({ source, components }: { source: string; components: MDXRemoteProps["components"] }) {
	const merged = { ...headingsComponents, ...components };
	const Content = await compilePost(source);
	if (!Content) {
		return <MDXRemote source={source} options={MDXRemoteOptions} components={merged} />;
	}
	return jsx(Content, { components: merged });
}
