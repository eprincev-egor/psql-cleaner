import { Operator } from "grapeql-lang";
import { OrCondition } from "./OrCondition";
import { AndCondition } from "./AndCondition";
import { EqualCondition } from "./EqualCondition";
import { LeafCondition } from "./LeafCondition";
import { AbstractCondition } from "./AbstractCondition";

const OPERATORS_PRECEDENCE = [
    "or",
    "and",
    "="
];

export class ConditionBuilder {

    build(expressionElements: any[]): AbstractCondition {

        const highOperator = this.getHighPrecedenceOperator(expressionElements);
        
        if ( highOperator === "or" ) {
            const condition = this.separateExpressionAndCreateCondition(
                expressionElements,
                "or",
                OrCondition
            );
            return condition;
        }

        if ( highOperator === "and" ) {
            const condition = this.separateExpressionAndCreateCondition(
                expressionElements,
                "and",
                AndCondition
            );
            return condition;
        }

        if ( highOperator === "=" ) {
            const condition = this.separateExpressionAndCreateCondition(
                expressionElements,
                "=",
                EqualCondition
            );
            return condition;
        }

        const leafCondition = new LeafCondition(expressionElements);
        return leafCondition;
    }

    private getHighPrecedenceOperator(expressionElements: any[]): string | undefined {

        const highOperator = OPERATORS_PRECEDENCE.find(operator => {

            const existsOperatorInExpression = expressionElements.some(elem => 
                elem instanceof Operator &&
                elem.get("operator") === operator
            );

            return existsOperatorInExpression;
        });

        return highOperator;
    }

    private separateExpressionAndCreateCondition<T extends AbstractCondition>(
        expressionElements: any[],
        separator: string,
        ConditionConstructor: new (arg: AbstractCondition[]) => T
    ) {
        const expressionParts = separateExpression(expressionElements, separator);

        const childConditions = expressionParts.map(elements =>
            this.build(elements)
        );

        const condition = new ConditionConstructor(childConditions);
        return condition;
    }
}

function separateExpression(
    expressionElements: any[], 
    separator: string
): any[][] {
    const output = [];
    let prevPart = [];

    for (const elem of expressionElements) {

        const isSeparator = (
            elem instanceof Operator &&
            elem.get("operator") === separator
        )

        if ( isSeparator ) {
            output.push(prevPart);
            prevPart = [];
        }
        else {
            prevPart.push(elem);
        }
    }

    if ( prevPart.length ) {
        output.push(prevPart);
    }

    return output;
}