export function nicelyCapitalize(str: string): string {
    if (str.length == 0) return "";
    return str[0].toUpperCase() + str.slice(1);
}

export function pageTitle(path: string): string {
    if (path.includes("."))
    {
        return nicelyCapitalize(path.substring(0, path.lastIndexOf(".")));
    }
    else
    {
        return nicelyCapitalize(path);
    }
}