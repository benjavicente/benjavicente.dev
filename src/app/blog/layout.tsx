import Link from "next/link";
import { AutoRefreshPosts } from "./AutoRefreshPosts";
import { ActiveAwareLink } from "@/components/ActiveAwareLink";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <header className="text-forest-100 text-2xl font-[450] decoration-orange-500 decoration-2 underline-offset-1 tracking-tight -space-x-0.5 limit-width py-8 px-4">
          <Link href="/" className="underline decoration-orange-500 hover:decoration-double">
            BenjaVicente
          </Link>{" "}
          <span>/</span>{" "}
          <ActiveAwareLink
            href="/blog/"
            className="underline hover:decoration-double"
            activeClassName="decoration-transparent"
          >
            Blog
          </ActiveAwareLink>
        </header>
      </nav>
      {children}
      {process.env.NODE_ENV === "development" ? <AutoRefreshPosts /> : null}
    </>
  );
}
