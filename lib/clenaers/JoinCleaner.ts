import { 
    Select, 
    Join as JoinSyntax,
    FromItem
} from "grapeql-lang";
import { Join } from "./entity/Join";
import { UniqueConstraint } from "./entity/UniqueConstraint";

export class JoinCleaner {
    clean(dirtySelect: Select, constrains: UniqueConstraint[]): Select {

        const cleanSelect = dirtySelect.clone();
        const allFromItems = cleanSelect.filterChildrenByInstance(FromItem);
        
        for (const fromItem of allFromItems) {
            this.removeDirtyJoins(cleanSelect, fromItem, constrains);
        }

        return cleanSelect;
    }

    private removeDirtyJoins(
        select: Select,
        fromItem: FromItem,
        constrains: UniqueConstraint[]
    ) {
        const allJoins = fromItem.get("joins");

        if ( !allJoins || !allJoins.length ) {
            return;
        }
    
        for (let i = allJoins.length - 1; i >= 0; i--) {
            const joinSyntax = allJoins[ i ];
            const join = new Join(joinSyntax);
    
            if ( !join.isDirty(select, constrains) ) {
                continue;
            }
    
            this.removeJoin(fromItem, joinSyntax);
        }
    }

    private removeJoin(fromItem: FromItem, dirtyJoin: JoinSyntax) {

        const allJoins = fromItem.get("joins") as JoinSyntax[];

        const cleanJoins = allJoins.filter(someJoin =>
            someJoin !== dirtyJoin
        );

        fromItem.set({
            joins: cleanJoins
        });
    }
}
