import type MarkdownIt from "markdown-it";

export default function(md: MarkdownIt) {
    const defaultRenderer = md.renderer.rules.fence!.bind(md.renderer.rules);
    md.renderer.rules.fence = (tokens, idx, opts, env, self) => {
        const token = tokens[idx];
        if (token.tag === "code" && token.info === "mermaid")
        {
            return `<pre class="mermaid">${token.content}</pre>`;
        }
        else
        {
            return defaultRenderer(tokens, idx, opts, env, self);
        }
    };
}