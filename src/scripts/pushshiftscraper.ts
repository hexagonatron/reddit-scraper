import { MikroORM } from '@mikro-orm/core';
import moment from 'moment';
import fetch from 'node-fetch'
import { Submission } from '../models/Submission'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';

config();

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

const submissionSearch = (parameters: SubmissionParameters): Promise<SubmissionResponse> => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(parameters)) {
        if (value) params.append(key, value.toString());
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
        clientUrl: process.env.DB_HOST,
        entityRepository: BaseRepository
    });

    const { em } = orm;
    const response = await submissionSearch({ subreddit: "ethfinance", title: "Daily general discussion", sort: "asc", sort_type: "created_utc", size: 500 });
    const subRepo = em.getRepository(Submission);
    const entities = response.data.map(sub => new Submission(sub.title, sub.created_utc, sub.url, sub.score, sub.author, sub.id));
    await subRepo.upsert(entities, "id");
    await orm.close();
}

main();