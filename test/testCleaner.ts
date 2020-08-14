import assert from "assert";
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
    const expectedSelect = new Parser().parse(expectedSQL);
    const actualSelect = new Parser().parse(actualSQL);

    assert.deepStrictEqual(
        expectedSelect.toJSON(),
        actualSelect.toJSON()
    );
}