import Link from "next/link";
import { getPosts } from "../../getPosts";

export default async function Blog() {
	const posts = await getPosts();
	return (
		<main className="limit-width flex flex-col gap-4 p-2">
			{posts.map((post) => (
				<Link key={post.slug} href={`/blog/${post.slug}/`} className="magic-border block px-4 py-6 transition-all duration-300">
					<article>
						<h2 className="text-2xl leading-tight font-bold text-orange-400">{post.frontmatter.title}</h2>
						<time dateTime={post.frontmatter.date.toISOString()} className="text-forest-400 mb-2 block">
							{Intl.DateTimeFormat("en", {
								year: "numeric",
								month: "long",
								day: "numeric",
							}).format(post.frontmatter.date)}
						</time>
						<p className="text-forest-300">{post.frontmatter.description}</p>
					</article>
				</Link>
			))}
		</main>
	);
}
