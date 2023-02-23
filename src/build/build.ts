import * as esbuild from "esbuild";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";

import { docsContentPlugin, findDocFiles } from "./docs";
import { BuildOptions, DEFAULT_OPTIONS } from "./options";
import { buildSearchIndex } from "./search";

const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function build(options: BuildOptions, esBuildOptions: esbuild.BuildOptions = {}): Promise<esbuild.BuildContext> {

    const docsDir = options.docsDir ?? DEFAULT_OPTIONS.docsDir;
    const outDir = options.outDir ?? DEFAULT_OPTIONS.outDir;

    const docTree = await findDocFiles(docsDir, docsDir);
    const searchIndex = buildSearchIndex(docTree);

    let context = await esbuild.context(Object.assign(<esbuild.BuildOptions>{
        outfile: path.join(outDir, "bundle.js"),
        entryPoints: [path.join(__dirname, "../app/app.js")],
        bundle: true,
        plugins: [docsContentPlugin(docsDir, searchIndex)],
        minify: true,
    }, esBuildOptions));

    await context.rebuild();

    if (path.resolve(outDir) != path.resolve(STATIC_DIR))
    {
        if (!fsSync.existsSync(outDir))
        {
            await fs.mkdir(outDir);
        }

        const staticFilesToCopy = [
            "index.html",
            "styles.css",
            "github-mark-white.svg"
        ]

        for (const fileName of staticFilesToCopy)
        {
            await fs.copyFile(path.join(STATIC_DIR, fileName), path.join(outDir, fileName));
        }
    }

    return context;
}
