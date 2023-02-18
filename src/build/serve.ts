import * as fs from "fs/promises";
import * as path from "path";
import { build } from "./build";

const DOCS_PATH = "docs";
const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function serve() {
    
    const context = await build();

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
