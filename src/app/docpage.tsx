import React from "react";
import { Outlet } from "react-router";

export function DocPage() {
    return (
        <div id="content-container">
            <div id="content" className="markdown-body">
                <Outlet />
            </div>
        </div>
    );
}
