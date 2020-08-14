import { 
    Select, 
    Join, 
    Expression, 
    FromItem, 
    Operator, 
    ColumnLink, 
    TableLink, 
    ObjectName 
} from "grapeql-lang";

export class JoinCleaner {
    clean(dirtySelect: Select): Select {

        const cleanSelect = dirtySelect.clone();
        const allFromItems = cleanSelect.filterChildrenByInstance(FromItem);
        
        for (const fromItem of allFromItems) {
            removeDirtyJoins(cleanSelect, fromItem);
        }

        return cleanSelect;
    }
}

function removeDirtyJoins(select: Select, fromItem: FromItem) {
    const allJoins = fromItem.get("joins");

    if ( !allJoins || !allJoins.length ) {
        return;
    }

    for (const join of allJoins) {
        if ( !isDirtyJoin(select, join) ) {
            continue;
        }

        removeJoin(fromItem, join);
    }
}

function isDirtyJoin(select: Select, join: Join) {
    if ( !isLeftJoin(join) ) {
        return false;
    }

    if ( !isConditionByPrimaryKey(join) ) {
        return false;
    }

    if ( hasColumnsReferencesToJoin(select, join) ) {
        return false;
    }

    return true;
}

function removeJoin(fromItem: FromItem, dirtyJoin: Join) {

    const allJoins = fromItem.get("joins") as Join[];

    const cleanJoins = allJoins.filter(someJoin =>
        someJoin !== dirtyJoin
    );

    fromItem.set({
        joins: cleanJoins
    });
}

function isLeftJoin(join: Join) {
    const joinType = join.get("type");
    const isLeft = joinType === "left join";
    return isLeft;
}

function isConditionByPrimaryKey(join: Join): boolean {
    const fromItem = join.get("from") as FromItem;

    const joinedTable = fromItem.get("table");
    if ( !joinedTable ) {
        return false;
    }

    const condition = join.get("on") as Expression;
    const elements = condition.get("elements") as any[];

    const leftOperand = elements[0];
    const operator = elements[1];
    const rightOperand = elements[2];

    const isBinaryEqualExpression = (
        elements.length === 3 
        &&
        leftOperand instanceof ColumnLink 
        &&
        operator instanceof Operator &&
        operator.get("operator") === "="
        &&
        rightOperand instanceof ColumnLink
    );
    if ( !isBinaryEqualExpression ) {
        return false;
    }
    
    if ( isColumnFrom(leftOperand, fromItem) ) {
        const isPrimaryKey = isIdColumn(leftOperand);
        return isPrimaryKey;
    }
    else if ( isColumnFrom(rightOperand, fromItem) ) {
        const isPrimaryKey = isIdColumn(rightOperand);
        return isPrimaryKey;
    }
    else {
        return false;
    }
}

function isIdColumn(column: ColumnLink) {
    const columnNameSyntax = column.last() as ObjectName;
    const columnName = columnNameSyntax.toLowerCase();
    const isId = columnName === "id";
    return isId;
}


function hasColumnsReferencesToJoin(select: Select, join: Join): boolean {
    const allColumnsLinks = select.filterChildrenByInstance(ColumnLink);

    const fromItem = join.get("from") as FromItem;
    const joinCondition = join.get("on") as Expression;

    const hasReferenceToThatFromItem = allColumnsLinks.some(columnLink => {
        const isColumnLinkFromJoinCondition = !!joinCondition.findChild(someChild =>
            someChild === columnLink
        );
        if ( isColumnLinkFromJoinCondition ) {
            return false;
        }

        const hasReference = isColumnFrom(columnLink, fromItem);
        return hasReference;
    });
    
    return hasReferenceToThatFromItem;
}


function isColumnFrom(
    column: ColumnLink, 
    fromItem: FromItem
): boolean {
    const alias = fromItem.get("as");
    const columnLink = column.get("link") as ObjectName[];
    
    if ( alias ) {
        if ( columnLink.length !== 2 ) {
            return false;
        }

        const columnTableName = columnLink[0];
        const isColumnFromThatAlias = (
            columnTableName.equal(alias)
        );
        return isColumnFromThatAlias;
    }

    const table = fromItem.get("table");
    if ( !table ) {
        return false;
    }

    const tableLink = table.get("link") as ObjectName[];

    const isColumnFromThatTable = equalTableLinks(
        columnLink.slice(0, -1),
        tableLink
    );
    return isColumnFromThatTable;
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
