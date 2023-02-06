import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouteObject, RouterProvider } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocTree } from "./mmd-docs-types";

import { Navigation } from "./navigation";
import { DocPage } from "./docpage";

const App = (props: { doctree: DocTree }) =>
    <>
        <Navigation docTree={props.doctree} />
        <DocPage />
    </>;

function Pages(tree: DocTree, pathPrefix: string = ""): RouteObject[] {
    return tree.flatMap(e =>
        e.type === "doc"
            ? [{ path: `${pathPrefix}/${e.file.title}`, element: <div dangerouslySetInnerHTML={{__html: e.file.content}} /> }]
            : Pages(e.entries, `${pathPrefix}/${e.name}`)
    );
}

const router = createHashRouter([
    {
        path: "/",
        element: <App doctree={docs.content} />,
        children: [
            ...Pages(docs.content),
            {
                path: "*",
                element: <div>404</div>
            }
        ]
    }
]);

const root = createRoot(document.getElementById('root')!);
root.render(
    <RouterProvider router={router}></RouterProvider>
);