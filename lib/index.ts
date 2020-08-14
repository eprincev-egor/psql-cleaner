import { MainCleaner } from "./MainCleaner";

export function clean(selectSQL: string): string {
    const cleaner = new MainCleaner();
    const cleanSQL = cleaner.clean(selectSQL);
    return cleanSQL;
}