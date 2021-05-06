import { FindOptions, Repository } from "@mikro-orm/core";
import { Comment } from "src/models/Comment";
import { BaseRepository } from "./BaseRepository";

export class CommentRepository extends BaseRepository<Comment> {

    async getCommentsBySubmissionId(submissionId: string, options: FindOptions<Comment> = {} ) {
        return this.find({parent_id: {
            $re: submissionId
        } },{...options, });
    }

}