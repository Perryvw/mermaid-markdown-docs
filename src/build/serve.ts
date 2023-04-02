import * as chokidar from "chokidar";
import * as path from "path";
import { build } from "./build";
import { BuildOptions, DEFAULT_OPTIONS } from "./options";

const SERVE_DIR = path.join(__dirname, "..", "serve");

// Serve/start functionality
export async function serve(options: BuildOptions) {
    const context = await build(
        { outDir: SERVE_DIR },
        {
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
            `,
            },
        }
    );

    let { host, port } = await context.serve({
        servedir: SERVE_DIR,
    });

    console.log(`Started localhost documentation server at ${host}:${port}`);

    // Listen for changes
    const docsDir = options.docsDir ?? DEFAULT_OPTIONS.docsDir;
    chokidar.watch(docsDir).on("change", async (filePath) => {
        if (filePath.endsWith(".md") || filePath.endsWith(".mmd") || filePath.endsWith(".css")) {
            console.log(`Detected changes in ${filePath}`);
            await context.rebuild();
            console.log(`Rebuild done!`);
        }
    });
}
