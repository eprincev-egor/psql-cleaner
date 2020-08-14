import {testCleaner} from "./testCleaner";

describe("RemoveJoins", () => {

    it("unused left join, filter by primary key", () => {
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

        testCleaner({
            dirty: `
                select from company
    
                left join country on
                    company.id_country = country.id
            `,
            clean: `
                select from company
            `
        });
    });
    
    it("unused right join", () => {
        testCleaner({
            clean: `
                select from company
    
                right join country on
                    country.id = company.id_country
            `
        });
    });
    
    it("left join used in columns clause", () => {
        testCleaner({
            clean: `
                select
                    country.id
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });
    });
    
    it("left join can return more than one row", () => {
        testCleaner({
            clean: `
                select from company
    
                left join country on true
            `
        });

        testCleaner({
            clean: `
                select from company
    
                left join country on
                    company.id = company.id
            `
        });
    });
    
    it("left join sub query with many rows", () => {
        testCleaner({
            clean: `
                select from company
    
                left join lateral (
                    select 1
                    union
                    select 2
                ) as tmp on true
            `
        });
    });
   
    
    it("two unused left joins", () => {
        testCleaner({
            dirty: `
                select from orders

                left join companies on
                    companies.id = orders.id_client
    
                left join countries on
                    countries.id = companies.id_country
            `,
            clean: `
                select from orders
            `
        });
    });


    it("all reference variants", () => {
        testCleaner({
            clean: `
                select
                    public.country.id
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select
                    my_country.id
                from company
    
                left join country as my_country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select
                    country.id
                from company
    
                left join public.country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select
                    public.orders.id,
                    country_from.code,
                    country_to.code
                from orders
    
                left join country as country_from on
                    country_from.id = orders.id_country_from

                left join country as country_to on
                    country_to.id = orders.id_country_to
            `
        });

    });
    

});