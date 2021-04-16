import { MikroORM, wrap } from '@mikro-orm/core';
import fetch from 'node-fetch'
import PushShiftAPI from '../lib/PushShiftApi';
import {Submission} from '../models/Submission'

const PUSH_SHIFT_URL = "https://api.pushshift.io/reddit/";
const SUBMISSION_URL = PUSH_SHIFT_URL + "submission/search";
const COMMENT_SEARCH = PUSH_SHIFT_URL + "comment/search";

const main = async () => {

    const Api = new PushShiftAPI();

    const orm = await MikroORM.init({
        entities: [Submission],
        dbName: 'redditdb',
        type: 'mongo',
        clientUrl: process.env.DB_HOST
    });

    const {em} = orm;

    const response = await Api.getSubmissions({subreddit: "ethfinance", title: "Daily general discussion", sort: "asc", sort_type: "created_utc", size: 500});

    const submissionEntities = response.data.map(sub => new Submission(sub.id, sub.title, sub.created_utc, sub.url, sub.score, sub.author, sub.num_comments));

    await em.persistAndFlush(submissionEntities);

    console.log("saved!");

    await orm.close();
}

main();