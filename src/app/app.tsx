import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Link, RouteObject, RouterProvider, useLocation } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocFile, DocTree, DocTreeEntry } from "../common/mmd-docs-types";

import { Navigation } from "./navigation";
import { DocPage } from "./docpage";
import { isHomepage } from "./util";
import mermaid from "mermaid";
import { iterateDocFiles } from "../build/util";

const titles = createTitleMap(docs.content);

const App = (props: { doctree: DocTree }) => {
    let curLoc = useLocation();
    useEffect(() => {
        document.title = titles[curLoc.pathname.substring(1)] ?? curLoc.pathname;

        mermaid.contentLoaded();
    }, [curLoc]);

    return <>
        <Navigation docTree={props.doctree} />
        <DocPage />
    </>;
}

function Page(docFile: DocFile) {
    return { path: docFile.path, element: <>
        <h1>{docFile.title}</h1>
        <div dangerouslySetInnerHTML={{__html: docFile.html}} />
    </> 
    };
}

function Pages(tree: DocTree): RouteObject[] {
    return tree.flatMap(e =>
        e.type === "doc"
            ? [Page(e.file)]
            : Pages(e.entries)
    );
}

function DirectoryPage(tree: DocTree) {
    return <>
        <h1>Table of Contents</h1>
        <ul>
            {tree.map((e, i) => e.type === "doc" 
                ? <li key={i}><Link to={e.file.path}>{e.file.title}</Link></li>
                : <li key={i}><Link to={e.name}>{e.name}</Link></li>
            )}
        </ul>
    </>;
}

function HomePage(tree: DocTree) {
    const homepage = tree.find(e => e.type === "doc" && isHomepage(e.file)) as { file: DocFile };
    if (homepage)
    {
        return <div dangerouslySetInnerHTML={{__html: homepage.file.html}} />;
    }
    else
    {
        return DirectoryPage(tree);
    }
}

function createTitleMap(tree: DocTree): Record<string, string> {
    const titles: Record<string, string> = {};

    for (const docFile of iterateDocFiles(tree))
    {
        titles[docFile.path] = docFile.title;
    }

    return titles;
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