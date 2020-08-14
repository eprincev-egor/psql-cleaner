import { ObjectName, ColumnLink, FromItem, TableLink } from "grapeql-lang";

export class Column {
    private hasStar: boolean;
    private route: ObjectName[];
    private name?: ObjectName;

    constructor(columnLink: ColumnLink) {
        this.route = columnLink.get("link") as ObjectName[];
        this.hasStar = columnLink.isStar() as boolean;
        
        if ( !this.hasStar ) {
            this.name = columnLink.last();
        }
    }

    isId() {
        if ( !this.name ) {
            return false;
        }

        const columnName = this.name.toLowerCase();
        const isId = columnName === "id";
        return isId;
    }

    from(fromItem: FromItem) {
        const alias = fromItem.get("as");
        let columnTableLink = this.route.slice(0, -1);
    
        if ( this.hasStar ) {
            // select *
            if ( this.route.length === 0 ) {
                return true;
            }
            
            columnTableLink = this.route;
        }
        
        if ( alias ) {
            if ( columnTableLink.length !== 1 ) {
                return false;
            }
    
            const columnTableName = this.route[0];
            const isColumnFromThatAlias = (
                columnTableName.equal(alias)
            );
            return isColumnFromThatAlias;
        }
    
        const table = fromItem.get("table") as TableLink;
        const tableLink = table.get("link") as ObjectName[];
    
        const isColumnFromThatTable = equalTableLinks(
            columnTableLink,
            tableLink
        );
        return isColumnFromThatTable;
    }
}

function equalTableLinks(
    tableLinkA: ObjectName[],
    tableLinkB: ObjectName[]
): boolean {
    const {schema: schemaA, table: tableA} = getSchemaAndTable(tableLinkA);
    const {schema: schemaB, table: tableB} = getSchemaAndTable(tableLinkB);
    
    const isSameTables = (
        schemaA === schemaB 
        &&
        tableA === tableB
    );
    return isSameTables;
}

function getSchemaAndTable(table: ObjectName[]) {
    if ( table.length === 1 ) {
        const output = {
            schema: "public",
            table: table[0].toLowerCase() as string
        };
        return output;
    }
    else {
        const output = {
            schema: table[0].toLowerCase() as string,
            table: table[1].toLowerCase() as string
        };
        return output;
    }
}
