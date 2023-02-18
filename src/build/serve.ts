import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as path from "path";

import { docsContentPlugin, findDocFiles } from "./docs";
import { buildSearchIndex } from "./search";

const DOCS_PATH = "docs";
const OUTPUT_DIR = "generated";
const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function serve() {
    
    const docTree = await findDocFiles(DOCS_PATH);
    const searchIndex = await buildSearchIndex(docTree);

    let context = await esbuild.context({
        outfile: path.join(STATIC_DIR, "bundle.js"),
        entryPoints: [path.join(__dirname, "../app/app.js")],
        bundle: true,
        sourcemap: true,
        plugins: [docsContentPlugin(docTree, searchIndex)]
    });

    context.rebuild();

    let { host, port } = await context.serve({
        servedir: STATIC_DIR
    });

    console.log(`Started localhost documentation server at ${host}:${port}`);

    const watcher = fs.watch(DOCS_PATH, { recursive: true, });
    for await (const event of watcher)
    {
        if (event.filename.endsWith(".md"))
        {
            context.rebuild();
        }
    }
}
