import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, Link, Outlet, RouteObject, RouterProvider } from "react-router-dom";

import * as docs from "mmd-docs";
import { DocTree } from "./mmd-docs-types";

const App = (props: { message: string }) => {
    const [count, setCount] = useState(0);
    const increment = useCallback(() => {
        setCount(count => count + 1);
    }, [count]);
    return(<>
        <h1>{props.message}</h1>
        <h2>Count: {count}</h2>
        <button onClick={increment}>Increment</button>
    </>);
};

function Navigation(props: { docTree: DocTree, prefix?: string }) {
    const prefix = props.prefix ?? "";
    return <ul>
        {props.docTree.map((e, i) => e.type === "doc"
            ? <li key={i}><Link to={prefix + e.file.title}>{e.file.title}</Link></li>
            : <li key={i}><Navigation docTree={e.entries} prefix={`${prefix}/${e.name}/`} /></li>
        )}
    </ul>;
}

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
        element: <div>
            <Navigation docTree={docs.content} />
            <br/><br/>
            <Outlet />
        </div>,
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