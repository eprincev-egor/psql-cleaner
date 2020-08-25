import { ObjectName, ColumnLink, FromItem, TableLink, Select } from "grapeql-lang";
import { Table } from "./Table";

// select *
// select table.*
// select column
// select table.column
// select schema.table.column
// select ... (select column)

export class Column {
    private hasStar: boolean;
    private table?: Table;
    private route: ObjectName[];
    private name?: ObjectName;

    constructor(columnLink: ColumnLink) {
        this.route = columnLink.get("link") as ObjectName[];
        this.hasStar = columnLink.isStar() as boolean;

        if ( this.route.length === 1 && ! this.hasStar ) {
            const parentSelect = columnLink.findParentInstance(Select);
            const fromItems = parentSelect.get("from") || [];
            const firstFrom = fromItems[0];

            if ( firstFrom ) {
                const firstFromAlias = firstFrom.get("as");
                if ( firstFromAlias ) {
                    this.route.unshift(firstFromAlias);
                }
                else {
                    const firstFromTable = firstFrom.get("table") as TableLink;
                    const firstFromTableRoute = firstFromTable.get("link") as ObjectName[];
                    this.route = [...firstFromTableRoute, ...this.route];
                }
            }
        }
        
        if ( !this.hasStar ) {
            this.name = columnLink.last();
        }

        let tableRoute;
        if ( this.hasStar ) {
            tableRoute = this.route;
        }
        else {
            tableRoute = this.route.slice(0, -1);
        }
        if ( tableRoute.length > 0 ) {
            const tableLink = new TableLink({
                link: tableRoute
            });
            this.table = new Table(tableLink);
        }
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

        const thatTable = this.table as Table;
        if ( !thatTable ) {
            return true;
        }
    
        const fromTableLink = fromItem.get("table") as TableLink;
        const fromTable = new Table(fromTableLink);

        const isColumnFromThatTable = fromTable.equal(thatTable);
        return isColumnFromThatTable;
    }

    getName() {
        const columnName = (this.name as ObjectName).toLowerCase() as string;
        return columnName;
    }
}
