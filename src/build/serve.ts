import * as fs from "fs/promises";
import * as path from "path";
import { build } from "./build";
import { BuildOptions, DEFAULT_OPTIONS } from "./options";


const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function serve(options: BuildOptions) {
    
    const context = await build({ outDir: STATIC_DIR });

    let { host, port } = await context.serve({
        servedir: STATIC_DIR,
        
    });

    console.log(`Started localhost documentation server at ${host}:${port}`);

    const docsDir = options.docsDir ?? DEFAULT_OPTIONS.docsDir;
    const watcher = fs.watch(docsDir, { recursive: true });
    for await (const event of watcher)
    {
        if (event.filename.endsWith(".md"))
        {
            console.log(`Detected changes in ${event.filename}, rebuilding...`);
            context.rebuild();
        }
    }
}
