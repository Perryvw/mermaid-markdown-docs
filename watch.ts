import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import MarkdownIt from "markdown-it";
import markdownItFrontMatter from "markdown-it-front-matter";
import { parse as parseYaml } from "yaml";

import type {DocTree} from "./src/mmd-docs-types";

const DOCS_PATH = "docs";

let lastFrontMatter = {};
const markdownIt = new MarkdownIt()
    .use(markdownItFrontMatter, frontMatter => {
        lastFrontMatter = parseYaml(frontMatter);
    });

function renderMarkdown(markdown: string): { html: string, frontMatter: Record<string, string> }
{
    return { html: markdownIt.render(markdown), frontMatter: lastFrontMatter };
}

async function findDocFiles(dir: string): Promise<DocTree> {
    const result: DocTree = [];
    for await (const e of await fs.opendir(dir)) {
        if (e.isFile() && e.name.endsWith(".md"))
        {
            const filePath = path.join(dir, e.name);
            const { html, frontMatter } = renderMarkdown((await fs.readFile(filePath)).toString());
            result.push({type: "doc", file: { path: filePath.substring(DOCS_PATH.length + 1), title: frontMatter["title"] ?? e.name, content: html } });
        }
        else if (e.isDirectory())
        {
            result.push({ type: "dir", name: e.name, entries: await findDocFiles(path.join(dir, e.name))});
        }
    }
    return result;
}

const docsContentPlugin: esbuild.Plugin = {
    name: "mmd-content-plugin",
    async setup(build) {
        build.onResolve({ filter: /^mmd-docs$/ }, args => ({
            path: args.path,
            namespace: 'mmd-ns',
        }));

        build.onLoad({ filter: /.*/, namespace: 'mmd-ns' }, async () => {
            const docFiles = await findDocFiles(DOCS_PATH);
            return {
                contents: `export const content = ${JSON.stringify(docFiles)};`,
                loader: 'ts',
            };
        });
    }
};

(async function() {
    let context = await esbuild.context({
        outfile: "public/bundle.js",
        entryPoints: ["src/app.tsx"],
        bundle: true,
        sourcemap: true,
        plugins: [docsContentPlugin]
    });

    context.rebuild();

    let { host, port } = await context.serve({
        servedir: "public"
    });

    console.log(`serving at ${host}:${port}`);



    const watcher = fs.watch(DOCS_PATH, { recursive: true, });
    for await (const event of watcher)
    {
        if (event.filename.endsWith(".md"))
        {
            context.rebuild();
        }
    }
})();