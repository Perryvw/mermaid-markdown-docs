import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Link, RouteObject, RouterProvider, useLocation } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocFile, DocTree, DocTreeEntry } from "./mmd-docs-types";

import { Navigation } from "./navigation";
import { DocPage } from "./docpage";
import { isHomepage } from "./util";

const titles = createTitleMap(docs.content);

const App = (props: { doctree: DocTree }) => {
    let curLoc = useLocation();
    useEffect(() => {
        console.log(titles, curLoc.pathname, curLoc, titles[curLoc.pathname]);
        document.title = titles[curLoc.pathname] ?? curLoc.pathname;
    }, [curLoc]);

    return <>
        <Navigation docTree={props.doctree} />
        <DocPage />
    </>;
}

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

function createTitleMap(tree: DocTree): Record<string, string> {
    const titles: Record<string, string> = {};

    const handleEntry = (e: DocTreeEntry, pathPrefix: string) => {
        if (e.type === "doc")
        {
            const path = `${pathPrefix}/${encodeURIComponent(e.file.title)}`;
            titles[path] = e.file.title;
        }
        else
        {
            const prefix = `${pathPrefix}/${encodeURIComponent(e.name)}`;
            for (const child of e.entries)
            {
                handleEntry(child, prefix);
            }
        }
    }

    for (const e of tree) {
        handleEntry(e, "");
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