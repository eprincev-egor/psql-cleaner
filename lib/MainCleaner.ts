import { JoinCleaner } from "./JoinCleaner";
import { Parser } from "./Parser";

export class MainCleaner {
    private parser = new Parser();
    private joinCleaner = new JoinCleaner();
    
    clean(dirtySelectSQL: string): string {

        const dirtySelect = this.parser.parse(dirtySelectSQL);

        const selectWithoutDirtyJoins = this.joinCleaner.clean(dirtySelect);

        const cleanSQL = selectWithoutDirtyJoins.toString();
        return cleanSQL;
    }
}