import { ImageResponse } from "next/og";
import { type Post, getPostBySlug, getPosts } from "../../getPosts";

function OGImage({ post }: { post: Post }) {
  return <h1>{post.frontmatter.title}</h1>;
}

export async function GET(request: Request, { params }: { params: { postSlug: string } }) {
  const post = await getPostBySlug(params.postSlug);
  return new ImageResponse(<OGImage post={post} />);
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ postSlug: post.slug }));
}
