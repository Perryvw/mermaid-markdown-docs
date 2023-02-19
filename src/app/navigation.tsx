import React, { ReactElement } from "react";
import { Link, NavLink } from "react-router-dom";
import { DocTree, DocTreeEntry } from "../common/mmd-docs-types";
import { SearchBox } from "./searchbox";
import { isHomepage, stripExtension } from "./util";

export const Navigation = (props: { docTree: DocTree }) =>
    <div id="navigation">
        <SearchBox docTree={props.docTree} />
        <ul>
            <li><NavLink className={"navlink"}  to={"/"}>Home</NavLink></li>
            {navigationItems(props.docTree)}
        </ul>
    </div>;

function navigationItems(docTree: DocTree): ReactElement[] {

    // Order: First individual pages, then child directories
    const docChildren = docTree.filter(item => item.type === "doc" && !isHomepage(item.file)) as Array<DocTreeEntry & { type: "doc"}>;
    const dirChildren = docTree.filter(item => item.type === "dir" && item.entries.length > 0) as Array<DocTreeEntry & { type: "dir"}>;

    return [
        ...docChildren.map((item, i) => <li key={i}><NavLink to={stripExtension(item.file.path)} className={"navlink"}>{item.file.title}</NavLink></li>),
        ...dirChildren.map((item, j) => <li key={docChildren.length + j}>
            <div className="group-heading">{item.name}</div>
            <ul>
                {[...navigationItems(item.entries)]}
            </ul>
        </li>)
    ];
}