import PushshiftApi, { CommentJson, CommentParameters } from "../lib/PushShiftApi";
import {Comment} from '../models/Comment';
import { config } from 'dotenv';
import db from "../db/db";

config();

const defaultCommentParameters: CommentParameters = {
    size: 500,
    sort: "dsc",
    sort_type: "created_utc"
}

const main = async () => {
    const Api = new PushshiftApi();
    const { orm, commentRepository, em } = await db.connect();

    const getAllCommentsFromSubmission = async (submissionId: string) => {

        const getCommentsAfterTime = async (afterUtc: number): Promise<CommentJson[]> => {
            const response = await Api.getComments({ ...defaultCommentParameters, link_id: submissionId, after: afterUtc });

            if (response.data.length === 0) {
                return response.data;
            }

            const lastCreatedTime = response.data[response.data.length - 1].created_utc;

            return response.data.concat(await getCommentsAfterTime(lastCreatedTime));
        }
        return getCommentsAfterTime(0);
    }

    const comments = await getAllCommentsFromSubmission("n4germ");

    const entities = comments.map(({ author, created_utc, body, score, id, link_id, parent_id, subreddit, subreddit_id}) => new Comment(author, created_utc, body, score, id, link_id, parent_id, subreddit, subreddit_id))

    await commentRepository.upsert(entities, "id");

    orm.close();

}

main();