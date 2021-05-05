import { Entity, BaseEntity, Property, PrimaryKey, EntityRepositoryType } from '@mikro-orm/core'
import { BaseRepository } from '../repositories/BaseRepository';

@Entity()
export class Comment extends BaseEntity<Comment, 'id'>{

    [EntityRepositoryType]?: BaseRepository<Comment>;

    @Property()
    author!: string;

    @Property()
    created_utc!: number;

    @Property()
    body!: string;

    @Property()
    score?: number;

    @PrimaryKey()
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
        this.id = id;
        this.link_id = link_id;
        this.parent_id = parent_id;
        this.subreddit = subreddit;
        this.subreddit_id = subreddit_id;
    }
}