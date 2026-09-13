import { ImageResponse } from "next/og";
import { type Post, formatPostDate, getPostBySlug, getPosts } from "../../../../getPosts";

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
        padding: "1.5rem 1rem",
        background: colors.forest[900],
        transform: "scale(3)",
        transformOrigin: "top left",
        display: "flex",
        justifyContent: "flex-end",
        flexDirection: "column",
        fontFamily: "inter",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1rem",
        }}
      >
        <h1
          style={{
            color: "#ff6900",
            fontSize: "1.3rem",
            fontWeight: 600,
            margin: 0,
            textWrap: "balance",
            lineHeight: "1.1",
            marginBottom: "0.2rem",
          }}
        >
          {post.frontmatter.title}
        </h1>
        <hr
          style={{ borderColor: colors.forest[600], width: "100%", margin: 0 }}
        />
        <time style={{ color: colors.forest[600], lineHeight: "24px" }}>
          {formatPostDate(post.frontmatter.date)}
        </time>
      </div>
      <p style={{ color: colors.forest[400], margin: 0, textWrap: "balance" }}>
        {post.frontmatter.description}
      </p>
    </div>
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postSlug: string }> },
) {
  const { postSlug } = await params;
  const post = await getPostBySlug(postSlug);
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
