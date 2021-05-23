import db from "../db/db";
import PushshiftApi, { CommentJson, SubmissionJson } from "../lib/PushShiftApi";
import { Submission } from "../models/Submission";
import { Comment } from "../models/Comment";
import { SECONDS_IN_15_MINS, SECONDS_IN_1_DAY } from "../utils/timeUtils";
import { CommentRepository } from "../repositories/CommentRepository";

const main = async () => {

    const {submissionRepository, commentRepository, chunkRepository, orm} = await db.connect();
    const Api = new PushshiftApi();

    const chunkCommentsFrom = async (fromUtc: number) => {
        const commentsToChunk = await commentRepository.getCommentsFrom(fromUtc);
        chunkRepository.createChunks(commentsToChunk);
    }

    // Get last chunk
    const lastChunk = await chunkRepository.getLast();
    const now = Math.floor(Date.now() / 1000);
    let lastStartTime = lastChunk.start_utc;
    if (!(lastStartTime % SECONDS_IN_15_MINS)) {
        lastStartTime = lastStartTime - (lastStartTime % SECONDS_IN_15_MINS);
    }
    const missingChunkStartTimes = [];
    console.log({now, lastStartTime});
    for (let i = lastStartTime; i < now; i += SECONDS_IN_15_MINS) {
        missingChunkStartTimes.push(i);
    }
    if (!missingChunkStartTimes.length) {
        return;
    }
    const dayBeforeEarliestMissingTime = missingChunkStartTimes[0] - SECONDS_IN_1_DAY;
    const existingSubmissions = await submissionRepository.getAllIdsSince(dayBeforeEarliestMissingTime);

    const {data: remoteSubmissions} = await Api.getSubmissionsSince(dayBeforeEarliestMissingTime);
    let submissionsToSave: SubmissionJson[] = [];
    if (remoteSubmissions.length !== existingSubmissions.length) {
        submissionsToSave = remoteSubmissions.filter(submission => !existingSubmissions.includes(submission.id));
    }

    const submissionEntities = submissionsToSave.map(submission => Submission.fromSubmissionJson(submission));
    await submissionRepository.upsert(submissionEntities, "id");

    const existingCommentIds = await commentRepository.getCommentIdsFrom(dayBeforeEarliestMissingTime);
    const remoteComments = await Api.getCommentsFrom(dayBeforeEarliestMissingTime);

    let commentsToSave: CommentJson[] = [];

    if (existingCommentIds.length !== remoteComments.length) {
        commentsToSave = remoteComments.filter(({id}) => !existingCommentIds.includes(id));
    }

    const commentEntities = commentsToSave.map(comment => Comment.fromJson(comment));
    commentRepository.upsert(commentEntities, "id" );

    await chunkCommentsFrom(dayBeforeEarliestMissingTime);

    await db.disconnect();
}

main();