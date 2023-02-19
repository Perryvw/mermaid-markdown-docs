import React, { useState } from "react";
import type { DocFile, DocTree } from "../common/mmd-docs-types";
import { SIDEBAR_WIDTH } from "./styles";
import Lunr from "lunr";

import { searchIndexJson } from "mmd-search-index";
import { Link } from "react-router-dom";
import { iterateDocFiles } from "../build/util";

type SearchResult = { title: string, exerpt: React.ReactElement, link: string };

// Load index from file once
const searchIndex = Lunr.Index.load(searchIndexJson);

const SearchResult = (props: { result: SearchResult, onClick?: React.MouseEventHandler<HTMLAnchorElement> }) =>
    <Link className="search-result" to={props.result.link} onClick={props.onClick}>
        <h3>{props.result.title}</h3>
        <p>{props.result.exerpt}</p>
    </Link>;

export function SearchBox(props: { docTree: DocTree }) {
    let docsMap: Record<string, DocFile> = {};
    for (const docFile of iterateDocFiles(props.docTree))
    {
        docsMap[docFile.path] = docFile;
    }

    let [inputValue, setInputValue] = useState('');
    let [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    function handleChange(event: React.FormEvent<HTMLInputElement>) {
        const inpText = event.currentTarget.value;
        setInputValue(inpText);
    
        if (inpText.length > 2)
        {
            const searchTerm = inpText.toLowerCase();
            const queryResults = searchIndex.query(q => {
                q.term(searchTerm, { wildcard: Lunr.Query.wildcard.LEADING | Lunr.Query.wildcard.TRAILING})
            });
            
            setSearchResults(queryResults.map(r => {
                return matchQueryResult(r, searchTerm, docsMap);
            }))
        }
        else
        {
            if (searchResults.length > 0) {
                setSearchResults([]);
            }
        }
    }

    function onSearchResultClick()
    {
        setInputValue('');
        setSearchResults([]);
    }

    return <>
        <input type="text" 
            placeholder="Search..."
            value={inputValue}
            onChange={handleChange}

            style={{
                margin: 20,
                width: SIDEBAR_WIDTH -  40
            }}
        />
        {searchResults.map((r, i) => <SearchResult key={i} result={r} onClick={onSearchResultClick} />)}
    </>;
}

function matchQueryResult(result: Lunr.Index.Result, searchTerm: string, docsMap: Record<string, DocFile>): SearchResult
{
    const docPage = docsMap[result.ref];

    if (docPage)
    {
        let exerpt = <></>;

        // Try to find a nice exerpt
        const match = new RegExp(searchTerm, "i").exec(docPage.searchtext);
        if (match)
        {
            const newlineBefore = docPage.searchtext.lastIndexOf("\n", match.index);
            const newlineAfter = docPage.searchtext.indexOf("\n", match.index);

            const textBefore = docPage.searchtext.substring(newlineBefore + 1, match.index);
            const textAfter = docPage.searchtext.substring(match.index + searchTerm.length, newlineAfter);

            exerpt = <>{textBefore}<span className="search-highlight">{searchTerm}</span>{textAfter}</>;
        }

        return { title: docPage.title, exerpt, link: docPage.path};
    }
    else
    {
        // Fallback, try to do our best
        return { title: result.ref, exerpt: <></>, link: result.ref};
    }
}

