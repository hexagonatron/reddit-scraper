import BaseApi from "./BaseApi";

interface BasePushShiftParameters {
    sort?: "asc" | "dsc"
    sort_type?: string
    after?: number
    before?: number
    after_id?: number
    before_id?: number
    created_utc?: number
    score?: number
    gilded?: number
    edited?: boolean
    author?: string
    subreddit?: string
    distinguished?: string
    retrieved_on?: number
    last_updated?: number
    q?: string
    id?: string
    metadata?: string
    unique?: string
    pretty?: boolean
    html_decode?: boolean
    permalink?: string
    user_removed?: boolean
    mod_removed?: boolean
    subreddit_type?: string
    author_flair_css_class?: string
    author_flair_text?: string
}

interface SubmissionParameters extends BasePushShiftParameters {
    over_18?: boolean
    locked?: boolean
    spoiler?: boolean
    is_video?: boolean
    is_self?: boolean
    is_original_content?: boolean
    is_reddit_media_domain?: boolean
    whitelist_status?: string
    parent_whitelist_status?: string
    is_crosspostable?: boolean
    can_gild?: boolean
    suggested_sort?: string
    no_follow?: boolean
    send_replies?: boolean
    link_flair_css_class?: string
    link_flair_text?: string
    num_crossposts?: number
    title?: string
    selftext?: string
    quarantine?: boolean
    pinned?: boolean
    stickied?: boolean
    category?: string
    contest_mode?: boolean
    subreddit_subscribers?: number
    url?: string
    domain?: string
    thumbnail?: string
}

interface CommentParameters extends BasePushShiftParameters {
    reply_delay?: number
    nest_level?: number
    sub_reply_delay?: number
    utc_hour_of_week?: number
    link_id?: number
    parent_i?: number
    author?: string
    author_fullname?: string
    body?: string
    created_utc?: number
    locked?: boolean
    parent_id?: string
    permalink?: string
    retrieved_on?: number
    score?: number
    send_replies?: boolean
    stickied?: boolean
    subreddit?: string
    subreddit_id?: string
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

type CommentJson = {
    author: string
    author_fullname: string
    body: string
    created_utc: number
    id: string
    link_id: string
    locked: boolean
    parent_id: string
    permalink: string
    retrieved_on: number
    score: number
    send_replies: boolean
    stickied: boolean
    subreddit: string
    subreddit_id: string
}

type SubmissionResponse = {
    data: SubmissionJson[]
}

type CommentResponse = {
    data: CommentJson[]
}

const BASE_PUSHSHIFT_API = "https://api.pushshift.io/reddit"

class PushshiftApi extends BaseApi {

    constructor() {
        super(BASE_PUSHSHIFT_API);
    }

    public getSubmissions(parameters: SubmissionParameters): Promise<SubmissionResponse> {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(parameters)) {
            if (value) searchParams.append(key, value.toString());
        }
        return this.getRequest("/submission/search?" + searchParams.toString());
    }

    public getComments(parameters: CommentParameters): Promise<CommentResponse> {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(parameters)) {
            if (value) searchParams.append(key, value.toString());
        }
        return this.getRequest("/submission/comment?" + searchParams.toString());
    }
}

export default PushshiftApi;