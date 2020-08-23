import { 
    Select, 
    FromItem as FromItemSyntax
} from "grapeql-lang";
import { Join } from "./Join";
import { UniqueConstraint } from "./UniqueConstraint";

export class FromItem {

    syntax: FromItemSyntax;
    private joins: Join[];

    constructor(fromItemSyntax: FromItemSyntax) {
        
        this.syntax = fromItemSyntax

        const joinsSyntaxes = fromItemSyntax.get("joins") || [];
        this.joins = joinsSyntaxes.map(joinSyntax => 
            new Join(joinSyntax)
        );
    }

    removeDirtyJoins(
        select: Select,
        constrains: UniqueConstraint[]
    ) {
        for (let i = this.joins.length - 1; i >= 0; i--) {
            const join = this.joins[ i ];

            const childFromItemSyntax = join.syntax.get("from") as FromItemSyntax;
            const childFromItem = new FromItem(childFromItemSyntax);

            childFromItem.removeDirtyJoins(select, constrains);

            if ( !join.isLeft() ) {
                continue;
            }
    
            if ( !join.isDirty(select, constrains) ) {
                continue;
            }
    
            this.removeJoin(join);
        }
    }

    private removeJoin(dirtyJoin: Join) {

        const allJoinsSyntaxes = this.syntax.get("joins") || [];
        const cleanJoinsSyntaxes = allJoinsSyntaxes.filter(someJoin =>
            someJoin !== dirtyJoin.syntax
        );

        this.syntax.set({
            joins: cleanJoinsSyntaxes
        });
    }
}

