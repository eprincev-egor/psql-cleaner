import { ObjectName, ColumnLink, FromItem, TableLink, Select } from "grapeql-lang";

// select *
// select table.*
// select column
// select table.column
// select schema.table.column
// select ... (select column)

export class Column {
    private star: boolean;
    private schema?: ObjectName;
    private table?: ObjectName;
    private name?: ObjectName;

    constructor(columnLink: ColumnLink) {
        this.star = columnLink.isStar() as boolean;

        const link = columnLink.get("link") as ObjectName[];
        
        // select *
        // select table.*
        // select schema.table.*
        if ( this.star ) {
            // select table.*
            if ( link.length === 1 ) {
                this.table = link[0];
            }
            // select schema.table.*
            else if ( link.length === 2 ) {
                this.schema = link[0];
                this.table = link[1];
            }
        }
        // select column
        // select table.column
        // select schema..table.column
        else {
            // select column
            if ( link.length === 1 ) {
                this.name = link[0];

                // get schema and table from select
                const parentSelect = columnLink.findParentInstance(Select);
                const fromItems = parentSelect.get("from") || [];
                const firstFrom = fromItems[0];

                if ( firstFrom ) {
                    const firstFromAlias = firstFrom.get("as");
                    if ( firstFromAlias ) {
                        this.table = firstFromAlias;
                    }
                    else {
                        const firstFromTable = firstFrom.get("table") as TableLink;
                        const firstFromTableLink = firstFromTable.get("link") as ObjectName[];
                        
                        // from table
                        if ( firstFromTableLink.length === 1 ) {
                            this.table = firstFromTableLink[0];
                        }
                        // from schema.table
                        else {
                            this.schema = firstFromTableLink[0];
                            this.table = firstFromTableLink[1];
                        }
                    }
                }
            }
            // select table.column
            else if ( link.length === 2 ) {
                this.table = link[0];
                this.name = link[1];
            }
            // select schema.table.column
            else if ( link.length === 3 ) {
                this.schema = link[0];
                this.table = link[1];
                this.name = link[2];
            }
        }
    }

    from(fromItem: FromItem) {
        const alias = fromItem.get("as");

        // select *
        if ( this.star && !this.table ) {
            return true;
        }
    
        if ( alias ) {
            if ( this.schema ) {
                return false;
            }
    
            const thisAlias = this.table as ObjectName;
            const isColumnFromThatAlias = (
                thisAlias.toLowerCase() === alias.toLowerCase()
            );
            return isColumnFromThatAlias;
        }

        const thatSchema = this.schema;
        const thatTable = this.table;

        // select column
        if ( !thatTable ) {
            return true;
        }

        const fromTableLinkSyntax = fromItem.get("table") as TableLink;
        const fromTableLink = fromTableLinkSyntax.get("link") as ObjectName[];

        let fromSchema: ObjectName | undefined;
        let fromTable!: ObjectName;

        if ( fromTableLink.length === 2 ) {
            fromSchema = fromTableLink[0];
            fromTable = fromTableLink[1];
        }
        else {
            fromTable = fromTableLink[0];
        }


        if ( thatSchema && fromSchema ) {
            const isColumnFromThatTable = (
                thatSchema.toLowerCase() === fromSchema.toLowerCase() &&
                thatTable.toLowerCase() === fromTable.toLowerCase()
            );
            return isColumnFromThatTable;
        }
        else {
            const isColumnFromThatTable = (
                thatTable.toLowerCase() === fromTable.toLowerCase()
            );
            return isColumnFromThatTable;
        }
    }

    getName() {
        const columnName = (this.name as ObjectName).toLowerCase() as string;
        return columnName;
    }
}
