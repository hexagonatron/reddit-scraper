import { AnyEntity, Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { Submission } from '../models/Submission'
import { Comment } from '../models/Comment'
import { Chunk } from '../models/Chunk'
import { config } from 'dotenv';
import { BaseRepository } from '../repositories/BaseRepository';
import { EntityManager, EntityRepository, MongoDriver, MongoEntityManager } from '@mikro-orm/mongodb';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { CommentRepository } from '../repositories/CommentRepository';
import { ChunkRepository } from '../repositories/ChunkRepository';

config();

export interface Db {
    orm: MikroORM | null,
    connect: () => Promise<Orm>,
    disconnect: () => Promise<void> | void
}

export type Orm = {
    orm: MikroORM,
    submissionRepository: SubmissionRepository,
    commentRepository: CommentRepository,
    chunkRepository: ChunkRepository,

}

const db: Db = {
    orm: null,
    async connect(): Promise<Orm>{
        const orm = await MikroORM.init({
            entities: [Submission, Comment, Chunk],
            dbName: 'redditdb',
            type: 'mongo',
            clientUrl: process.env.DB_HOST,
            entityRepository: BaseRepository
        });
        const { em } = orm;
        const submissionRepository = em.getRepository(Submission);
        const commentRepository = em.getRepository(Comment);
        const chunkRepository = em.getRepository(Chunk);
        this.orm = orm;
        return { orm, submissionRepository, commentRepository, chunkRepository };
    },

    disconnect(){
        if (!this.orm) {
            console.log(`[DEBUG] Not currently connected to a database`);
            return;
        }
        return this.orm.close();
    }

}


export default db;