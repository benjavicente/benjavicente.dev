import matter from "gray-matter";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import "@total-typescript/ts-reset/filter-boolean";

// Imported as modules so Turbopack watches them. `fs.readFile` never invalidated the page.
// `public/` is excluded from `import.meta.glob`, so posts are reached through this link.
const postSources = import.meta.glob("./blog-posts/*/index.md", {
	import: "source",
	eager: true,
}) as Record<string, string>;

const frontmatterSchema = z.object({
	title: z.string(),
	// Date-only strings parse as UTC midnight. Format in UTC so local offsets don't shift the day.
	date: z.coerce.date(),
	description: z.string(),
});

export function formatPostDate(date: Date) {
	return Intl.DateTimeFormat("en", {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	}).format(date);
}

export const getPosts = cache(async () => {
	const postsMeta = Object.entries(postSources).flatMap(([path, source]) => {
		const slug = path.split("/").at(-2);
		if (!slug || typeof source !== "string") return [];

		const { data, content } = matter(source);
		const frontmatter = frontmatterSchema.safeParse(data);
		if (frontmatter.success === false) {
			console.warn("Invalid frontmatter in", path, frontmatter.error.message);
			return [];
		}

		return [{ content, frontmatter: frontmatter.data, slug }];
	});

	postsMeta.sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
	return postsMeta;
});

export type Post = Awaited<ReturnType<typeof getPosts>>[number];

export const getPostBySlug = async (slug: string) => {
	const post = (await getPosts()).find((post) => post.slug === slug);
	if (!post) notFound();
	return post;
};
