declare module "mmd-docs" {
    export const content: import("./mmd-docs-types").DocTree;
}

declare module "mmd-search-index" {
    export const searchIndexJson: object;
}