import { QueryOrder } from "@mikro-orm/core";
import { Submission } from "models/Submission";
import { Comment } from "../models/Comment";
import { SECONDS_IN_3_DAYS } from "../utils/timeUtils";
import { BaseRepository } from "./BaseRepository";


export class SubmissionRepository extends BaseRepository<Submission> {

    public async getSubmissionsWithNoScrapedComments() {
        const fetchedSubmissionIds = await this.em.getRepository(Comment).getUniqueSubmisisonIds();
        return this.find({
            id: { $nin: fetchedSubmissionIds }
        });
    }

    public async getSubmissionsInLastThreeDays() {
        return this.find({
            created_utc: { $gte: new Date().getUTCDate() - SECONDS_IN_3_DAYS }
        }, {
            orderBy: { created_utc: QueryOrder.ASC },
        });
    }

    public getAllSince(sinceTime: number) {
        return this.find({
            created_utc: { $gte: sinceTime }
        },{
            orderBy: { created_utc: 1 }
        });
    }

    public async getAllIdsSince(sinceTime: number) {
        const submissions = await this.getAllSince(sinceTime);
        return submissions.map(({id}) => id);
    }
}
