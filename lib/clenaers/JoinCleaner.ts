import { 
    Select
} from "grapeql-lang";
import { FromItem } from "./entity/FromItem";
import { UniqueConstraint } from "./entity/UniqueConstraint";

export class JoinCleaner {
    clean(dirtySelect: Select, constrains: UniqueConstraint[]): Select {

        const cleanSelect = dirtySelect.clone();
        
        const fromItemsSyntaxes = cleanSelect.get("from") || [];
        const fromItems = fromItemsSyntaxes.map(fromItemSyntax =>
            new FromItem(fromItemSyntax)
        );

        for (const fromItem of fromItems) {
            fromItem.removeDirtyJoins(cleanSelect, constrains);
        }

        return cleanSelect;
    }
}
