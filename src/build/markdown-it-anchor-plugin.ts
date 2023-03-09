import type MarkdownIt from "markdown-it";

export default function(md: MarkdownIt) {
    md.renderer.rules.heading_open = (tokens, idx, opts, env, self) => {
        const headingOpenToken = tokens[idx];
        if (headingOpenToken.tag === "h1" || headingOpenToken.tag === "h2" || headingOpenToken.tag === "h3")
        {
            const headingContentToken = tokens[idx + 1];

            const id = headingContentToken.content.replaceAll(" ", "-");
            
            return `<a href="#/${env.route}#${id}" class="section-anchor-${headingOpenToken.tag}">#</a><${headingOpenToken.tag} id="${id}">`;
        }

        return self.renderToken(tokens, idx, opts);
    };
}
