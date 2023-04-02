import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as fsSync from "fs";
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
import { BuildOptions, tryReadConfigurationFile } from "./options";
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
    return {
        name: "mmd-content-plugin",
        async setup(build) {
            let additionalOutputFiles: string[] = [];
            let docs: DocTree = undefined!;
            let options: BuildOptions & SiteOptions = undefined!;
            let siteOptions: SiteOptions = undefined!;

            build.onStart(async () => {
                // Get settings
                options = tryReadConfigurationFile();
                siteOptions = {
                    title: options.title,
                    repository: options.repository,
                };

                // Find docs
                docs = await findDocFiles(docsDir, docsDir);

                // Make sure to emit additional files at end of compilation
                additionalOutputFiles = [];
                for (const f of iterateDocFiles(docs)) {
                    additionalOutputFiles.push(...f.fileDependencies);
                }
            });

            build.onEnd(async () => {
                let outDir = process.cwd();
                if (build.initialOptions.outdir) {
                    outDir = build.initialOptions.outdir;
                } else if (build.initialOptions.outfile) {
                    outDir = path.dirname(build.initialOptions.outfile);
                }

                // Include custom css
                if (options.customCSS) {
                    const cssPath = path.isAbsolute(options.customCSS)
                        ? options.customCSS
                        : path.resolve(options.customCSS);

                    if (fsSync.existsSync(cssPath)) {
                        await fs.copyFile(cssPath, path.join(outDir, "styles.css"));
                    } else {
                        console.error(`Could not find custom CSS file ${cssPath}!`);
                    }
                }

                // deduplicate files
                const uniqueAdditionalOutputFiles = [...new Set(additionalOutputFiles).values()];

                await Promise.all(
                    uniqueAdditionalOutputFiles.map((f) => {
                        const fileName = path.basename(f);
                        return fs.copyFile(f, path.join(outDir, fileName));
                    })
                );
            });

            // Docs bundle
            build.onResolve({ filter: /^mmd-docs$/ }, (args) => ({
                path: args.path,
                namespace: "mmd-ns",
            }));

            build.onLoad({ filter: /.*/, namespace: "mmd-ns" }, async () => {
                return {
                    contents:
                        `export const content = ${JSON.stringify(docs)};` +
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
        },
    };
}
