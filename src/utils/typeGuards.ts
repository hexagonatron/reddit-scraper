
export const isStringOrNumber = (val: any): val is string | number => {
    if (typeof val === "string" || typeof val === "number") return true;
    return false;
}