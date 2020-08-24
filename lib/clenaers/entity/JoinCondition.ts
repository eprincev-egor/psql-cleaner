import { Expression, Operator, FromItem, ColumnLink, Boolean } from "grapeql-lang";
import { Column } from "./Column";
import { UniqueConstraint } from "./UniqueConstraint";
import { Table } from "./Table";

export class JoinCondition {
    private fromItem: FromItem;
    private fromTable?: Table;
    private expression: Expression;

    constructor(fromItem: FromItem, expression: Expression) {
        this.fromItem = fromItem;
        this.expression = expression;

        const fromTableLink = fromItem.get("table");
        if ( fromTableLink ) {
            this.fromTable = new Table(fromTableLink);
        }
    }

    isUniqueCondition(constrains: UniqueConstraint[]): boolean {

        const joinedTable = this.fromItem.get("table");
        if ( !joinedTable ) {
            return false;
        }

        if ( !this.isOnlyEqualExpressionOverAnd() ) {
            return false;
        }

        const joinedTableColumns = this.findColumnsFromJoinedTable();
        const isOnlyId = (
            joinedTableColumns.length === 1 &&
            joinedTableColumns[0] === "id"
        );
        if ( isOnlyId ) {
            return true;
        }
        
        const uniqueConstraint = this.findUniqueConstraintByTableAndColumns(
            constrains,
            joinedTableColumns
        );

        const isUniqueCondition = !!uniqueConstraint;
        return isUniqueCondition;
    }

    containColumnLink(columnLink: ColumnLink): boolean {
        const hasLink = !!this.expression.findChild(someColumnLink =>
            someColumnLink === columnLink
        );
        return hasLink;
    }

    private findColumnsFromJoinedTable(): string[] {
        const expressionElements = this.expression.get("elements") as any[];
        const columnsLinks = expressionElements.filter(someElem =>
            someElem instanceof ColumnLink
        );

        const joinedTableColumns: string[] = [];
        columnsLinks.forEach(columnLink => {
            
            const column = new Column(columnLink);
            const isColumnFromJoinedTable = column.from(this.fromItem);

            if ( isColumnFromJoinedTable ) {
                const columnName = column.getName();
                joinedTableColumns.push(columnName);
            }
        });

        return joinedTableColumns;
    }

    private findUniqueConstraintByTableAndColumns(
        uniqueConstrains: UniqueConstraint[], 
        joinedTableColumns: string[]
    ) {
        const fromTable = this.fromTable as Table;

        const tableConstraints = uniqueConstrains.filter(uniqueConstraint =>
            uniqueConstraint.schemaName === fromTable.schema &&
            uniqueConstraint.tableName === fromTable.name
        );

        const uniqueConstraintForThatColumns = tableConstraints.find(uniqueConstraint =>
            uniqueConstraint.columns.length === joinedTableColumns.length &&
            uniqueConstraint.columns.every(columnName =>
                joinedTableColumns.includes(columnName)
            )
        );
        return uniqueConstraintForThatColumns;
    }

    private isOnlyEqualExpressionOverAnd() {
        const expressionElements = this.expression.get("elements") as any[];

        let i = 0;
        const n = expressionElements.length;
        while ( i < n ) {
            const leftOperand = expressionElements[ i ];
            const operator = expressionElements[ i + 1 ];
            const rightOperand = expressionElements[ i + 2 ];

            if ( leftOperand instanceof Boolean ) {
                i++;
                
                if ( leftOperand.get("boolean") !== true ) {
                    break;
                }
            } else {
                if ( !isEqualColumnExpression(leftOperand, operator, rightOperand) ) {
                    return false;
                }
                
                i += 3;
            }


            const nextElem = expressionElements[ i ];
            if ( !nextElem ) {
                break;
            }

            const nextIsAndOperator = (
                nextElem instanceof Operator &&
                nextElem.get("operator") === "and"
            )
            if ( !nextIsAndOperator ) {
                return false;
            }
            i++;
        }

        return true;
    }
}

function isEqualColumnExpression(
    leftOperand: any,
    operator: any,
    rightOperand: any
) {
    const isEqualOperator = (
        operator instanceof Operator &&
        operator.get("operator") === "="
    );
    const oneOfOperatorsIsColumn = (
        leftOperand instanceof ColumnLink ||
        rightOperand instanceof ColumnLink
    );

    const isEqualByColumn = (
        isEqualOperator &&
        oneOfOperatorsIsColumn
    );
    return isEqualByColumn;
}
