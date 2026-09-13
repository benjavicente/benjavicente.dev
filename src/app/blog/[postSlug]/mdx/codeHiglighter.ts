export { default as rehypeShiki } from "@shikijs/rehype";

import { RehypeShikiOptions } from "@shikijs/rehype";
import slackDark from "shiki/themes/slack-dark.mjs";

import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
  transformerNotationErrorLevel,
  transformerMetaHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";

const theme = JSON.parse(
  JSON.stringify(slackDark).replaceAll(/#222222/g, "#021217"),
);

export const rehypeShikiOptions: RehypeShikiOptions = {
  theme,
  langs: [
    "bash",
    "css",
    "diff",
    "html",
    "http",
    "js",
    "json",
    "jsx",
    "make",
    "markdown",
    "py",
    "rb",
    "shell",
    "sql",
    "ts",
    "tsx",
    "xml",
    "yaml",
  ],
  transformers: [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationFocus(),
    transformerNotationErrorLevel(),
    transformerMetaHighlight(),
    transformerNotationWordHighlight(),
  ],
};
