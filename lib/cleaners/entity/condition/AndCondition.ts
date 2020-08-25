import { AbstractCondition } from "./AbstractCondition";
import { EqualCondition } from "./EqualCondition";
import { FromItem } from "grapeql-lang";
import { UniqueConstraint } from "../UniqueConstraint";
import { LeafCondition } from "./LeafCondition";

export class AndCondition extends AbstractCondition {
    conditions: AbstractCondition[];

    constructor(conditions: AbstractCondition[]) {
        super();
        this.conditions = conditions;
    }

    isUnique(
        fromItem: FromItem,
        tableUniqueConstraints: UniqueConstraint[]
    ) {
        if ( !this.isOnlyEqualOrLeafConditions() ) {
            return false;
        }

        const equalConditions = this.conditions as EqualCondition[];
        
        const nativeColumns: string[] = [];
        equalConditions.forEach(equalOrLeafCondition => {
            const nativeColumn = equalOrLeafCondition.getNativeColumn(fromItem);
            if ( nativeColumn ) {
                nativeColumns.push(nativeColumn);
            }
        });

        if ( !nativeColumns.length ) {
            return false;
        }

        const isOnlyId = (
            nativeColumns.length === 1 &&
            nativeColumns[0] === "id"
        );
        if ( isOnlyId ) {
            return true;
        }

        const uniqueConstraint = tableUniqueConstraints.find(constraint => {
            const coverNativeColumns = constraint.columns.every(column =>
                nativeColumns.includes(column)
            );
            return coverNativeColumns;
        });

        
        if ( uniqueConstraint ) {
            return true;
        }
        return false;
    }

    private isOnlyEqualOrLeafConditions() {
        const everyConditionIsEqual = this.conditions.every(condition =>
            condition instanceof EqualCondition ||
            condition instanceof LeafCondition
        );
        return everyConditionIsEqual;
    }
}