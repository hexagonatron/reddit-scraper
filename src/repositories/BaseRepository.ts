import { AnyEntity, EntityRepository, EntityRepositoryType, FilterQuery, wrap } from "@mikro-orm/core";

export class BaseRepository<T extends AnyEntity<T>> extends EntityRepository<T> {

    async upsert(data: AnyEntity<T>[], where: keyof T) {
        const entities = await Promise.all(data.map(ent => this.doUpsert(ent, { [where]: ent[where] })));
        return this.persistAndFlush(entities);
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
}