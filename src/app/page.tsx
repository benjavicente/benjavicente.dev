import Link from "next/link";

export default function Home() {
  return (
    <main className="px-4 py-8 limit-width text-forest-50 [&_a]:text-orange-400 [&_a]:underline">
      <div className="mb-4">
        <h1 className="text-2xl font-[450] text-forest-100 tracking-tight">BenjaVicente</h1>
        <p className="text-forest-300">
          Software Engineer of <a href="https://uc.cl">UC Chile</a> specialized in Web Development.
        </p>
      </div>
      <h2 className="text-xl text-forest-100">Links</h2>
      <ul className="marker:text-orange-400 list-disc pl-4">
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
    </main>
  );
}
