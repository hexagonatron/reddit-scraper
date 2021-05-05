import { MikroORM } from '@mikro-orm/core';
import { Submission } from '../models/Submission'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';
import PushShiftAPI, { SubmissionJson, SubmissionParameters } from '../lib/PushShiftApi';

config();

const defaultSubmissionParameters: SubmissionParameters = {
    subreddit: "ethfinance",
    title: "Daily general discussion",
    sort: "asc",
    sort_type: "created_utc",
    size: 500
}

const main = async () => {

    const Api = new PushShiftAPI();

    const getAllSubmissionsAfterTime = async (after_utc: number): Promise<SubmissionJson[]> => {
        const response = await Api.getSubmissions({ ...defaultSubmissionParameters, after: after_utc }); 

        if (!response.data.length) {
            return [];
        }
        const mostRecentSubmissionTime = response.data[response.data.length -1].created_utc;
        const recursiveSubmissions = await getAllSubmissionsAfterTime(mostRecentSubmissionTime);
        return response.data.concat(recursiveSubmissions);
    }

    const getAllSubmissionEntities = async () => {
        const submissions = await getAllSubmissionsAfterTime(0);
        return submissions.map(sub => new Submission(sub.title, sub.created_utc, sub.url, sub.score, sub.author, sub.id));
    }

    const orm = await MikroORM.init({
        entities: [Submission],
        dbName: 'redditdb',
        type: 'mongo',
        clientUrl: process.env.DB_HOST,
        entityRepository: BaseRepository
    });

    const { em } = orm;
    const subRepo = em.getRepository(Submission);

    const entities = await getAllSubmissionEntities();
    await subRepo.upsert(entities, "id");
    await orm.close();
}

main();