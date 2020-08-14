import { GrapeQLCoach, Select } from "grapeql-lang";

export class Parser {
    parse(selectSQL: string) {
        const coach = new GrapeQLCoach(selectSQL);
        const select = coach.parse(Select);
        // TODO: build big facade
        return select;
    }
}