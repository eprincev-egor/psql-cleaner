import { Expression, Operator, FromItem, ColumnLink } from "grapeql-lang";
import { Column } from "./Column";

export class JoinCondition {
    private fromItem: FromItem;
    private expression: Expression;

    constructor(fromItem: FromItem, expression: Expression) {
        this.fromItem = fromItem;
        this.expression = expression;
    }

    isPrimaryKey(): boolean {

        const joinedTable = this.fromItem.get("table");
        if ( !joinedTable ) {
            return false;
        }

        const condition = this.expression;
        const elements = condition.get("elements") as any[];

        const leftOperand = elements[0];
        const operator = elements[1];
        const rightOperand = elements[2];

        const isBinaryEqualExpression = (
            elements.length === 3 
            &&
            operator instanceof Operator &&
            operator.get("operator") === "="
            &&
            (
                leftOperand instanceof ColumnLink 
                ||
                rightOperand instanceof ColumnLink
            )
        );
        if ( !isBinaryEqualExpression ) {
            return false;
        }

        let leftColumn: Column | undefined;
        if ( leftOperand instanceof ColumnLink ) {
            leftColumn = new Column(leftOperand);
        }

        let rightColumn: Column | undefined;
        if ( rightOperand instanceof ColumnLink ) {
            rightColumn = new Column(rightOperand);
        }

        let joinedTableColumn;
        if ( leftColumn && leftColumn.from(this.fromItem) ) {
            joinedTableColumn = leftColumn;
        }
        if ( rightColumn && rightColumn.from(this.fromItem) ) {
            joinedTableColumn = rightColumn;
        }


        if ( joinedTableColumn && joinedTableColumn.isId() ) {
            return true;
        }
        return false;
    }

    containColumnLink(columnLink: ColumnLink): boolean {
        const hasLink = !!this.expression.findChild(someColumnLink =>
            someColumnLink === columnLink
        );
        return hasLink;
    }
}