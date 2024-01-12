import { MDXRemoteProps, MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import { Parser } from "acorn";
import jsx from "acorn-jsx";

const MDXRemoteOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    useDynamicImport: true,
    remarkPlugins: [remarkMdxEvalCodeBlock, () => (e) => {}],
    rehypePlugins: [
      [
        // @ts-ignore (version mismatch)
        rehypePrettyCode,
        {
          theme: "slack-dark",
        },
      ],
    ],
  },
};

export function MDX({ source, components }: { source: string; components: MDXRemoteProps["components"] }) {
  return <MDXRemote source={source} options={MDXRemoteOptions} components={components} />;
}

const parser = Parser.extend(jsx());
const evaluatedLangs = new Set(["js", "jsx"]);

function remarkMdxEvalCodeBlock() {
  // @ts-ignore (can't find types for this)
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (evaluatedLangs.has(node.lang) && node.meta === "eval") {
        const program = parser.parse(node.value, {
          ecmaVersion: "latest",
          sourceType: "module",
        });
        const output = {
          type: "mdxFlowExpression",
          value: "",
          data: {
            estree: {
              type: "Program",
              body: [
                {
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "ArrowFunctionExpression",
                      id: null,
                      expression: false,
                      generator: false,
                      async: false,
                      params: [],
                      body: {
                        type: "BlockStatement",
                        body: [
                          ...program.body.slice(0, -1),
                          {
                            type: "ReturnStatement",
                            argument: program.body.at(-1),
                          },
                        ],
                      },
                    },
                    arguments: [],
                    optional: false,
                  },
                },
              ],
            },
          },
        };
        parent.children.splice(index, 1, output);
      }
    });
  };
}
