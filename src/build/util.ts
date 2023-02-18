import { DocFile, DocTree } from "../common/mmd-docs-types";

export function nicelyCapitalize(str: string): string {
    if (str.length == 0) return "";
    return str[0].toUpperCase() + str.slice(1);
}

export function pageTitle(path: string): string {
    if (path.includes("."))
    {
        return nicelyCapitalize(path.substring(0, path.lastIndexOf(".")));
    }
    else
    {
        return nicelyCapitalize(path);
    }
}

export function* iterateDocFiles(tree: DocTree): Iterable<DocFile> {
    for (const item of tree)
    {
        if (item.type === "doc")
        {
            yield item.file;
        }
        else
        {
            yield* iterateDocFiles(item.entries);
        }
    }
}