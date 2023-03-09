import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Link, RouteObject, RouterProvider, useLocation } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocFile, DocTree, SiteOptions } from "../common/mmd-docs-types";

import { Navigation } from "./navigation";
import { DocPage } from "./docpage";
import { isHomepage, stripExtension } from "./util";
import mermaid from "mermaid";
import { iterateDocFiles } from "../build/util";
import { TopBar } from "./topbar";
import hljs from "highlight.js";

const titles = createTitleMap(docs.content);

const App = (props: { doctree: DocTree, options: SiteOptions }) => {

    mermaid.initialize({ theme: "dark" });

    let curLoc = useLocation();
    // on initial load
    useEffect(() => {
        console.log(curLoc.hash)
        if (curLoc.hash.length > 1)
        {
            const element = document.getElementById(curLoc.hash.substring(1));
            console.log(element);
            if (element)
            {
                setTimeout(() => element.scrollIntoView(), 0); 
            }
        }
    }, []);
    // on navigating
    useEffect(() => {
        document.title = titles[curLoc.pathname.substring(1)] ?? curLoc.pathname;

        mermaid.contentLoaded();
        hljs.highlightAll();
    }, [curLoc]);

    return <>
        <TopBar options={props.options} />
        <div id="docs">
            <Navigation docTree={props.doctree} />
            <DocPage />
        </div>
    </>;
}

function Page(docFile: DocFile) {
    return { path: stripExtension(docFile.path), element: <>
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
        {tree.length > 0
            ? <ul>
                {tree.map((e, i) => e.type === "doc" 
                    ? <li key={i}><Link to={stripExtension(e.file.path)}>{e.file.title}</Link></li>
                    : <li key={i}><Link to={e.name}>{e.name}</Link></li>
                )}
            </ul>
            : <p>No documentation files could be found :(</p>
        }

    </>;
}

function HomePage(tree: DocTree) {
    const homepage = tree.find(e => e.type === "doc" && isHomepage(e.file)) as { file: DocFile };
    if (homepage)
    {
        return Page(homepage.file).element;
    }
    else
    {
        return DirectoryPage(tree);
    }
}

function createTitleMap(tree: DocTree): Record<string, string> {
    const titles: Record<string, string> = {
        [""]: "Homepage"
    };

    for (const docFile of iterateDocFiles(tree))
    {
        titles[stripExtension(docFile.path)] = docFile.title;
    }

    return titles;
}

const router = createHashRouter([
    {
        path: "/",
        element: <App doctree={docs.content} options={docs.options} />,
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