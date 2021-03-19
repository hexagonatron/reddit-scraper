import { MikroORM } from '@mikro-orm/core';
import fetch from 'node-fetch'
import {Submission} from '../models/Submission'

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
    score: number, 
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

    const orm = await MikroORM.init({
        entities: [Submission],
        dbName: 'redditdb',
        type: 'mongo',
        clientUrl: process.env.DB_HOST
    });

    const {em} = orm;

    const response = await submmissionSearch({subreddit: "ethfinance", title: "Daily general discussion", sort: "asc", sort_type: "created_utc", size: 500});

    const submissionEntities = response.data.map(sub => new Submission(sub.id, sub.title, sub.created_utc, sub.url, sub.score, sub.author, sub.num_comments));

    await em.persistAndFlush(submissionEntities);

    console.log("saved!");

    await orm.close();
}

main();