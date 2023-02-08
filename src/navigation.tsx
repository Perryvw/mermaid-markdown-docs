import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { DocTree } from "./mmd-docs-types";
import { SIDEBAR_WIDTH } from "./styles";
import { isHomepage } from "./util";

export const Navigation = (props: { docTree: DocTree }) =>
    <div id="navigation" style={{
        width: SIDEBAR_WIDTH
    }}>
        <SearchBox />
        <ul>
            <li><Link to={"/"}>Home</Link></li>
            {navigationItems(props.docTree, "")}
        </ul>
    </div>;

const SearchBox = () =>
    <input type="text" placeholder="Search..." style={{
        margin: 20,
        width: SIDEBAR_WIDTH -  40
    }} />;

function navigationItems(docTree: DocTree, pathPrefix: string): ReactElement[] {
    return docTree
        .filter(item => item.type !== "doc" || !isHomepage(item.file)) // filter out homepage
        .map((item, i) => {
            if (item.type === "doc") {
                return <li key={i + 1}><Link to={pathPrefix + item.file.title}>{item.file.title}</Link></li>
            }
            else
            {
                return <li key={i + 1}>
                    <ul>
                        {[...navigationItems(item.entries, `${pathPrefix}/${item.name}/`)]}
                    </ul>
                </li>;
            }
        });
}