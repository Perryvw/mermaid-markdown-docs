declare module "mmd-docs" {
    export const content: import("./mmd-docs-types").DocTree;
    export const options: import("./mmd-docs-types").SiteOptions;
}

declare module "mmd-search-index" {
    export const searchIndexJson: object;
}