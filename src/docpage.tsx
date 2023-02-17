import React from "react";
import { Outlet } from "react-router";
import { SIDEBAR_WIDTH } from "./styles";

export function DocPage() {
    return <div id="content" className="markdown-body"
        style={{
            width: `calc(100% - ${SIDEBAR_WIDTH}px)`
        }}
    >
        <Outlet />
    </div>;
}