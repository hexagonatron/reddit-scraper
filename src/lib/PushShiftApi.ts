import BaseApi from "./BaseApi";

type SubmissionParameters = {
    q?: string,
    title?: string,
    sort?: "asc" | "desc",
    sort_type?: string,
    subreddit?: string,
    size?: number
}

type SubmissionJson = {
    title: string,
    created_utc: number,
    url: string,
    score: number,
    author: string,
    id: string,
    num_comments: number
}

type SubmissionResponse = {
    data: SubmissionJson[]
}

const PUSH_SHIFT_URL = "https://api.pushshift.io/reddit";

class PushShiftAPI extends BaseApi {

    public constructor() {
        super(PUSH_SHIFT_URL);
    }

    public getSubmissions(parameters: SubmissionParameters): Promise<SubmissionResponse> {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(parameters)) {
            if (value) searchParams.append(key, value.toString());
        }
        return this.getRequest("/submission/search" + searchParams.toString());
    }
}

export default PushShiftAPI;