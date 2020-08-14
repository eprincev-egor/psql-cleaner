import { GrapeQLCoach, Select, Comment } from "grapeql-lang";

export class Parser {
    parse(selectSQL: string) {
        
        const selectSQLWithoutComments = this.removeComments( selectSQL );

        const coach = new GrapeQLCoach(selectSQLWithoutComments);
        const select = coach.parse(Select);

        // TODO: build big facade
        return select;
    }

    private removeComments(selectSQL: string) {
        const coach = new GrapeQLCoach(selectSQL);
        let outputSQL = "";

        while ( !coach.isEnd() ) {
            if ( coach.is(Comment) ) {

                const start = coach.i;
                coach.parse(Comment);
                const end = coach.i;

                const removedPart = selectSQL.slice(start, end);
                const spacedAnalog = removedPart.replace(/[^\n\r]/g, " ");
                outputSQL += spacedAnalog;

                continue;
            }

            const nextSymbol = coach.str[ coach.i ];
            outputSQL += nextSymbol;
            coach.i++;
        }

        outputSQL = outputSQL.trim();
        return outputSQL;
    }
}