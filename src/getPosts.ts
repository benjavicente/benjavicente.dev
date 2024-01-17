import { readdir, stat, readFile } from "fs/promises";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import { cache } from "react";
import { z } from "zod";
import "@total-typescript/ts-reset/filter-boolean";

const frontmatterSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  description: z.string(),
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
        const frontmatter = frontmatterSchema.safeParse(data);

        if (frontmatter.success === false) {
          console.warn("Invalid frontmatter in", path);
          return null;
        }

        return { content, frontmatter: frontmatter.data, slug: dir.name };
      })
  );

  return postsMeta.filter(Boolean).toSorted((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
});

export type Post = Awaited<ReturnType<typeof getPosts>>[number];

export const getPostBySlug = async (slug: string) => {
  const post = (await getPosts()).find((post) => post.slug === slug);
  if (!post) notFound();
  return post;
};
