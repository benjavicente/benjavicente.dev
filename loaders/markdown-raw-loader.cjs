// Turbopack's `type: "raw"` is not a placeable ESM module. Emit a real module instead.
module.exports = function markdownRawLoader(source) {
	const text = typeof source === "string" ? source : Buffer.from(source).toString("utf8");
	// A primitive `module.exports` has no `.default`, so expose a named export Turbopack can read.
	return `exports.source = ${JSON.stringify(text)};`;
};
