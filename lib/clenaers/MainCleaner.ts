import { JoinCleaner } from "./join/JoinCleaner";
import { Parser } from "../Parser";
import { UniqueConstraint } from "./join/UniqueConstraint";

export class MainCleaner {
    private parser = new Parser();
    private joinCleaner = new JoinCleaner();
    
    clean(dirtySelectSQL: string, uniqueConstrains: UniqueConstraint[]): string {

        const dirtySelect = this.parser.parse(dirtySelectSQL);

        const selectWithoutDirtyJoins = this.joinCleaner.clean(
            dirtySelect, 
            uniqueConstrains
        );

        const cleanSQL = selectWithoutDirtyJoins.toString();
        return cleanSQL;
    }
}