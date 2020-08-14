import {testCleaner} from "./testCleaner";

describe("RemoveJoins", () => {

    it("unused left join", () => {
        testCleaner({
            dirty: `
                select from company
    
                left join country on
                    country.id = company.id_country
            `,
            clean: `
                select from company
            `
        });
    });
    

});