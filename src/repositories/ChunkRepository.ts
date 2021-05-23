import { FindOptions, QueryOrder, Repository } from "@mikro-orm/core";
import { Chunk } from "models/Chunk";
import { BaseRepository } from "./BaseRepository";
import { Comment } from '../models/Comment';
import { SECONDS_IN_15_MINS } from "../utils/timeUtils";

export class ChunkRepository extends BaseRepository<Chunk> {

    async getLast() {
        const chunks = await this.find({}, {
            limit:1,
            orderBy: {start_utc: QueryOrder.DESC}
        });
        if (chunks.length === 0) {
            throw "No chunks found";
        }
        return chunks[0];
    }

    async createChunks(comments: Comment[]) {
        comments.sort((a, b) => a.created_utc - b.created_utc);

        if (!comments.length) return;

        const earliestCommentTime = comments[0].created_utc;
        const chunkStartTime = earliestCommentTime - (earliestCommentTime % SECONDS_IN_15_MINS);
        const chunkEndTime = chunkStartTime + SECONDS_IN_15_MINS;

        return;

    }

}