
import { FindOptions, QueryOrder, Repository } from "@mikro-orm/core";
import { Chunk } from "models/Chunk";
import { BaseRepository } from "./BaseRepository";

export class ChunkRepository extends BaseRepository<Chunk> {

    async getLast() {
        const chunks = await this.find({}, {
            limit:1,
            orderBy: {start_utc: QueryOrder.DESC}
        });
        if (chunks.length === 0) {
            throw "No chunks found";
        }
        return chunks[0];
    }

}