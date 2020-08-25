import { 
    Select, 
    Join as JoinSyntax, 
    Expression, 
    FromItem,
    ColumnLink,
    TableLink,
    FunctionCall,
    FunctionLink,
    ObjectName
} from "grapeql-lang";
import { JoinCondition } from "./JoinCondition";
import { Column } from "./Column";
import { UniqueConstraint } from "./UniqueConstraint";
import { Table } from "./Table";

export class Join {
    private type: string;
    private condition: JoinCondition;
    private from: FromItem;
    syntax: JoinSyntax;
    
    constructor(join: JoinSyntax) {
        this.syntax = join;
        this.type = join.get("type") as string;
        this.from = join.get("from") as FromItem;

        const on = join.get("on") as Expression;
        this.condition = new JoinCondition(this.from, on);
    }

    isDirty(select: Select, constrains: UniqueConstraint[]) {
        const join = this;

        if ( !join.returnsOnlyOneRow(constrains) ) {
            return false;
        }

        if ( join.hasDependencies(select) ) {
            return false;
        }
    
        return true;
    }

    private returnsOnlyOneRow(constrains: UniqueConstraint[]) {
        const join = this;
        const subQuery = this.from.get("select");
        
        if ( subQuery ) {
            if ( !selectReturnsOnlyOneRow(subQuery) ) {
                return false;
            }
        }
        else if ( !join.condition.isUniqueCondition(constrains) ) {
            return false;
        }
    
        return true;
    }

    isLeft() {
        return this.type === "left join";
    }

    private hasDependencies(rootSelect: Select): boolean {
        const allColumnsLinks = rootSelect.filterChildrenByInstance(ColumnLink);

        const hasColumnReference = allColumnsLinks.some(columnLink => {
            if ( this.containColumnLink(columnLink) ) {
                return false;
            }

            const parentSelect = columnLink.findParentInstance(Select);
            if ( parentSelect !== rootSelect ) {

                const sameFrom = findSameFrom(parentSelect, this.from);
                
                if ( sameFrom ) {
                    return false;
                }
            }

            const column = new Column(columnLink);
            const hasReference = column.from(this.from);
            return hasReference;
        });

        const childJoins = this.from.get("joins") as JoinSyntax[];
        
        const hasDependency = (
            hasColumnReference ||
            childJoins.length > 0
        );
        return hasDependency;
    }

    private containColumnLink(columnLink: ColumnLink) {
        
        if ( this.condition.containColumnLink(columnLink) ) {
            return true;
        }
        
        const subQuery = this.from.get("select");
        if ( !subQuery ) {
            return false;
        }
        
        const subQueryContainThatLink =  subQuery.filterChildren(someColumnLink =>
            someColumnLink === columnLink
        ).length > 0;
        return subQueryContainThatLink;
    }
}

function findSameFrom(select: Select, originalFromItem: FromItem) {
    let sameFromItem: FromItem | undefined;

    select.walk((child, walker) => {
        if ( child instanceof FromItem ) {
            const someFromItem = child;
            if ( isSameFromItem(originalFromItem, someFromItem) ) {

                sameFromItem = someFromItem;
                walker.exit();
            }
        }
    });

    return sameFromItem;
}

function isSameFromItem(originalFromItem: FromItem, someFromItem: FromItem) {
    const originalAlias = originalFromItem.get("as");
    const someAlias = someFromItem.get("as");

    if ( originalAlias && someAlias ) {
        const isSameName = originalAlias.toLowerCase() === someAlias.toLowerCase();
        return isSameName;
    }

    const originalTableLink = originalFromItem.get("table") as TableLink;
    const someTableLink = someFromItem.get("table") as TableLink;

    if ( !originalTableLink || !someTableLink ) {
        return false;
    }

    const originalTable = new Table(originalTableLink);
    const someTable = new Table(someTableLink);

    const isSameName = originalTable.equal(someTable);
    return isSameName;
}

function selectReturnsOnlyOneRow(select: Select): boolean {
    const limit = select.get("limit");
    const hasLimit_1 = limit === "1";
    
    const fromItems = select.get("from");
    const hasFromItems = fromItems && fromItems.length > 0;

    const everyFromItemIsSubQueryWithOnlyOneRow = !!fromItems && fromItems.every(fromItem => {
        const subQuery = fromItem.get("select");
        if ( !subQuery ) {
            return false;
        }
        
        const isSubQueryToOneRow = selectReturnsOnlyOneRow( subQuery );
        return isSubQueryToOneRow;
    });

    const hasUnion = !!select.get("union");

    const hasAggFuncs = hasAggFunc(select);
    const hasGroupBy = !!select.get("groupBy");

    const returnsOnlyOneRow = (
        // "select ... limit 1"
        hasLimit_1 
        ||
        // "select 1 as x"
        !hasFromItems && !hasUnion
        ||
        // select ... from ( select ... limit 1 )
        everyFromItemIsSubQueryWithOnlyOneRow && !hasUnion
        ||
        hasAggFuncs && !hasGroupBy
    );
    return returnsOnlyOneRow;
}

const aggFuncs = [
    "count",
    "array_agg",
    "string_agg",
    "max",
    "min"
];
function hasAggFunc(select: Select): boolean {
    const columns = select.get("columns") || [];

    const hasAggFuncInSomeColumn = columns.some(column => {
        const funcCalls = column.filterChildrenByInstance(FunctionCall);
        const hasAggCall = funcCalls.some(funcCall => {
            const funcNameLink = funcCall.get("function") as FunctionLink;
            const funcNameSyntax = funcNameLink.last() as ObjectName;
            const funcName = funcNameSyntax.toLowerCase() as string;

            const isAgg = aggFuncs.includes(funcName);
            return isAgg;
        });
        return hasAggCall;
    });
    
    return hasAggFuncInSomeColumn;
}