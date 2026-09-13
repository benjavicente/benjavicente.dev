/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    rules: {
      "*.md": {
        loaders: [require.resolve("./loaders/markdown-raw-loader.cjs")],
        as: "*.js",
      },
    },
  },
  // TypeScript 7 has no JavaScript compiler API, so Next has to call `tsc`.
  experimental: {
    useTypeScriptCli: true,
  },
  // Don't write AGENTS.md / CLAUDE.md on `next dev`.
  agentRules: false,
};

module.exports = nextConfig;
