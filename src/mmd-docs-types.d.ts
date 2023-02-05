export interface DocFile {
    title: string,
    content: string
}

export type DocTreeEntry = { type: "doc", file: DocFile } | { type: "dir", name: string, entries: DocTree };
export type DocTree = DocTreeEntry[];