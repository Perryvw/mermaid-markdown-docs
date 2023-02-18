import React, { ReactElement } from "react";
import { Link, NavLink } from "react-router-dom";
import { DocTree } from "../common/mmd-docs-types";
import { SearchBox } from "./searchbox";
import { SIDEBAR_WIDTH } from "./styles";
import { isHomepage } from "./util";

export const Navigation = (props: { docTree: DocTree }) =>
    <div id="navigation" style={{
        width: SIDEBAR_WIDTH
    }}>
        <SearchBox docTree={props.docTree} />
        <ul>
            <li><NavLink to={"/"}>Home</NavLink></li>
            {navigationItems(props.docTree)}
        </ul>
    </div>;

function navigationItems(docTree: DocTree): ReactElement[] {
    return docTree
        .filter(item => item.type !== "doc" || !isHomepage(item.file))  // filter out homepage
        .filter(item => item.type !== "dir" || item.entries.length > 0) // filter out empty directories
        .map((item, i) => {
            if (item.type === "doc") {
                console.log("nav", item.file.path);
                return <li key={i + 1}><NavLink to={item.file.path} className={"navlink"}>{item.file.title}</NavLink></li>
            }
            else
            {
                return <li key={i + 1}>
                    <div>{item.name}</div>
                    <ul>
                        {[...navigationItems(item.entries)]}
                    </ul>
                </li>;
            }
        });
}