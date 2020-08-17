import { 
    Select, 
    Join as JoinSyntax, 
    Expression, 
    FromItem,
    ColumnLink,
    TableLink
} from "grapeql-lang";
import { JoinCondition } from "./JoinCondition";
import { Column } from "./Column";
import { UniqueConstraint } from "./UniqueConstraint";
import { Table } from "./Table";

export class Join {
    private type: string;
    private condition: JoinCondition;
    private from: FromItem;
    
    constructor(join: JoinSyntax) {
        this.type = join.get("type") as string;
        this.from = join.get("from") as FromItem;

        const on = join.get("on") as Expression;
        this.condition = new JoinCondition(this.from, on);
    }

    isDirty(select: Select, constrains: UniqueConstraint[]) {
        const join = this;

        if ( !join.isLeft() ) {
            return false;
        }

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
            if ( !hasLimit1(subQuery) ) {
                return false;
            }
        }
        else if ( !join.condition.isUniqueCondition(constrains) ) {
            return false;
        }
    
        return true;
    }

    private isLeft() {
        return this.type === "left join";
    }

    private hasDependencies(rootSelect: Select): boolean {
        const allColumnsLinks = rootSelect.filterChildrenByInstance(ColumnLink);

        const hasReferenceToThatFromItem = allColumnsLinks.some(columnLink => {
            if ( this.condition.containColumnLink(columnLink) ) {
                return false
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
        
        return hasReferenceToThatFromItem;
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

function hasLimit1(select: Select) {
    const limit = select.get("limit");
    return limit === "1";
}