#!/usr/bin/env node

import { build } from "../build/build";
import { serve } from "../build/serve";

enum ActionType {
    Error,
    Help,
    Build,
    Serve
}

type CliAction =
    { type: ActionType.Help; }
    | { type: ActionType.Build; }
    | { type: ActionType.Serve; }
    | { type: ActionType.Error; message: string; };

function validateCliArguments(args: string[]): CliAction {
    if (args.length < 3) {
        return { type: ActionType.Help };
    }

    if (args[2] === "build")
    {
        return { type: ActionType.Build };
    }
    else if (args[2] === "serve")
    {
        return { type: ActionType.Serve };
    }
    else if (args[2] === "help" || args[2] === "-h")
    {
        return { type: ActionType.Help };
    }
    else
    {
        return { type: ActionType.Error, message: `Action '${args[2]}' not recognized, see -h` };
    }
}

const action = validateCliArguments(process.argv);

if (action.type === ActionType.Help)
{
    console.log(`
mermaid-markdown-docs builds a documentation website from markdown files. It has built-in
support for mermaid diagrams and documentation search without requiring external services.

CLI usage:

mermaid-markdown-docs help                  Display this help page
mermaid-markdown-docs build [options]       Build the documentation website
mermaid-markdown-docs serve [options]       Start a server and file watcher for local development
`);
}
else if (action.type === ActionType.Build)
{
    build({}).then(process.exit(0));
}
else if (action.type === ActionType.Serve)
{
    serve({});
}
else
{
    throw action.message;
}