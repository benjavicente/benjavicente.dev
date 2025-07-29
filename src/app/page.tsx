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
			<h2 className="text-forest-100 mt-6 mb-1 text-xl">Links</h2>
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
			<h2 className="text-forest-200 mt-6 text-xl">Sources of inspiration</h2>
			<p className="text-forest-300 mb-1">This list is incomplete; you can help by sending me a message.</p>
			<ul className="[&_a]:decoration-forest-400 list-disc pl-4 marker:text-orange-400">
				<li>
					<a href="https://x.com/theo">Theo</a>
				</li>
				<li>
					<a href="https://jakearchibald.com/">Jake Archibald</a>, <a href="https://una.im/">Una Kravets</a>
				</li>
				<li>
					<a href="https://lea.verou.me/">Lea Verou</a> (web standards, MIT teaching, prismjs)
				</li>
				<li>
					<a href="https://samwho.dev/">Sam Rose</a> (great blogs)
				</li>
				<li>
					<a href="https://bsky.app/profile/rich-harris.dev">Rich Harris</a> (search his talks)
				</li>
				<li>
					<a href="https://overreacted.io/">Dan Abramov</a> (React, Redux)
				</li>
				<li>
					<a href="https://x.com/tannerlinsley">Tanner Linsley</a>, <a href="https://bsky.app/profile/tkdodo.eu">Dominik Dorfmeister</a>
				</li>
				<li>
					The SolidJS community, <a href="https://dev.to/ryansolid">Ryan Carniato</a>, <a href="https://x.com/devagrawal09">Dev Agrawal</a>
				</li>
				<li>
					<a href="https://bsky.app/profile/devongovett.bsky.social">Devon Govett</a> (React Aria, Parcel, lightingcss)
				</li>
				<li>
					<a href="https://x.com/Jonathan_Blow">Jhonathan Blow</a>, <a href="https://caseymuratori.com/">Casey Muratori</a>,{" "}
					<a href="https://bettersoftwareconference.com/">better software conference</a>
				</li>
				<li>
					The <a href="https://www.convex.dev/">Convex team</a>. See <a href="https://stack.convex.dev/tag/Perspectives">their blog</a> and
					the <a href="https://www.convex.dev/podcast">Databased podcast</a>
				</li>
				<li>
					The Platenscale team, <a href="https://x.com/benjdicken">Ben Dicken</a>&apos;s posts on{" "}
					<a href="https://planetscale.com/blog">their blog</a>
				</li>
				<li>
					<a href="https://iquilezles.org/">Inigo Quilez</a> (shadertoy)
				</li>
			</ul>
		</main>
	);
}
