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

        testCleaner({
            dirty: `
                select from company
    
                left join country on
                    country.id = 1
            `,
            clean: `
                select from company
            `
        });


        testCleaner({
            dirty: `
                select from company
    
                left join country on
                    1 = country.id
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
        testCleaner({
            clean: `select from company
    
                right join (select) as tmp on true
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

        testCleaner({
            clean: `
                select
                    ( country.id * 2 )
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

        testCleaner({
            clean: `
                select from company
    
                left join country on
                    company.id = company.id or true
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


    it("all reference name variants", () => {
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
                    Public.country.id
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select
                    public.Country.id
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
                    My_country.id
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
    

    it("reference in where clause", () => {
        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                where
                    country.id in (1,2,3)
            `
        });
    });
    
    it("second join can return more than one row", () => {
        testCleaner({
            clean: `
                select from company

                left join country on
                    country.id = company.id_country

                left join company as company2 on
                    company2.id_country = country.id
            `
        });
    });
    

    it("select *", () => {
        testCleaner({
            clean: `
                select *
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select country.*
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select public.country.*
                from company
    
                left join country on
                    country.id = company.id_country
            `
        });

        testCleaner({
            clean: `
                select country.*
                from company
    
                left join public.countries as country on
                    country.id = company.id_country
            `
        });
    });
   
    it("many joins used in columns clause", () => {
        testCleaner({
            clean: `
                select
                    country_from.id + country_to.id
                from company
    
                left join country as country_from on
                    country_from.id = orders.id_country_from

                left join country as country_to on
                    country_to.id = orders.id_country_to
            `
        });
    });
     
    it("second join used in columns clause", () => {
        testCleaner({
            clean: `
                select
                    country.code
                from orders
    
                left join companies on
                    companies.id = orders.id_company_client

                left join country on
                    country.id = companies.id_country
            `
        });

        testCleaner({
            dirty: `
                select
                    country_registration.code
                from orders
    
                left join companies on
                    companies.id = orders.id_company_client

                left join country as country_factory on
                    country_factory.id = companies.id_country_factory

                left join country as country_registration on
                    country_registration.id = companies.id_country_registration
                
            `,
            clean: `
                select
                    country_registration.code
                from orders
    
                left join companies on
                    companies.id = orders.id_company_client

                left join country as country_registration on
                    country_registration.id = companies.id_country_registration
                
            `
        });
    });

    it("used in order by", () => {
        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                order by country.code desc
            `
        });

        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                order by company.name, (country.code + 1) desc
            `
        });
    });

    it("used in group by", () => {
        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                group by country.code
            `
        });

        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                group by cube (company.id, (country.id, 1))
            `
        });

        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                group by rollup (company.id, (country.id, 1))
            `
        });
        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                group by GROUPING SETS (company.id, country.code)
            `
        });
    });

    it("used in having", () => {
        testCleaner({
            clean: `
                select from company
    
                left join country on
                    country.id = company.id_country
                
                group by country.code
            `
        });

    });

    it("remove dirty join to sub query", () => {
        testCleaner({
            clean: `
                select from company
    
                left join (select) as tmp on true
            `
        });

    });

    it("left join to sub query can return more than one row", () => {
        testCleaner({
            clean: `
                select from company
    
                left join (select from country) as tmp on true
            `
        });

    });

});