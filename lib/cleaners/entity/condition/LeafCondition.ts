import { AbstractCondition } from "./AbstractCondition";
import { Column } from "../Column";
import { FromItem, ColumnLink } from "grapeql-lang";

export class LeafCondition extends AbstractCondition {
    private elements: any[];

    constructor(elements: any[]) {
        super();
        this.elements = elements;
    }
    
    isUnique() {
        return false;
    }

    getNativeColumn(fromItem: FromItem) {
        const columnsLinks = this.elements.filter(elem =>
            elem instanceof ColumnLink
        );

        for (const columnLink of columnsLinks) {

            const column = new Column(columnLink);
            
            if ( column.from(fromItem) ) {
                const columnName = column.getName();
                return columnName;
            }
        }
    }
}