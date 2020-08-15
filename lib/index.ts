import { MainCleaner } from "./clenaers/MainCleaner";
import { UniqueConstraint } from "./clenaers/join/UniqueConstraint";

export function clean(selectSQL: string, constrains: UniqueConstraint[]): string {
    const cleaner = new MainCleaner();
    const cleanSQL = cleaner.clean(selectSQL, constrains);
    return cleanSQL;
}