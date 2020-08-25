
export interface IUniqueConstraintParams {
    schemaName: string,
    tableName: string,
    columns: string[]
}

export class UniqueConstraint {
    schemaName: string;
    tableName: string;
    columns: string[];

    constructor(params: IUniqueConstraintParams) {
        this.schemaName = params.schemaName;
        this.tableName = params.tableName;
        this.columns = params.columns;
    }
}