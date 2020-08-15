import { 
    Select, 
    Join as JoinSyntax, 
    Expression, 
    FromItem,
    ColumnLink
} from "grapeql-lang";
import { JoinCondition } from "./JoinCondition";
import { Column } from "./Column";
import { UniqueConstraint } from "./UniqueConstraint";

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
        if ( !this.isLeft() ) {
            return false;
        }
    
        if ( !this.condition.isUniqueCondition(constrains) ) {
            return false;
        }
    
        if ( this.hasColumnsReferences(select) ) {
            return false;
        }
    
        return true;
    }

    private isLeft() {
        return this.type === "left join";
    }

    private hasColumnsReferences(select: Select): boolean {
        const allColumnsLinks = select.filterChildrenByInstance(ColumnLink);

        const hasReferenceToThatFromItem = allColumnsLinks.some(columnLink => {
            if ( this.condition.containColumnLink(columnLink) ) {
                return false
            }

            const column = new Column(columnLink);
            const hasReference = column.from(this.from);
            return hasReference;
        });
        
        return hasReferenceToThatFromItem;
    }

}