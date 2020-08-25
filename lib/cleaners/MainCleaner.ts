import { JoinCleaner } from "./JoinCleaner";
import { Parser } from "../Parser";
import { UniqueConstraint } from "./entity/UniqueConstraint";

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