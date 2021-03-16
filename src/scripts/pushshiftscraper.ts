import moment from 'moment';
import fetch from 'node-fetch'

const PUSH_SHIFT_URL = "https://api.pushshift.io/reddit/";
const SUBMISSION_URL = PUSH_SHIFT_URL + "submission/search";
const COMMENT_SEARCH = PUSH_SHIFT_URL + "comment/search";

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
    score: string, 
    author: string,
    id: string,
    num_comments: number
}

type SubmissionResponse = {
    data: SubmissionJson[]
}

const submmissionSearch = (parameters: SubmissionParameters): Promise<SubmissionResponse> => {
    const params = new URLSearchParams();
    for(const [key, value] of Object.entries(parameters)) {
        if(value) params.append(key, value.toString());
    }
    const url = SUBMISSION_URL + "?" + params.toString();
    console.log(url)
    return fetch(url).then(res => res.json());
}

const main = async () => {
    const response = await submmissionSearch({subreddit: "ethfinance", title: "Daily general discussion", sort: "asc", sort_type: "created_utc", size: 500});

    response.data.map(sub => console.log({
        title: sub.title,
        created: moment(sub.created_utc * 1000).format(),
        comments: sub.num_comments
    }));

    console.log({len: response.data.length})
}

main();