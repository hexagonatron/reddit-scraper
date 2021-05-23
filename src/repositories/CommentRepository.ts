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

    public async getCommentsFrom(fromUtc: number) {
        return this.find({
            created_utc: {$gte: fromUtc}
        }, {
            orderBy: {created_utc: 1}
        });
    }

    public async getCommentIdsFrom(fromUtc: number) {
        const comments = await this.getCommentsFrom(fromUtc);
        return comments.map(({id}) => id);
    }

    private getConnection() {
        return (this.em.getConnection() as MongoConnection).getCollection('Comment');
    }


}