import * as fs from "fs";
import { SiteOptions } from "../common/mmd-docs-types";

export interface BuildOptions {
    outDir?: string;
    docsDir?: string;
}

export const DEFAULT_OPTIONS: Required<BuildOptions> = {
    outDir: "out",
    docsDir: "docs"
};

const CONFIG_FILE_NAME = "mmd.configuration.json";

export function tryReadConfigurationFile(): BuildOptions & SiteOptions
{
    if (fs.existsSync(CONFIG_FILE_NAME)) {
        const configurationTxt = fs.readFileSync(CONFIG_FILE_NAME);
        return JSON.parse(configurationTxt.toString());
    }
    else {
        return {};
    }
}
