import assert from "assert";
import { GrapeQLCoach, Select } from "grapeql-lang";
import { clean } from "../lib/index";
import { Parser } from "../lib/Parser";

export interface ITest {
    dirty?: string;
    clean: string;
}

export function testCleaner(test: ITest) {
    const expectedCleanSQL = test.clean;
    const actualCleanSQL = clean(test.dirty || test.clean);

    equalSQL(expectedCleanSQL, actualCleanSQL);
}

function equalSQL(expectedSQL: string, actualSQL: string) {
    const expectedCoach = new GrapeQLCoach(expectedSQL);
    const expectedSelect = new Parser().parse(expectedSQL);

    const actualCoach = new GrapeQLCoach(actualSQL);
    const actualSelect = actualCoach.parse(Select);

    assert.deepStrictEqual(
        expectedSelect.toJSON(),
        actualSelect.toJSON()
    );
}