import PushshiftApi, { CommentJson, CommentParameters } from "../lib/PushShiftApi";
import { Comment } from '../models/Comment';
import { config } from 'dotenv';
import db from "../db/db";
import { QueryOrder } from "@mikro-orm/core";
import { Submission } from "../models/Submission";

config();

const defaultCommentParameters: CommentParameters = {
    size: 500,
    sort: "dsc",
    sort_type: "created_utc"
}

const SECONDS_IN_1_WEEK = 60 * 60 * 24 * 7;

const main = async () => {
    const Api = new PushshiftApi();
    const { orm, commentRepository, submissionRepository } = await db.connect();

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

    const alreadyFetchedComments = async (submissionId: string) => {
        const alreadyFetchedComments = await commentRepository.getCommentsBySubmissionId(submissionId);

        if (alreadyFetchedComments.length === 0) {
            return false
        }
        const seconds = (Date.now() / 1000) - SECONDS_IN_1_WEEK;
        return alreadyFetchedComments[0].created_utc < seconds;
    }

    const persistAllCommentsFromSubmission = async (submission: Submission) => {
        if (await alreadyFetchedComments(submission.id)) {
            console.log(`[DEBUG] Already fetched comments for submission: ${submission.id}, "${submission.title}". Skipping`);
            return
        }
        const comments = await getAllCommentsFromSubmission(submission.id);
        const entities = comments.map(({ author, created_utc, body, score, id, link_id, parent_id, subreddit, subreddit_id }) => new Comment(author, created_utc, body, score, id, link_id, parent_id, subreddit, subreddit_id))

        const {em} = orm;

        await em.fork().getRepository(Comment).upsert(entities, "id");
    }

    const submissionsToFetch = await submissionRepository.getSubmissionsWithNoScrapedComments();
    // const submissionsToFetch = await submissionRepository.findLastThreeDays();

    let startIndex = 0;
    const chunkedSubmissions = [];
    while (startIndex < submissionsToFetch.length) {
        chunkedSubmissions.push(submissionsToFetch.slice(startIndex, startIndex + 10));
        startIndex += 10;
    }

    for (const submissionChunk of chunkedSubmissions) {
        try {
        await Promise.all(submissionChunk.map(submission => persistAllCommentsFromSubmission(submission)));
        } catch (error) {
            console.log(`[ERROR] ${new Date().toLocaleString()} ${error}`);
        }
    }

    orm.close();

}

main();