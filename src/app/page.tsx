import Link from "next/link";

export default function Home() {
	return (
		<main className="limit-width text-forest-50 px-4 py-8 [&_a]:underline">
			<div className="mb-4">
				<h1 className="text-forest-100 text-2xl font-[450] tracking-tight">BenjaVicente</h1>
				<p className="text-forest-300">
					Software Engineer of <a href="https://uc.cl">UC Chile</a> specialized in Web Development.
				</p>
			</div>
			<h2 className="text-forest-100 mb-1 mt-6 text-xl">Links</h2>
			<ul className="list-disc pl-4 marker:text-orange-400 [&_a]:text-orange-400">
				<li>
					My <Link href="/blog">Blog</Link>
				</li>
				<li>
					Profile at <a href="https://linkedin.com/in/benjavicente">LinkedIn</a>
				</li>
				<li>
					Projects at <a href="https://linkedin.com/in/benjavicente">GitHub</a>
				</li>
			</ul>
			<h2 className="text-forest-200 mt-6 text-xl">Sources of inspiration</h2>
			<p className="text-forest-300 mb-1">This list is incomplete; you can help by sending me a message.</p>
			<ul className="[&_a]:decoration-forest-400 list-disc pl-4 marker:text-orange-400">
				<li>
					<a href="https://overreacted.io/">Dan Abramov (React)</a>
				</li>
				<li>
					<a href="https://dev.to/ryansolid">Ryan Carniato (SolidJS)</a>
				</li>
				<li>
					<a href="https://leerob.io/">Lee Robinson (NextJS)</a>
				</li>
				<li>
					<a href="https://twitter.com/PirateSoftware">Jason Thor Hall (Pirate Software)</a>
				</li>
				<li>
					<a href="https://tiangolo.com/">Sebastían Ramírez (FastAPI)</a>
				</li>
			</ul>
		</main>
	);
}
