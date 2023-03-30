export interface DocFile {
    path: string,
    title: string,
    searchtext: string,
    html: string,
    fileDependencies: string[]
}

export type DocTreeEntry = { type: "doc", file: DocFile } | { type: "dir", name: string, entries: DocTree };
export type DocTree = DocTreeEntry[];

export interface SiteOptions {
    title?: string;
    repository?: string;
}