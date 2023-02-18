import * as esbuild from "esbuild";
import * as path from "path";

import { docsContentPlugin, findDocFiles } from "./docs";
import { buildSearchIndex } from "./search";

const DOCS_PATH = "docs";
const OUTPUT_DIR = "generated";
const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function build(): Promise<esbuild.BuildContext> {

    const docTree = await findDocFiles(DOCS_PATH, DOCS_PATH);
    const searchIndex = buildSearchIndex(docTree);

    let context = await esbuild.context({
        outfile: path.join(STATIC_DIR, "bundle.js"),
        entryPoints: [path.join(__dirname, "../app/app.js")],
        bundle: true,
        sourcemap: true,
        plugins: [docsContentPlugin(docTree, searchIndex)]
    });

    context.rebuild();

    return context;
}
