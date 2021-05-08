import { Entity, BaseEntity, Property, PrimaryKey, EntityRepositoryType, SerializedPrimaryKey } from '@mikro-orm/core'
import { ObjectId } from '@mikro-orm/mongodb';
import moment from 'moment';
import { ChunkRepository } from '../repositories/ChunkRepository';
import { SECONDS_IN_15_MINS } from '../utils/timeUtils';

@Entity({customRepository: () => ChunkRepository})
export class Chunk extends BaseEntity<Chunk, 'id'>{

    [EntityRepositoryType]?: ChunkRepository;
    @PrimaryKey()
    _id!: ObjectId;

    @SerializedPrimaryKey()
    id!: string;

    @Property()
    text!: string;

    @Property()
    start_utc!: number;

    @Property()
    end_utc!: number;

    @Property()
    sentiment: number | null;

    @Property()
    edited: boolean;

    @Property()
    start_time_string: string;


    constructor(text: string, start_utc: number) {
        super();
        this.text = text;
        this.start_utc = start_utc;
        this.end_utc = start_utc + SECONDS_IN_15_MINS - 1;
        this.sentiment = null;
        this.edited = true;
        this.start_time_string = moment.utc(start_utc * 1000).format();
    }
}