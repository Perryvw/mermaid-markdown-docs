
import Lunr from "lunr";
import { DocTree } from "../common/mmd-docs-types";
import { iterateDocFiles } from "./util";

export function buildSearchIndex(tree: DocTree): string
{
    const index = Lunr(function() {

        this.field('title');
        this.field('text');

        for (const docFile of iterateDocFiles(tree))
        {
            this.add({ title: docFile.title, text: docFile.markdown, id: docFile.path });
        }
    });
    
    const serialized = JSON.stringify(index.toJSON());
    return serialized;
}