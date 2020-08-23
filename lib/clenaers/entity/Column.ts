import { ObjectName, ColumnLink, FromItem, TableLink } from "grapeql-lang";
import { Table } from "./Table";

export class Column {
    private hasStar: boolean;
    private table?: Table;
    private route: ObjectName[];
    private name?: ObjectName;

    constructor(columnLink: ColumnLink) {
        this.route = columnLink.get("link") as ObjectName[];
        this.hasStar = columnLink.isStar() as boolean;
        
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
    
        const fromTableLink = fromItem.get("table") as TableLink;
        const fromTable = new Table(fromTableLink);

        const thatTable = this.table as Table;
        const isColumnFromThatTable = fromTable.equal(thatTable);
        return isColumnFromThatTable;
    }

    getName() {
        const columnName = (this.name as ObjectName).toLowerCase() as string;
        return columnName;
    }
}
