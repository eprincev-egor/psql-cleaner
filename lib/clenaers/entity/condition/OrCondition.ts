import { AbstractCondition } from "./AbstractCondition";

export class OrCondition extends AbstractCondition {
    conditions: AbstractCondition[];

    constructor(conditions: AbstractCondition[]) {
        super();
        this.conditions = conditions;
    }

    isUnique() {
        return false;
    }
}