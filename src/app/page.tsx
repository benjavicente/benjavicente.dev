import Link from "next/link";

export default function Home() {
	return (
		<main className="limit-width px-4 py-8 text-forest-50 [&_a]:underline">
			<div className="mb-4">
				<h1 className="text-2xl font-[450] tracking-tight text-forest-100">BenjaVicente</h1>
				<p className="text-forest-300">
					Software Engineer of <a href="https://uc.cl">UC Chile</a> specialized in Web Development.
				</p>
			</div>
			<h2 className="mb-1 mt-6 text-xl text-forest-100">Links</h2>
			<ul className="list-disc pl-4 marker:text-orange-400 [&_a]:text-orange-400">
				<li>
					My <Link href="/blog">Blog</Link>
				</li>
				<li>
					Profile at <a href="https://linkedin.com/in/benjavicente">LinkedIn</a>
				</li>
				<li>
					Projects at <a href="https://github.com/benjavicente">GitHub</a>
				</li>
			</ul>
			<h2 className="mt-6 text-xl text-forest-200">Sources of inspiration</h2>
			<p className="mb-1 text-forest-300">This list is incomplete; you can help by sending me a message.</p>
			<ul className="list-disc pl-4 marker:text-orange-400 [&_a]:decoration-forest-400">
				<li>
					<a href="https://overreacted.io/">Dan Abramov</a> (React)
				</li>
				<li>
					The SolidJS community, <a href="https://dev.to/ryansolid">Ryan Carniato</a>
				</li>
				<li>
					The <a href="https://www.convex.dev/">Convex team</a>. See <a href="https://stack.convex.dev/tag/Perspectives">their blog</a> and
					the <a href="https://www.convex.dev/podcast">Databased podcast</a>.
				</li>
				<li>
					<a href="https://bsky.app/profile/devongovett.bsky.social">Devon Govett</a>, just see{" "}
					<a href="https://github.com/devongovett">his GitHub profile</a>
				</li>
				<li>
					<a href="https://x.com/Jonathan_Blow">Jhonathan Blow</a> and <a href="https://caseymuratori.com/">Casey Muratori</a>
				</li>
				<li>
					<a href="https://bsky.app/profile/piratesoftware.live">Jason Thor Hall (Pirate Software)</a>
				</li>
			</ul>
		</main>
	);
}
