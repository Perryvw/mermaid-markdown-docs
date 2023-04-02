import { DocFile } from "../common/mmd-docs-types";

export function isHomepage(docfile: DocFile): boolean {
    return docfile.path === "index.md";
}

export function stripExtension(path: string): string {
    const separatorIndex = path.lastIndexOf(".");

    if (separatorIndex > 0) {
        return path.substring(0, separatorIndex);
    } else {
        return path;
    }
}
