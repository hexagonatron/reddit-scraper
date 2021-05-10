import fetch, {RequestInit, BodyInit, HeaderInit} from 'node-fetch';

interface QueuedRequest {
    request: () => Promise<any>
    resolve: (value: any | PromiseLike<any>) => void,
    reject: (reason: any) => void
}

abstract class BaseApi {
    private baseUrl:string;
    private requestQueue: QueuedRequest[];
    private lastRequestTimeMs: number;
    private requestsPerSecond: number;
    private processingRequests: boolean;

    protected constructor(baseUrl:string, requestsPerSecond: number = 1000) {
        this.baseUrl = baseUrl;
        this.requestQueue = [];
        this.requestsPerSecond = requestsPerSecond;
        this.lastRequestTimeMs = 0;
        this.processingRequests = false;
    }

    private tryHttpRequest<ResponseType>(url: string, options: RequestInit): Promise<ResponseType> {
        const delayGap = this.requestsPerSecond / 1000;
        if (!this.canSendRequest() ) {
            return this.queuedRequest(() => this.httpRequest(url, options));
        }
        return this.httpRequest(url, options);
    }

    private async queuedRequest<RequestType>(request:() => Promise<RequestType> ): Promise<RequestType> {
        return new Promise((resolve, reject) => {
            this.addToQueue(request, resolve, reject);
        })
    }

    private addToQueue<RequestType>(
        request: () => Promise<RequestType>, 
        resolve: (value: RequestType | PromiseLike<RequestType>) => void,
        reject: (reason: any) => void
    ) {
        this.requestQueue.push({request, resolve, reject});
        if (!this.processingRequests) {
            this.startWorker();
        }
    }

    private startWorker() {
        const stopWorker = () => {
            this.processingRequests = false;
            clearInterval(worker);
        }

        if (this.processingRequests) {
            return;
        }
        this.processingRequests = true;

        const worker = setInterval(() => {
            if (this.requestQueue.length === 0) {
                stopWorker();
                return;
            }
            if (this.longEnoughSinceLastRequest()) {
                const queuedRequest = this.requestQueue.shift();
                if(queuedRequest === undefined) {
                    stopWorker();
                    return
                }
                const {request, resolve, reject} = queuedRequest;
                request().then(resolve).catch(reject);
            }
        }, 10);
    }

    private canSendRequest() {
        // console.log({
        //     now: Date.now(),
        //     lastReq: this.lastRequestTimeMs,
        //     nowMinusLast:Date.now() - this.lastRequestTimeMs,
        //     reqPerSec: this.requestsPerSecond,
        //     delay: 1000 / this.requestsPerSecond,
        //     longEnough: this.longEnoughSinceLastRequest(),
        //     queue: this.requestQueue.length
        // });
        if (this.requestQueue.length) return false;
        return this.longEnoughSinceLastRequest();
    }

    private longEnoughSinceLastRequest(){
        return (Date.now() - this.lastRequestTimeMs) > (1000 / this.requestsPerSecond);
    }


    private httpRequest<ResponseType>(url: string, options: RequestInit): Promise<ResponseType> {
        console.log(`[DEBUG] ${new Date().toLocaleString()}: ${options.method?.toUpperCase()} ${url}`);
        this.lastRequestTimeMs = Date.now();
        return fetch(url, options)
            .then(results => {
                if (results.ok) {
                    return results.json() as Promise<ResponseType>;
                }
                throw results.statusText;
            });
    }

    protected postRequest<ResponseType>(path: string, body: BodyInit, headers?: HeaderInit): Promise<ResponseType> {
        const options: RequestInit = {
            body: body,
            headers: headers,
            method: "POST"
        }

        return this.tryHttpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected getRequest<ResponseType>(path: string, headers?: HeaderInit): Promise<ResponseType> {

        const options: RequestInit = {
            headers: headers,
            method: "GET"
        }

        return this.tryHttpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected putRequest<ResponseType>(path: string, body: BodyInit, headers?: HeaderInit): Promise<ResponseType> {
        const options: RequestInit = {
            body: body,
            headers: headers,
            method: "PUT"
        }

        return this.tryHttpRequest<ResponseType>(this.baseUrl + path, options);
    }

    protected deleteRequest<ResponseType>(path: string, headers?: HeaderInit): Promise<ResponseType> {

        const options: RequestInit = {
            headers: headers,
            method: "DELETE"
        }

        return this.tryHttpRequest<ResponseType>(this.baseUrl + path, options);
    }
    
}

export default BaseApi;