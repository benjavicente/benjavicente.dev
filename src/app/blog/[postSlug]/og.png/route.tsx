import { ImageResponse } from "next/og";
import { type Post, getPostBySlug, getPosts } from "../../../../getPosts";

import { colors } from "@/theme";
import { readFileSync } from "fs";

const inter700 = readFileSync("./src/fonts/Inter-Bold.ttf");
const inter400 = readFileSync("./src/fonts/Inter-Regular.ttf");

function OGImage({ post }: { post: Post }) {
  return (
    <div
      style={{
        width: "400px",
        height: "210px",
        padding: "2rem",
        background: colors.forest[900],
        transform: "scale(3)",
        transformOrigin: "top left",
        display: "flex",
        flexDirection: "column",
        fontFamily: "inter",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "16px" }}>
        <h1
          style={{
            color: "rgb(249, 115, 22)",
            fontSize: "2.25rem",
            fontWeight: 700,
            margin: 0,
            lineHeight: "2.5rem",
          }}
        >
          {post.frontmatter.title}
        </h1>
        <hr style={{ borderColor: colors.forest[400], width: "100%", margin: 0 }} />
        <time style={{ color: colors.forest[400], lineHeight: "24px" }}>
          {Intl.DateTimeFormat("en", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(post.frontmatter.date)}
        </time>
      </div>
      <p style={{ color: colors.forest[300], margin: 0 }}>{post.frontmatter.description}</p>
    </div>
  );
}

export async function GET(request: Request, { params }: { params: { postSlug: string } }) {
  const post = await getPostBySlug(params.postSlug);
  return new ImageResponse(<OGImage post={post} />, {
    fonts: [
      { data: inter700, name: "inter", weight: 700, style: "normal" },
      { data: inter400, name: "inter", weight: 400, style: "normal" },
    ],
    width: 1200,
    height: 630,
  });
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ postSlug: post.slug }));
}
