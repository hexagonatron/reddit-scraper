import {BaseEntity, Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class Submission extends BaseEntity<Submission, 'id'>{

    @PrimaryKey()
    id!: string;

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

    @Property()
    num_comments!: number

    constructor(id: string, title: string, created_utc: number, url: string, score: number, author: string, num_comments: number){
        super();
        this.id = id;
        this.title = title;
        this.created_utc = created_utc;
        this.url = url;
        this.score = score;
        this.author = author;
        this.num_comments = num_comments;
    }
}