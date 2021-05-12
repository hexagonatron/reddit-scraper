import { FindOptions, Repository } from "@mikro-orm/core";
import { MongoConnection } from "@mikro-orm/mongodb";
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

    async getUniqueSubmisisonIds() {
        const distinctSubmissionIds: string[] = await this.getConnection().distinct('link_id');
        return distinctSubmissionIds.map(id => id.replace("t3_",""))
    }

    private getConnection() {
        return (this.em.getConnection() as MongoConnection).getCollection('Comment');
    }

}