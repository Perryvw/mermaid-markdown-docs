import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { DocTree } from "./mmd-docs-types";

export function Navigation(props: { docTree: DocTree }) {
    return <div id="navigation">
        <SearchBox />
        <ul>
            {[...navigationItems(props.docTree, "")]}
        </ul>
    </div>;
}

function SearchBox() {
    return <input type="text" placeholder="Search..." style={{
        margin: 20
    }} />;
}

function* navigationItems(docTree: DocTree, pathPrefix: string): Iterable<ReactElement> {
    let i = 0;
    for (const item of docTree)
    {
        if (item.type === "doc") {
            yield <li key={i}><Link to={pathPrefix + item.file.title}>{item.file.title}</Link></li>
        }
        else
        {
            yield <li key={i}>
                <ul>
                    {[...navigationItems(item.entries, `${pathPrefix}/${item.name}/`)]}
                </ul>
            </li>;
        }

        i++;
    }
}