import * as esbuild from "esbuild";

let result = await esbuild.build({
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "public/bundle.js",
    entryPoints: ["src/app.tsx"],
})