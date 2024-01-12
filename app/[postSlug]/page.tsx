import { MDX } from "./mdx";
import { getPostBySlug, getPosts } from "../getPosts";
import { Metadata } from "next";

async function getPostComponents(slug: string) {
  try {
    return await import(`../../public/${slug}/components.js`);
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
    openGraph: {
      title,
      type: "article",
      images: [`/${params.postSlug}/og.png`],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: "/",
      images: [`/${params.postSlug}/og.png`],
    },
  };
}

export default async function Post({ params }: { params: { postSlug: string } }) {
  const post = await getPostBySlug(params.postSlug);
  const { content, frontmatter, slug } = post;

  const components = await getPostComponents(slug);

  return (
    <>
      <h1>{frontmatter.title}</h1>
      <MDX source={content} components={components} />
    </>
  );
}
