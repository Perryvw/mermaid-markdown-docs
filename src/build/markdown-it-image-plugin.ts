import type MarkdownIt from "markdown-it";

export default function(md: MarkdownIt, cb: (v: string) => void) {
    const defaultImageRenderer = md.renderer.rules.image!.bind(md.renderer.rules);
    md.renderer.rules.image = (tokens, idx, opts, env, self) => {
        cb(tokens[idx].attrGet("src")!);
        return defaultImageRenderer(tokens, idx, opts, env, self);
    };
}
