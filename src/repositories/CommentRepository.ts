import { FindOptions, Repository } from "@mikro-orm/core";
import { Comment } from "models/Comment";
import { BaseRepository } from "./BaseRepository";

const SECONDS_IN_15_MINS = 60 * 15;

export class CommentRepository extends BaseRepository<Comment> {

    async getCommentsBySubmissionId(submissionId: string, options: FindOptions<Comment> = {}) {
        return this.find({
            parent_id: {
                $re: submissionId
            }
        }, { ...options, });
    }

    async getCommentChunkFrom(from_utc: number) {
        return this.find({
            created_utc: {
                $gte: from_utc,
                $lte: from_utc + SECONDS_IN_15_MINS,
            }
        });
    }

}