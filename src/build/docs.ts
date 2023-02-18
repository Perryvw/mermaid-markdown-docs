import * as path from "path";
import * as esbuild from "esbuild";
import * as fs from "fs/promises";

import MarkdownIt from "markdown-it";
import markdownItFrontMatter from "markdown-it-front-matter";
import { parse as parseYaml } from "yaml";

import type {DocTree} from "../common/mmd-docs-types";
import { pageTitle } from "./util";

let lastFrontMatter = {};
const markdownIt = new MarkdownIt()
    .use((md: MarkdownIt) => {
        const defaultRenderer = md.renderer.rules.fence!.bind(md.renderer.rules);
        md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
            const token = tokens[idx];
            if (token.tag === "code" && token.info === "mermaid")
            {
                return `<pre class="mermaid">${token.content}</pre>`;
            }
            else
            {
                return defaultRenderer(tokens, idx, opts, env, self);
            }
        };
    })
    .use(markdownItFrontMatter, frontMatter => {
        lastFrontMatter = parseYaml(frontMatter);
    });

function renderMarkdown(markdown: string): { html: string, frontMatter: Record<string, string> }
{
    lastFrontMatter = {};
    return { html: markdownIt.render(markdown), frontMatter: lastFrontMatter };
}

export async function findDocFiles(docsDirectory: string): Promise<DocTree> {
    const result: DocTree = [];
    for await (const e of await fs.opendir(docsDirectory)) {
        if (e.isFile() && e.name.endsWith(".md"))
        {
            const filePath = path.join(docsDirectory, e.name);
            const markdown = (await fs.readFile(filePath)).toString()
            const { html, frontMatter } = renderMarkdown(markdown);
            result.push({type: "doc", file: { path: filePath.substring(docsDirectory.length + 1), title: frontMatter["title"] ?? pageTitle(e.name), markdown, html } });
        }
        else if (e.isDirectory())
        {
            result.push({ type: "dir", name: pageTitle(e.name), entries: await findDocFiles(path.join(docsDirectory, e.name))});
        }
    }
    return result;
}

export function docsContentPlugin(docsTree: DocTree, searchIndex: string): esbuild.Plugin
{
    return {
        name: "mmd-content-plugin",
        async setup(build) {
            // Docs bundle
            build.onResolve({ filter: /^mmd-docs$/ }, args => ({
                path: args.path,
                namespace: 'mmd-ns',
            }));

            build.onLoad({ filter: /.*/, namespace: 'mmd-ns' }, async () => {
                return {
                    contents: `export const content = ${JSON.stringify(docsTree)};`,
                    loader: 'ts',
                };
            });

            // Search index
            build.onResolve({ filter: /^mmd-search-index$/ }, args => ({
                path: args.path,
                namespace: 'mmd-si-ns',
            }));

            build.onLoad({ filter: /.*/, namespace: 'mmd-si-ns' }, async () => {
                return {
                    contents: `export const searchIndexJson = ${searchIndex};`,
                    loader: 'ts',
                };
            });
        }
    };
};