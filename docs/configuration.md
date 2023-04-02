---
title: Configuration
---

Configuration for mermaid-markdown-docs is automatically loaded from `mmd.configuration.json` in your project root (next to package.json). This file allows you to specify options that affect what `mermaid-markdown-docs` does and how the resulting documentation webiste looks.

The configuration is just simple JSON:

```json
{
    "title": "Example",
    "outDir": "out",
    ...
}
```

### Site customization keys

| Key        | Description                                                           |
| ---------- | --------------------------------------------------------------------- |
| title      | The title to show at the top of the page.                             |
| repository | If present, places a github icon with link to the give repository url |
| customCSS  | If set, overrides the default CSS file with the provided file         |

### Build option keys

| Key    | Description                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------ |
| docs   | The directory (relative to the configuration file) where to look for input markdown files. (Default: "docs") |
| outDir | The directory (relative to the configuration file) where to output the created files. (Default: "out")       |
