import { MainCleaner } from "./cleaners/MainCleaner";
import { UniqueConstraint } from "./cleaners/entity/UniqueConstraint";

export function clean(selectSQL: string, constrains: UniqueConstraint[]): string {
    const cleaner = new MainCleaner();
    const cleanSQL = cleaner.clean(selectSQL, constrains);
    return cleanSQL;
}