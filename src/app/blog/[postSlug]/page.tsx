import { MDX } from "./mdx";
import { getPostBySlug } from "../../../getPosts";
import { Metadata } from "next";
import fs from "fs";
import readingTime from "reading-time";

async function getPostComponents(slug: string) {
	const dir = `./public/blog/${slug}`;
	const files = fs.readdirSync(dir, { withFileTypes: true });

	const re = /^components.(js|jsx|ts|tsx)$/;

	const componentsFiles = files
		.map((file) => {
			if (!file.isFile()) return null;
			const match = file.name.match(re);
			if (!match) return null;
			return { name: file.name, extension: match[1] };
		})
		.filter(Boolean);

	if (componentsFiles.length === 0) return {};
	const ext = componentsFiles[0].extension;

	try {
		return await import(`../../../../public/blog/${slug}/components.${ext}`);
	} catch (e) {
		// @ts-ignore (it's dumb to type this)
		if (!e || e.code !== "MODULE_NOT_FOUND") throw e;
		return {};
	}
}

export async function generateMetadata({ params }: { params: { postSlug: string } }): Promise<Metadata> {
	const post = await getPostBySlug(params.postSlug);

	const title = post.frontmatter.title;
	const description = post.frontmatter.description;

	return {
		title,
		description,
		category: "blog",
		authors: [{ name: "Benja Vicente", url: "https://benjavicente.dev" }],
		openGraph: {
			title,
			type: "article",
			images: [`blog/${params.postSlug}/og.png`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			site: "/",
			images: [`blog/${params.postSlug}/og.png`],
		},
	};
}

export default async function Post({ params }: { params: { postSlug: string } }) {
	const post = await getPostBySlug(params.postSlug);
	const { content, frontmatter, slug } = post;

	const components = await getPostComponents(slug);

	return (
		<>
			<article className="limit-width with-progress px-4 pt-6 pb-24">
				<div className="mb-8">
					<h1 className="mb-2 text-2xl font-semibold text-balance text-orange-500 md:text-3xl">{frontmatter.title}</h1>
					<hr className="border-forest-400" />
					<div className="text-forest-400">
						<time dateTime={frontmatter.date.toISOString()}>
							{Intl.DateTimeFormat("en", {
								year: "numeric",
								month: "long",
								day: "numeric",
							}).format(frontmatter.date)}
						</time>{" "}
						&middot; {readingTime(content).text}
					</div>
				</div>
				<div className="prose prose-invert text-justify">
					<MDX source={content} components={components} />
				</div>
			</article>
		</>
	);
}
