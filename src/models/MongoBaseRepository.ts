import { AnyEntity, EntityManager, EntityRepository, EntityName } from "@mikro-orm/core";
import { MongoDriver } from "@mikro-orm/mongodb";

export class MongoBaseRepository<T extends AnyEntity<T> extends {id: any}> extends EntityRepository<T> {
    save(...entities: T[]){
        entities.forEach(entity => {
            let e = this.findOne({_id: entity.id})
        })
    }
}