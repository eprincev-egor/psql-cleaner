import { AbstractCondition } from "./AbstractCondition";
import { FromItem } from "grapeql-lang";
import { LeafCondition } from "./LeafCondition";

export class EqualCondition extends AbstractCondition {
    conditions: AbstractCondition[];

    constructor(conditions: AbstractCondition[]) {
        super();
        this.conditions = conditions;
    }

    isUnique(fromItem: FromItem) {
        const nativeColumn = this.getNativeColumn(fromItem);
        
        if ( !nativeColumn) {
            return false;
        }

        const isId = nativeColumn === "id";
        return isId;
    }

    getNativeColumn(fromItem: FromItem) {
        for (const condition of this.conditions) {

            if ( condition instanceof LeafCondition ) {
                const leafCondition = condition;
                
                const nativeColumn = leafCondition.getNativeColumn(fromItem);
                if ( nativeColumn ) {
                    return nativeColumn;
                }
            }
            
        }
    }
}