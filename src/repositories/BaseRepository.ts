import { AnyEntity, EntityRepository, EntityRepositoryType, FilterQuery, wrap } from "@mikro-orm/core";
import {isStringOrNumber} from '../utils/typeGuards';

export class BaseRepository<T extends AnyEntity<T>> extends EntityRepository<T> {

    async upsert(data: AnyEntity<T>[], where: keyof T) {
        const uniques = this.filterUniques(data, where);
            const entities = await Promise.all(uniques.map(entity => this.doUpsert(entity, {[where]: entity[where]})));
            await this.persistAndFlush(entities);
            console.log(`[DEBUG] Successfully upserted ${entities.length} records`);
    }

    async upsertOne(data: AnyEntity<T>, where: FilterQuery<T>) {
        const entity = await this.doUpsert(data, where);
        await this.persistAndFlush(entity);
    }

    private async doUpsert(entity: AnyEntity<T>, where: FilterQuery<T>): Promise<AnyEntity<T>> {
        return new Promise(async (resolve, _reject) => {
            let e = await this.findOne(where);

            if (e) {
                wrap(e).assign(entity);
            } else {
                e = this.create(entity);
            }
            return resolve(e);
        });
    }

    private filterUniques(entities: AnyEntity<T>[], where: keyof T) {

        const map: {[key in string | number] : AnyEntity<T>} = {};
        entities.forEach(e => {
            const id = e[where];

            if(!isStringOrNumber(id)) {
                throw "Invalid where clause"
            }

            if (map[id]) {
                map[id] = Object.assign(map[id], e);
                return
            }
            map[id] = e;
        });
        return Object.entries(map).map(([_key, value]) => value);
    }
}