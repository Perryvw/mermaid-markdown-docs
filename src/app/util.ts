import { DocFile } from "../common/mmd-docs-types";

export function isHomepage(docfile: DocFile): boolean {
    return docfile.path === "index.md";
}
