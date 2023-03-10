import * as chokidar from "chokidar";
import * as fs from "fs/promises";
import * as path from "path";
import { build } from "./build";
import { BuildOptions, DEFAULT_OPTIONS } from "./options";


const STATIC_DIR = path.join(__dirname, "..", "static");

// Serve/start functionality
export async function serve(options: BuildOptions) {
    
    const context = await build({ outDir: STATIC_DIR }, { 
        sourcemap: true,
        banner: {
            js: `
            document.addEventListener("DOMContentLoaded", function (event) {
                var scrollpos = sessionStorage.getItem('scrollpos');
                if (scrollpos) {
                    setTimeout(() => {
                        window.scrollTo(0, scrollpos);
                        sessionStorage.removeItem('scrollpos');
                    }, 0);
                }
            });
        
            new EventSource("/esbuild").addEventListener("change", () => {
                sessionStorage.setItem('scrollpos', window.scrollY);
                location.reload();
            });
            `
        },
    });

    let { host, port } = await context.serve({
        servedir: STATIC_DIR,        
    });

    console.log(`Started localhost documentation server at ${host}:${port}`);

    const docsDir = options.docsDir ?? DEFAULT_OPTIONS.docsDir;
    chokidar.watch(docsDir).on("change", async filePath => {
        if (filePath.endsWith(".md") || filePath.endsWith(".mmd"))
        {
            console.log(`Detected changes in ${filePath}, rebuilding...`);
            await context.rebuild();
        }
    });
}
