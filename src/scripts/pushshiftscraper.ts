import { MikroORM } from '@mikro-orm/core';
import moment from 'moment';
import fetch from 'node-fetch'
import { Submission } from '../models/Submission'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';
import PushShiftAPI from '../lib/PushshiftApi';

config();

const PUSH_SHIFT_URL = "https://api.pushshift.io/reddit/";
const SUBMISSION_URL = PUSH_SHIFT_URL + "submission/search";
const COMMENT_SEARCH = PUSH_SHIFT_URL + "comment/search";

const main = async () => {

    const Api = new PushShiftAPI();

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