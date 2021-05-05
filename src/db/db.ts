import { MikroORM } from '@mikro-orm/core';
import { Submission } from '../models/Submission'
import { Comment } from '../models/Comment'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';

const db = {

    async connect() {
        const orm = await MikroORM.init({
            entities: [Submission, Comment],
            dbName: 'redditdb',
            type: 'mongo',
            clientUrl: process.env.DB_HOST,
            entityRepository: BaseRepository
        });
        const {em} = orm;
        const submissionRepository = em.getRepository(Submission);
        const commentRepository = em.getRepository(Comment);
        return {orm,em,submissionRepository, commentRepository};
    }


}


export default db;