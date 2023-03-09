import type MarkdownIt from "markdown-it";
import * as fs from "fs";
import * as path from "path";

export default function(md: MarkdownIt) {
    const defaultRenderer = md.renderer.rules.fence!.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
        const token = tokens[idx];
        if (token.tag === "code" && token.info === "mermaid")
        {
            return `<pre class="mermaid">${token.content}</pre>`;
        }
        else if (token.tag === "code" && token.info.length == 0)
        {
            // Set codeblocks without language set to be plaintext so they dont get random highlighting assigned
            token.info = "plaintext";
            return defaultRenderer(tokens, idx, opts, env, self);
        }
        else
        {
            return defaultRenderer(tokens, idx, opts, env, self);
        }
    };

    const defaultImageRenderer = md.renderer.rules.image!.bind(md.renderer.rules);
    md.renderer.rules.image = (tokens, idx, opts, env, self) => {
        const src = tokens[idx].attrGet("src");
        if (src?.endsWith(".mmd")) {
            const filePath = path.resolve(path.join(env.fileDir, src));

            if (fs.existsSync(filePath))
            {
                const mermaidText = fs.readFileSync(filePath).toString();
                return `<pre class="mermaid">${mermaidText}</pre>`;
            }
            else
            {
                return `<pre class="mermaid">
                    flowchart
                        err[Could not find mermaid file: ${src}]

                    classDef warn fill:#f44, stroke:#333,stroke-width:4px
                    class err warn
                </pre>`;
            }
        }
        return defaultImageRenderer(tokens, idx, opts, env, self);
    };
}
