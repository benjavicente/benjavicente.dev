import { MDX } from "./mdx";
import { getPostBySlug, getPosts } from "../getPosts";
import { Metadata } from "next";
import fs from "fs";

async function getPostComponents(slug: string) {
  const dir = `./public/${slug}`;
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
    return await import(`../../public/${slug}/components.${ext}`);
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
      <article className="px-4 py-6 limit-width">
        <div className="mb-8">
          <h1 className="text-orange-500 text-4xl font-bold">{frontmatter.title}</h1>
          <hr className="border-forest-400" />
          <time dateTime={frontmatter.date.toISOString()} className="text-forest-400">
            {Intl.DateTimeFormat("en", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(frontmatter.date)}
          </time>
        </div>

        <div className="prose prose-invert">
          <MDX source={content} components={components} />
        </div>
      </article>
    </>
  );
}
