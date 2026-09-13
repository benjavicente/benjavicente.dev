import { MDX } from "./mdx";
import { formatPostDate, getPostBySlug } from "../../../getPosts";
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

export async function generateMetadata({ params }: { params: Promise<{ postSlug: string }> }): Promise<Metadata> {
	const { postSlug } = await params;
	const post = await getPostBySlug(postSlug);

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
			images: [`blog/${postSlug}/og.png`],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			site: "/",
			images: [`blog/${postSlug}/og.png`],
		},
	};
}

export default async function Post({ params }: { params: Promise<{ postSlug: string }> }) {
	const { postSlug } = await params;
	const post = await getPostBySlug(postSlug);
	const { content, frontmatter, slug } = post;

	const components = await getPostComponents(slug);

	return (
		<>
			<article className="limit-width with-progress px-4 pt-6 pb-24">
				<div className="mb-8">
					<h1 className="mb-2 text-2xl font-semibold text-balance text-orange-500 md:text-3xl">{frontmatter.title}</h1>
					<hr className="border-forest-400" />
					<div className="text-forest-400">
						<time dateTime={frontmatter.date.toISOString().slice(0, 10)}>
							{formatPostDate(frontmatter.date)}
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
