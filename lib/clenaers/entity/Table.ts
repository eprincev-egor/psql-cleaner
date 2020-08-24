import { TableLink, ObjectName } from "grapeql-lang";

const DEFAULT_SCHEMA_NAME = "public";

export class Table {
    schema: string;
    name: string;

    constructor(tableLink: TableLink) {
        const link = tableLink.get("link") as ObjectName[];

        if ( link.length === 1 ) {
            this.schema = DEFAULT_SCHEMA_NAME;
            this.name = link[0].toLowerCase() as string;
        }
        else {
            this.schema = link[0].toLowerCase() as string;
            this.name = link[1].toLowerCase() as string;
        }
    }

    equal(otherTable: Table) {
        const isSameTable = (
            otherTable.schema === this.schema &&
            otherTable.name === this.name
        );
        return isSameTable;
    }
}