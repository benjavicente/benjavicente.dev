import Link from "next/link";
import { getPosts } from "../../getPosts";

export default async function Blog() {
  const posts = await getPosts();
  return (
    <main className="p-2 limit-width">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blog/${post.slug}/`}
          className="block transition-all magic-border duration-300 px-4 py-6"
        >
          <article>
            <h2 className="text-2xl text-orange-400 font-bold">{post.frontmatter.title}</h2>
            <time dateTime={post.frontmatter.date.toISOString()} className="text-forest-400">
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
