import React from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Link, RouteObject, RouterProvider } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocFile, DocTree } from "./mmd-docs-types";

import { Navigation } from "./navigation";
import { DocPage } from "./docpage";
import { isHomepage } from "./util";

const App = (props: { doctree: DocTree }) =>
    <>
        <Navigation docTree={props.doctree} />
        <DocPage />
    </>;

function Page(path: string, content: string) {
    return { path, element: <div dangerouslySetInnerHTML={{__html: content}} /> };
}

function Pages(tree: DocTree, pathPrefix: string = ""): RouteObject[] {
    return tree.flatMap(e =>
        e.type === "doc"
            ? [Page(`${pathPrefix}/${e.file.title}`, e.file.content)]
            : Pages(e.entries, `${pathPrefix}/${e.name}`)
    );
}

function DirectoryPage(tree: DocTree) {
    return <>
        <h1>Table of Contents</h1>
        <ul>
            {tree.map((e, i) => e.type === "doc" 
                ? <li key={i}><Link to={e.file.title}>{e.file.title}</Link></li>
                : <li key={i}><Link to={e.name}>{e.name}</Link></li>
            )}
        </ul>
    </>;
}

function HomePage(tree: DocTree) {
    const homepage = tree.find(e => e.type === "doc" && isHomepage(e.file)) as { file: DocFile };
    if (homepage)
    {
        return <div dangerouslySetInnerHTML={{__html: homepage.file.content}} />;
    }
    else
    {
        return DirectoryPage(tree);
    }
}

const router = createHashRouter([
    {
        path: "/",
        element: <App doctree={docs.content} />,
        children: [
            { index: true, element: HomePage(docs.content) },
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