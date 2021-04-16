import { relativeTimeThreshold } from "moment";


class PushshiftApi {
    
    private httpRequest<ResponseType>(url: string, options: RequestInit): Promise<ResponseType> {
        console.log(`[DEBUG] ${new Date().toLocaleString()}: ${options.method?.toUpperCase()} ${url}`)
        return fetch(url, options)
            .then(results => {
                if (results.ok) {
                    return results.json() as Promise<ResponseType>;
                }
                throw new Error(results.statusText)
            });
    }

    private getRequest<ResponseType>(url: string) {
        return this.httpRequest<ResponseType>(url, {method: "GET"});
    }

    public getSubmissions() {

    }

    public getComments() {

    }
}

export default PushshiftApi;