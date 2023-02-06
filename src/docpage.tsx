import React from "react";
import { Outlet } from "react-router";

export function DocPage() {
    return <div id="content">
        <Outlet />
    </div>;
}