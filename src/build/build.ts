import * as esbuild from "esbuild";
import * as path from "path";

import { docsContentPlugin, findDocFiles } from "./docs";
import { BuildOptions, DEFAULT_OPTIONS } from "./options";
import { buildSearchIndex } from "./search";

// Serve/start functionality
export async function build(options: BuildOptions): Promise<esbuild.BuildContext> {

    const docsDir = options.docsDir ?? DEFAULT_OPTIONS.docsDir;
    const outDir = options.outDir ?? DEFAULT_OPTIONS.outDir;

    const docTree = await findDocFiles(docsDir, docsDir);
    const searchIndex = buildSearchIndex(docTree);

    let context = await esbuild.context({
        outfile: path.join(outDir, "bundle.js"),
        entryPoints: [path.join(__dirname, "../app/app.js")],
        bundle: true,
        sourcemap: true,
        plugins: [docsContentPlugin(docTree, searchIndex)]
    });

    context.rebuild();

    return context;
}
