/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  // TypeScript 7 has no JavaScript compiler API, so Next has to call `tsc`.
  experimental: {
    useTypeScriptCli: true,
  },
};

module.exports = nextConfig;
