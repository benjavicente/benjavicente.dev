import { readdir, stat, readFile } from "fs/promises";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";

const frontmatterSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string().optional(),
});

export const getPosts = cache(async () => {
  const directories = await readdir("./public", { withFileTypes: true });

  const postsDirs = directories.filter((dirent) => dirent.isDirectory());

  const checkedPaths = await Promise.all(
    postsDirs.map(async (postDir) => {
      const path = `./public/${postDir.name}/index.md`;
      return { file: await stat(path), path, dir: postDir };
    })
  );

  const postsMeta = await Promise.all(
    checkedPaths
      .filter(({ file }) => file.isFile())
      .map(async ({ path, dir }) => {
        const source = await readFile(path, "utf8");
        const { data, content } = matter(source);
        const frontmatter = frontmatterSchema.parse(data);
        return { content, frontmatter, slug: dir.name };
      })
  );

  postsMeta.sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
  return postsMeta;
});

export type Post = Awaited<ReturnType<typeof getPosts>>[number];

export const getPostBySlug = async (slug: string) => {
  const post = (await getPosts()).find((post) => post.slug === slug);
  if (!post) notFound();
  return post;
};
