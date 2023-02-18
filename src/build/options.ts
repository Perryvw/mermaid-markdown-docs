export interface BuildOptions {
    outDir?: string;
    docsDir?: string;
}

export const DEFAULT_OPTIONS: Required<BuildOptions> = {
    outDir: "out",
    docsDir: "docs"
};