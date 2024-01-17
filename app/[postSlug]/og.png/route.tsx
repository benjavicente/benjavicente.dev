import { ImageResponse } from "next/og";
import { type Post, getPostBySlug, getPosts } from "../../getPosts";
import config from "../../../tailwind.config";

const colors = config.theme.extend.colors;

function OGImage({ post }: { post: Post }) {
  return (
    <main
      style={{
        height: "100%",
        width: "100%",
        padding: "2rem",
        background: colors.forest[900],
      }}
    >
      <div
        style={{
          width: "80%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h1
          style={{
            color: "rgb(249, 115, 22)",
            fontSize: "6rem",
            fontWeight: 900,
            margin: 0,
            lineHeight: "1.1",
          }}
        >
          {post.frontmatter.title}
        </h1>
        <hr style={{ borderColor: colors.forest[400], width: "100%" }} />
        <time style={{ color: colors.forest[400], fontSize: "3rem" }}>
          {Intl.DateTimeFormat("en", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(post.frontmatter.date)}
        </time>
        <p style={{ color: colors.forest[300], fontSize: "4rem" }}>{post.frontmatter.description}</p>
      </div>
    </main>
  );
}

export async function GET(request: Request, { params }: { params: { postSlug: string } }) {
  const post = await getPostBySlug(params.postSlug);
  return new ImageResponse(<OGImage post={post} />);
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ postSlug: post.slug }));
}
