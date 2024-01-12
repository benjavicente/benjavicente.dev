import { ReactNode } from "react";
import { getPosts } from "../getPosts";

export default function PostLayout({ children }: { children: ReactNode }) {
  return children;
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ postSlug: post.slug }));
}
