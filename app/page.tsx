import Link from "next/link";
import { getPosts } from "./getPosts";

export default async function Home() {
  const posts = await getPosts();
  return (
    <main>
      <ol>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/${post.slug}/`}>{post.frontmatter.title}</Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
