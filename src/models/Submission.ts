import {Entity, BaseEntity, Property, PrimaryKey, EntityRepositoryType, SerializedPrimaryKey} from '@mikro-orm/core'
import { SubmissionJson } from '../lib/PushShiftApi';
import { SubmissionRepository } from '../repositories/SubmissionRepository';

@Entity({customRepository: () => SubmissionRepository})
export class Submission extends BaseEntity<Submission, 'id'> {

    [EntityRepositoryType]? : SubmissionRepository;

    @Property()
    title!: string;

    @Property()
    created_utc!: number;

    @Property()
    url!: string;

    @Property()
    score!: number;

    @Property()
    author!: string;

    @PrimaryKey()
    _id!: string;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    num_comments!:string;

    constructor(title: string, created_utc: number, url: string, score: number, author: string, id: string){
        super();
        this.title = title;
        this.created_utc = created_utc;
        this.url = url;
        this.score = score;
        this.author = author;
        this._id = id;
    }

    public static fromSubmissionJson({author, created_utc, id, score, title, url }: SubmissionJson) {
        return new Submission(title,created_utc, url, score,author, id);
    }
}