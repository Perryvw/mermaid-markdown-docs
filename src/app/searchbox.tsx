import React, { ChangeEvent, useState } from "react";
import type { DocTree } from "../common/mmd-docs-types";
import { SIDEBAR_WIDTH } from "./styles";
import Lunr from "lunr";

import { searchIndexJson } from "mmd-search-index";
import { Link } from "react-router-dom";

const searchIndex = Lunr.Index.load(searchIndexJson);

export function SearchBox(props: { docTree: DocTree }) {

    type SearchResult = { title: string, exerpt: string, link: string };

    let [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        const inpText = event.currentTarget.value;
    
        if (inpText.length > 2)
        {
            const queryResults = searchIndex.query(q => {
                q.term(inpText, { wildcard: Lunr.Query.wildcard.LEADING | Lunr.Query.wildcard.TRAILING})
            });
            
            setSearchResults(queryResults.map(r => {
                return { title: r.ref, exerpt: "", link: r.ref};
            }))
        }
        else
        {
            if (searchResults.length > 0) {
                setSearchResults([]);
            }
        }
    }

    return <>
        <input type="text" placeholder="Search..." style={{
            margin: 20,
            width: SIDEBAR_WIDTH -  40
        }}
            onChange={handleChange}
        />
        {searchResults.map((r, i) => <Link className="search-result" to={r.link} key={i}>
            <h3>{r.title}</h3>
            <p>{r.exerpt}</p>
        </Link>)}
    </>;
}

