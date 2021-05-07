import { MikroORM } from '@mikro-orm/core';
import { Submission } from '../models/Submission'
import { Comment } from '../models/Comment'
import { Chunk } from '../models/Chunk'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';
import FlakeId from 'flake-idgen';

config();

const db = {

    async connect() {
        const orm = await MikroORM.init({
            entities: [Submission, Comment, Chunk],
            dbName: 'redditdb',
            type: 'mongo',
            clientUrl: process.env.DB_HOST,
            entityRepository: BaseRepository
        });
        const {em} = orm;
        const submissionRepository = em.getRepository(Submission);
        const commentRepository = em.getRepository(Comment);
        const chunkRepository = em.getRepository(Chunk);
        return {orm,em,submissionRepository, commentRepository, chunkRepository};
    }

}


export default db;