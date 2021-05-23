import { Entity, BaseEntity, Property, PrimaryKey, EntityRepositoryType, SerializedPrimaryKey } from '@mikro-orm/core'
import { CommentJson } from '../lib/PushShiftApi';
import { CommentRepository } from '../repositories/CommentRepository';

@Entity({customRepository: () => CommentRepository})
export class Comment extends BaseEntity<Comment, 'id'>{

    [EntityRepositoryType]?: CommentRepository;

    @Property()
    author!: string;

    @Property()
    created_utc!: number;

    @Property()
    body!: string;

    @Property()
    score?: number;

    @PrimaryKey()
    _id!: string;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    link_id!: string;

    @Property()
    parent_id!: string;

    @Property()
    subreddit!: string;

    @Property()
    subreddit_id!: string;

    constructor( author: string, created_utc: number, body: string, score: number | undefined , id: string, link_id: string, parent_id: string, subreddit: string, subreddit_id: string) {
        super();
        this.author = author;
        this.created_utc = created_utc;
        this.body = body;
        this.score = score;
        this._id = id;
        this.link_id = link_id;
        this.parent_id = parent_id;
        this.subreddit = subreddit;
        this.subreddit_id = subreddit_id;
    }

    public static fromJson({author, body, created_utc, id, link_id, parent_id, subreddit, subreddit_id, score }: CommentJson) {
        return new Comment(author, created_utc, body, score, id, link_id, parent_id, subreddit, subreddit_id);

    }
}