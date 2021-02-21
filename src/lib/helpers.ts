export const toBase64 = (string: string) => Buffer.from(string).toString('base64');

export const optionsToParams = (object: object) => {
    const params = new URLSearchParams();
    for(const [key, value] of Object.entries(object)) {
        params.append(key, value);
    }
    return params;
}