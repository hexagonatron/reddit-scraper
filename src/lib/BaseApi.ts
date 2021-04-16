
abstract class BaseApi {
    private baseUrl:string;

    protected constructor(baseUrl:string) {
        this.baseUrl = baseUrl;
    }

    private httpRequest<ResponseType>(url: string, options: RequestInit): Promise<ResponseType> {
        console.log(`[DEBUG] ${new Date().toLocaleString()}: ${options.method?.toUpperCase()} ${url}`);
        return fetch(url, options)
            .then(results => {
                if (results.ok) {
                    return results.json() as Promise<ResponseType>;
                }
                throw new Error(results.statusText)
            });
    }

    protected postRequest<ResponseType>(path: string, body: FormData, headers?: Headers): Promise<ResponseType> {
        const options: RequestInit = {
            body: body,
            headers: headers,
            method: "POST"
        }

        return this.httpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected getRequest<ResponseType>(path: string, headers?: Headers): Promise<ResponseType> {

        const options: RequestInit = {
            headers: headers,
            method: "GET"
        }

        return this.httpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected putRequest<ResponseType>(path: string, body: FormData, headers?: Headers): Promise<ResponseType> {
        const options: RequestInit = {
            body: body,
            headers: headers,
            method: "PUT"
        }

        return this.httpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected deleteRequest<ResponseType>(path: string, headers?: Headers): Promise<ResponseType> {

        const options: RequestInit = {
            headers: headers,
            method: "DELETE"
        }

        return this.httpRequest<ResponseType>(this.baseUrl + path, options);
    }
    
}

export default BaseApi;