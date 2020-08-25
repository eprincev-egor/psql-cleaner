import { FromItem } from "grapeql-lang";
import { UniqueConstraint } from "../UniqueConstraint";

export abstract class AbstractCondition {

    abstract isUnique(
        fromItem: FromItem,
        tableUniqueConstraints: UniqueConstraint[]
    ): boolean;
}