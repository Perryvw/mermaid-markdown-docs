import * as esbuild from "esbuild";
import * as fs from "fs/promises";

import MarkdownIt from "markdown-it";
import markdownItFrontMatter from "markdown-it-front-matter";
import markdownItMermaidPlugin from "./markdown-it-mermaid-plugin";
import { parse as parseYaml } from "yaml";

import striptags from "striptags";

import type {DocTree, SiteOptions} from "../common/mmd-docs-types";
import { pageTitle } from "./util";
import { tryReadConfigurationFile } from "./options";

let lastFrontMatter = {};
const markdownIt = new MarkdownIt()
    .use(markdownItMermaidPlugin)
    .use(markdownItFrontMatter, frontMatter => {
        lastFrontMatter = parseYaml(frontMatter);
    });

function renderMarkdown(markdown: string, fileDir: string): { html: string, frontMatter: Record<string, string> }
{
    lastFrontMatter = {};
    return { html: markdownIt.render(markdown, { fileDir }), frontMatter: lastFrontMatter };
}

export async function findDocFiles(docsDirectory: string, pathPrefix: string): Promise<DocTree> {
    const result: DocTree = [];
    for await (const e of await fs.opendir(docsDirectory)) {
        if (e.isFile() && e.name.endsWith(".md"))
        {
            const filePath = `${docsDirectory}/${e.name}`;
            const markdown = (await fs.readFile(filePath)).toString()
            const { html, frontMatter } = renderMarkdown(markdown, docsDirectory);
            const searchtext = striptags(html);
            result.push({type: "doc", file: { path: filePath.substring(pathPrefix.length + 1), title: frontMatter["title"] ?? pageTitle(e.name), searchtext, html } });
        }
        else if (e.isDirectory())
        {
            result.push({ type: "dir", name: pageTitle(e.name), entries: await findDocFiles(`${docsDirectory}/${e.name}`, pathPrefix)});
        }
    }
    return result;
}

export function docsContentPlugin(docsDir: string, searchIndex: string): esbuild.Plugin
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
                const docsTree = await findDocFiles(docsDir, docsDir);
                const options = tryReadConfigurationFile();
                const siteOptions: SiteOptions = {
                    title: options.title,
                    repository: options.repository
                }
                return {
                    contents: `export const content = ${JSON.stringify(docsTree)};`
                        + `export const options = ${JSON.stringify(siteOptions)};`,
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
