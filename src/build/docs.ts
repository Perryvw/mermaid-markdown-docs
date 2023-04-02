import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import MarkdownIt from "markdown-it";
import markdownItFrontMatter from "markdown-it-front-matter";
import markdownItAnchorPlugin from "./markdown-it-anchor-plugin";
import markdownItMermaidPlugin from "./markdown-it-mermaid-plugin";
import markdownItImagePlugin from "./markdown-it-image-plugin";
import { parse as parseYaml } from "yaml";

import striptags from "striptags";

import type { DocTree, SiteOptions } from "../common/mmd-docs-types";
import { iterateDocFiles, pageTitle } from "./util";
import { tryReadConfigurationFile } from "./options";
import { stripExtension } from "../app/util";

let lastFrontMatter = {};
let images: string[] = [];

const markdownIt = new MarkdownIt()
    .use(markdownItAnchorPlugin)
    .use(markdownItImagePlugin, (image: string) => {
        images.push(image);
    })
    .use(markdownItMermaidPlugin)
    .use(markdownItFrontMatter, (frontMatter) => {
        lastFrontMatter = parseYaml(frontMatter);
    });

interface MarkdownResult {
    html: string;
    frontMatter: Record<string, string>;
    images: string[];
}

function renderMarkdown(markdown: string, fileDir: string, route: string): MarkdownResult {
    images = [];
    lastFrontMatter = {};

    const html = markdownIt.render(markdown, { fileDir, route });
    const imagePaths = images.map((i) => path.join(fileDir, i));

    return { html, frontMatter: lastFrontMatter, images: imagePaths };
}

export async function findDocFiles(docsDirectory: string, pathPrefix: string): Promise<DocTree> {
    const result: DocTree = [];
    for await (const e of await fs.opendir(docsDirectory)) {
        if (e.isFile() && e.name.endsWith(".md")) {
            const filePath = `${docsDirectory}/${e.name}`;
            const markdown = (await fs.readFile(filePath)).toString();
            const { html, frontMatter, images } = renderMarkdown(
                markdown,
                docsDirectory,
                stripExtension(filePath.substring(pathPrefix.length + 1))
            );
            const searchtext = striptags(html);
            result.push({
                type: "doc",
                file: {
                    path: filePath.substring(pathPrefix.length + 1),
                    title: frontMatter?.["title"] ?? pageTitle(e.name),
                    searchtext,
                    html,
                    fileDependencies: images,
                },
            });
        } else if (e.isDirectory()) {
            result.push({
                type: "dir",
                name: pageTitle(e.name),
                entries: await findDocFiles(`${docsDirectory}/${e.name}`, pathPrefix),
            });
        }
    }
    return result;
}

export function docsContentPlugin(docsDir: string, searchIndex: string): esbuild.Plugin {
    let additionalOutputFiles: string[] = [];

    return {
        name: "mmd-content-plugin",
        async setup(build) {
            // Docs bundle
            build.onResolve({ filter: /^mmd-docs$/ }, (args) => ({
                path: args.path,
                namespace: "mmd-ns",
            }));

            build.onLoad({ filter: /.*/, namespace: "mmd-ns" }, async () => {
                const docsTree = await findDocFiles(docsDir, docsDir);
                const options = tryReadConfigurationFile();
                const siteOptions: SiteOptions = {
                    title: options.title,
                    repository: options.repository,
                };

                for (const f of iterateDocFiles(docsTree)) {
                    additionalOutputFiles.push(...f.fileDependencies);
                }

                return {
                    contents:
                        `export const content = ${JSON.stringify(docsTree)};` +
                        `export const options = ${JSON.stringify(siteOptions)};`,
                    loader: "ts",
                };
            });

            // Search index
            build.onResolve({ filter: /^mmd-search-index$/ }, (args) => ({
                path: args.path,
                namespace: "mmd-si-ns",
            }));

            build.onLoad({ filter: /.*/, namespace: "mmd-si-ns" }, async () => {
                return {
                    contents: `export const searchIndexJson = ${searchIndex};`,
                    loader: "ts",
                };
            });

            build.onStart(() => {
                additionalOutputFiles = [];
            });

            build.onEnd(async () => {
                await Promise.all(
                    additionalOutputFiles.map((f) => {
                        const fileName = path.basename(f);

                        let outDir = process.cwd();
                        if (build.initialOptions.outdir) {
                            outDir = build.initialOptions.outdir;
                        } else if (build.initialOptions.outfile) {
                            outDir = path.dirname(build.initialOptions.outfile);
                        }

                        return fs.copyFile(f, path.join(outDir, fileName));
                    })
                );
            });
        },
    };
}
