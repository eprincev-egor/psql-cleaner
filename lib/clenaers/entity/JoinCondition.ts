import { Expression, FromItem, ColumnLink } from "grapeql-lang";
import { UniqueConstraint } from "./UniqueConstraint";
import { Table } from "./Table";
import { ConditionBuilder } from "./condition/ConditionBuilder";
import { AbstractCondition } from "./condition/AbstractCondition";

export class JoinCondition {
    private fromItem: FromItem;
    private fromTable?: Table;
    private expression: Expression;
    private conditionTree: AbstractCondition;

    constructor(fromItem: FromItem, expression: Expression) {
        this.fromItem = fromItem;
        this.expression = expression;

        const fromTableLink = fromItem.get("table");
        if ( fromTableLink ) {
            this.fromTable = new Table(fromTableLink);
        }

        const expressionElements = this.expression.get("elements") as any[];
        const builder = new ConditionBuilder();
        this.conditionTree = builder.build(expressionElements);
    }

    isUniqueCondition(uniqueConstrains: UniqueConstraint[]): boolean {
        const fromTable = this.fromTable
        if ( !fromTable ) {
            return false;
        }

        
        const tableConstraints = uniqueConstrains.filter(uniqueConstraint =>
            uniqueConstraint.schemaName === fromTable.schema &&
            uniqueConstraint.tableName === fromTable.name
        );

        const isUniqueCondition = this.conditionTree.isUnique(
            this.fromItem, 
            tableConstraints
        );
        return isUniqueCondition;
    }

    containColumnLink(columnLink: ColumnLink): boolean {
        const hasLink = !!this.expression.findChild(someColumnLink =>
            someColumnLink === columnLink
        );
        return hasLink;
    }

}
