import React from "react";
import { SiteOptions } from "../common/mmd-docs-types";

export const TopBar = (props: { options: SiteOptions }) => (
    <div id="topbar">
        <h2 id="title">{props.options.title ?? "Documentation"}</h2>
        {props.options.repository && (
            <a className="repository-link" href={props.options.repository}>
                <img alt="Repository" src="github-mark-white.svg" />
            </a>
        )}
    </div>
);
