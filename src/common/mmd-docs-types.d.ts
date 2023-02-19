export interface DocFile {
    path: string,
    title: string,
    searchtext: string,
    html: string
}

export type DocTreeEntry = { type: "doc", file: DocFile } | { type: "dir", name: string, entries: DocTree };
export type DocTree = DocTreeEntry[];