import db from '../db/db';
import moment from 'moment';
import { SECONDS_IN_15_MINS } from '../utils/timeUtils';
import { Chunk } from '../models/Chunk';
import { Comment } from '../models/Comment';

const main = async () => {
    const { orm, commentRepository, chunkRepository } = await db.connect();

    const makeChunkFromComments = (comments: Comment[], start_utc: number) => {
        const text = comments.map(c => c.body).join(' ');
        return new Chunk(text, start_utc);
    }

    const getLastChunk = async () => {
        const lastChunk = await chunkRepository.getLast();
        return lastChunk;
    }

    const getFirstComment = async () => {
        const comment = await commentRepository.find({}, {limit:1, orderBy: { created_utc: 1 } });
        if (comment.length === 0 ) {
            throw "No comments found";
        }
        return comment[0];
    }

    const getCommentsFrom = async (start_utc: number) => {
        const comments = commentRepository.getCommentChunkFrom(start_utc);
        return comments;
    }

    const makeChunkFromTime = async (fromTime: number) => {
        const comments = await getCommentsFrom(fromTime);
        return makeChunkFromComments(comments, fromTime);
    }

    let chunkTimeFrom = 0;

    if (await chunkRepository.count() === 0) {
        const firstComment = await getFirstComment();
        const earliestCommentTime = firstComment?.created_utc || 0;
        chunkTimeFrom = Math.floor(earliestCommentTime / SECONDS_IN_15_MINS) * SECONDS_IN_15_MINS;
    } else {
        const lastCompletedChunk = await getLastChunk();
        chunkTimeFrom = lastCompletedChunk?.end_utc + 1 || 0;
    }

    const CHUNKS_TO_MAKE = 2000;
    const chunks: Chunk[] = await Promise.all(
        new Array(CHUNKS_TO_MAKE)
            .fill(1)
            .map(async (_v, i) => await makeChunkFromTime(chunkTimeFrom + i * SECONDS_IN_15_MINS))
    );

await chunkRepository.persistAndFlush(chunks);
await orm.close();
}

main();