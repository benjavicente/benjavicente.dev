import Link from "next/link";
import { AutoRefreshPosts } from "./AutoRefreshPosts";
import { ActiveAwareLink } from "@/components/ActiveAwareLink";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div id="progress" />
			<nav>
				<header className="limit-width text-forest-100 -space-x-0.5 px-4 py-8 text-2xl font-[450] tracking-tight decoration-orange-500 decoration-2 underline-offset-1">
					<Link href="/" className="underline decoration-orange-500 hover:decoration-double">
						BenjaVicente
					</Link>{" "}
					<span>/</span>{" "}
					<ActiveAwareLink href="/blog/" className="underline hover:decoration-double" activeClassName="decoration-transparent">
						Blog
					</ActiveAwareLink>
				</header>
			</nav>
			{children}
			{process.env.NODE_ENV === "development" ? <AutoRefreshPosts /> : null}
		</>
	);
}
