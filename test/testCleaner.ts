import assert from "assert";
import { clean } from "../lib/index";
import { Parser } from "../lib/Parser";
import { UniqueConstraint, IUniqueConstraintParams } from "../lib/clenaers/entity/UniqueConstraint";

export interface ITest {
    dirty?: string;
    clean: string;
    uniqueConstrains?: IUniqueConstraintParams[];
}

export function testCleaner(test: ITest) {
    const uniqueConstrains = (test.uniqueConstrains || []).map(constrainParams =>
        new UniqueConstraint(constrainParams)
    );

    const expectedCleanSQL = test.clean;
    const actualCleanSQL = clean(
        test.dirty || test.clean,
        uniqueConstrains
    );

    equalSQL(expectedCleanSQL, actualCleanSQL);
}

function equalSQL(expectedSQL: string, actualSQL: string) {
    const expectedSelect = new Parser().parse(expectedSQL);
    const actualSelect = new Parser().parse(actualSQL);

    assert.deepStrictEqual(
        expectedSelect.toString(),
        actualSelect.toString()
    );
}