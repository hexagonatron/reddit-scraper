import fetch, { Headers, RequestInit } from 'node-fetch';
import { toBase64, optionsToParams } from './helpers';
import FormData from 'form-data';

interface RedditTokenResponse {
    access_token: string,
    token_type: string,
    expires_in: number,
    scope: string,
}

type SearchOptions = {
    after?: string;
    before?: string;
    category?: string;
    count?: number;
    include_facets?: boolean;
    limit?: number;
    q: string;
    restrict_sr?: boolean;
    show?: "all"
    sort?: "relevance" | "hot" | "top" | "new" | "comments";
    sr_detail?: string;
    t?: "hour" | "day" | "week" | "month" | "year" | "all";
    type?: string;
}

class RedditApi {
    private appId: string;
    private appSecret: string;
    private token: string | null;
    private expires: number;
    private readonly baseUrl = "https://www.reddit.com";
    private readonly authedUrl = "https://oauth.reddit.com";
    private readonly userAgent = "Sentiment analysis script by Hexagonatron";

    public constructor(appId: string, appSecret: string) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.token = null
        this.expires = 0;
    }

    private async getToken() {
        const body = new FormData();
        body.append("grant_type", "client_credentials");

        const headers = this.getBasicAuthHeaders();
        await this.postRequest<RedditTokenResponse>(this.baseUrl + "/api/v1/access_token", body, headers)
            .then(tokenResponse => {
                this.token = tokenResponse.access_token;
                this.expires = new Date().getTime() / 1000 + tokenResponse.expires_in;
            })
            .catch(console.log);
    }

    private postRequest<ResponseType>(url: string, body: FormData, headers?: Headers): Promise<ResponseType> {
        const options: RequestInit = {
            body: body,
            headers: this.getHeaders(headers),
            method: "POST"
        }

        return this.httpRequest<ResponseType>(url, options);
    }

    private getRequest<ResponseType>(url: string, headers?: Headers): Promise<ResponseType> {

        const options: RequestInit = {
            headers: this.getHeaders(headers),
            method: "GET"
        }

        return this.httpRequest<ResponseType>(url, options);
    }

    private async authedPost(url: string, body: FormData, headers?: Headers) {
        const authHeaders = this.mergeHeaders(await this.getTokenAuthHeader(), headers);
        return this.postRequest(url, body, authHeaders);
    }

    private async authedGet(url: string, headers?: Headers) {
        const authHeaders = this.mergeHeaders(await this.getTokenAuthHeader(), headers);
        return this.getRequest(url, authHeaders);
    }

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

    private getHeaders(additionalHeaders?: Headers) {
        const headers = new Headers();
        headers.append("User-Agent", "Sentiment analyses script by Hexagonatron");
        if (additionalHeaders) {
            for (const [key, value] of additionalHeaders.entries()) {
                headers.append(key, value);
            }
        }
        return headers;
    }

    private getBasicAuthHeaders() {
        const headers = new Headers();
        headers.append('Authorization', 'Basic ' + toBase64(`${this.appId}:${this.appSecret}`));
        return headers;
    }

    private async getTokenAuthHeader() {
        await this.validateToken();
        const headers = new Headers();
        headers.append("Authorization", `bearer ${this.token}`);
        return headers;
    }

    private async validateToken() {
        if (!this.token) {
            await this.getToken();
        }

        if (this.tokenIsExpired()) {
            await this.getToken();
        }
    }

    private tokenIsExpired() {
        return this.expires < (new Date().getTime() / 1000);
    }

    private mergeHeaders(source = new Headers(), destination = new Headers()) {
        for (const [key, value] of source.entries()) {
            destination.append(key, value);
        }
        return destination
    }

    public search(options: SearchOptions, subreddit?: string) {
        const baseUrl = subreddit
            ? `${this.authedUrl}/r/${subreddit}/search`
            : `${this.authedUrl}/search`;
        const queryParams = optionsToParams(options);
        const url = baseUrl + "?" + queryParams;

        return this.authedGet(url);
    }
}

export default RedditApi;
