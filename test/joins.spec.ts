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
            dirty: `
                select from company
    
                left join (select) as tmp on true
            `,
            clean: `
                select from company
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

    it("ignore comments", () => {
        testCleaner({
            clean: `
                /* some comment */
                -- and here
                select from company
            `
        });
        testCleaner({
            dirty: `
                select 
                    -- country.id
                from company
                
                left join country on country.id = 1
            `,
            clean: `
                select from company
            `
        });

    });

    it("join by two columns with unique constraint", () => {
        testCleaner({
            dirty: `
                select from orders

                left join companies on
                    companies.id = orders.id_company_client

                left join rates on
                    rates.id_company = companies.id and
                    rates.id_order = orders.id
                
            `,
            clean: `
                select from orders
            `,
            uniqueConstrains: [
                {
                    schemaName: "public",
                    tableName: "rates",
                    columns: ["id_order", "id_company"]
                }
            ]
        });
    });

    it("dirty join to sub query", () => {
        
        testCleaner({
            dirty: `
                select from orders

                left join lateral (
                    select 
                        sum( units.weight ) as total_weight
                    from units

                    limit 1
                ) as totals on true
            `,
            clean: `
                select from orders
            `
        });

    });

    it("sub query has same name dependencies", () => {
        
        testCleaner({
            dirty: `
                select from orders

                left join managers on
                    managers.id = orders.id_manager

                left join lateral (
                    select 
                        managers.id
                    from managers
                ) as totals on true
            `,
            clean: `
                select from orders

                left join lateral (
                    select 
                        managers.id
                    from managers
                ) as totals on true
            `
        });

        testCleaner({
            dirty: `
                select from orders

                left join users as managers on
                    managers.id = orders.id_manager

                left join lateral (
                    select 
                        managers.id
                    from users as managers
                ) as totals on true
            `,
            clean: `
                select from orders

                left join lateral (
                    select 
                        managers.id
                    from users as managers
                ) as totals on true
            `
        });
    });

    it("test #3", () => {
        testCleaner({
            dirty: `
                select from company

                left join country on
                    country.id = company.id_country and
                    true
                    `,
            clean: `
                select from company
                `
        });
    });

    it("test #4", () => {
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
    });


    it("test #5", () => {
        testCleaner({
            dirty: `
                select from company

                left join country on
                    country.id = (select 1) and
                    true
                    `,
            clean: `
                select from company
                `
        });
    });


    it("test #6", () => {
        testCleaner({
            clean: `
                select from company

                left join country on
                    country.id = (select 1) or
                    true
                `
        });
    });



    it("test #7", () => {
        testCleaner({
            clean: `
                select from company

                left join country on
                    country.id = company.id_country

                where country.id > 3
                `
        });
    });


    it("test #8", () => {
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

    it("test #9", () => {
        testCleaner({
            dirty: `
                select from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                    `,
            clean: `
                select from public.order as orders
                `,
            uniqueConstrains: [
                {
                    schemaName: "public",
                    tableName: "order_partner_link",
                    columns: ["id_order", "id_company"]
                }
            ]
        });
    });



    it("test #10", () => {
        testCleaner({
            clean: `
                select
                    partner_link.*
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                `
        });
    });


    it("test #11", () => {
        testCleaner({
            clean: `
                select
                    *
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                `
        });
    });


    it("test #12", () => {
        testCleaner({
            clean: `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                `
        });
    });


    it("test #13", () => {
        testCleaner({
            clean: `
                select
                    (company_client.id + partner_link.id_order + some.one)
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company

                left join lateral (
                    select
                        1 as one
                ) as some on true
                `
        });
    });


    it("test #14", () => {
        testCleaner({
            dirty: `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company

                left join lateral (
                    select
                        1 as one
                ) as some on true
                    `,
            clean: `
                select
                    (company_client.id + partner_link.id_order)
                from public.order as orders

                left join company as company_client on
                    company_client.id = orders.id_company_client

                left join order_partner_link as partner_link on
                    partner_link.id_order = orders.id and
                    company_client.id = partner_link.id_company
                `
        });
    });


    it("test #15", () => {
        testCleaner({
            dirty: `
                select from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select from company
                `
        });
    });


    it("test #16", () => {
        testCleaner({
            clean: `
                select from company

                left join (select * from country limit 1) as country on true

                order by country.id
                    `
        });
    });


    it("dependency inside sub query from select clause", () => {
        testCleaner({
            clean: `
                select
                    (select country.id) + 1
                from company

                left join (select * from country limit 1) as country on true
                    `
        });
    });

    it("test #17", () => {
        testCleaner({
            dirty: `
                select from company

                left join (select * from country limit 1) as country on true

                group by country.id
                    `,
            clean: `
                select from company

                left join (select * from country limit 1) as country on true

                group by country.id
                `
        });
    });


    it("test #18", () => {
        testCleaner({
            dirty: `
                select from company

                left join (select * from country limit 1) as country on true

                group by cube (company.id, (country.id, 1))
                    `,
            clean: `
                select from company

                left join (select * from country limit 1) as country on true

                group by cube (company.id, (country.id, 1))
                `
        });
    });


    it("test #19", () => {
        testCleaner({
            dirty: `
                select from company

                left join (select * from country limit 1) as country on true

                group by rollup (company.id, (country.id, 1))
                    `,
            clean: `
                select from company

                left join (select * from country limit 1) as country on true

                group by rollup (company.id, (country.id, 1))
                `
        });
    });


    it("test #20", () => {
        testCleaner({
            dirty: `
                select from company

                left join (select * from country limit 1) as country on true

                group by GROUPING SETS (company.id, country.code)
                    `,
            clean: `
                select from company

                left join (select * from country limit 1) as country on true

                group by GROUPING SETS (company.id, country.code)
                `
        });
    });


    it("test #21", () => {
        testCleaner({
            dirty: `
                select
                    cast( country.id as bigint )
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    cast( country.id as bigint )
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #22", () => {
        testCleaner({
            dirty: `
                select
                    company.id in (country.id)
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    company.id in (country.id)
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #23", () => {
        testCleaner({
            dirty: `
                select
                    company.id between country.id and 2
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    company.id between country.id and 2
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #24", () => {
        testCleaner({
            dirty: `
                select
                    company.id between 1 and country.id
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    company.id between 1 and country.id
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #25", () => {
        testCleaner({
            dirty: `
                select
                    (case
                        when country.id is not null
                        then 1
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    (case
                        when country.id is not null
                        then 1
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #26", () => {
        testCleaner({
            dirty: `
                select
                    (case
                        when true
                        then 1
                        else country.id
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    (case
                        when true
                        then 1
                        else country.id
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #27", () => {
        testCleaner({
            dirty: `
                select
                    (case
                        when true
                        then country.id
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    (case
                        when true
                        then country.id
                    end) as some
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #28", () => {
        testCleaner({
            dirty: `
                select
                    coalesce(1, country.id)
                from company

                left join (select * from country limit 1) as country on true
                    `,
            clean: `
                select
                    coalesce(1, country.id)
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #29", () => {
        testCleaner({
            dirty: `
                select
                    lower(country.code)
                from company

                left join (select * from country limit 1) as country on true
                                `,
            clean: `
                select
                    lower(country.code)
                from company

                left join (select * from country limit 1) as country on true
                `
        });
    });


    it("test #30", () => {
        testCleaner({
            dirty: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select * from (
                        select
                            russia_country.id as id_country
                        from country as russia_country

                        where
                            russia_country.id = 1
                        
                        limit 1
                    ) as some_table
                ) as some_table on true
                    `,
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id
                `
        });
    });


    it("test #31", () => {
        testCleaner({
            dirty: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select company.id
                ) as some_table on true
                    `,
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id
                `
        });
    });


    it("test #32", () => {
        testCleaner({
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select 
                    from (
                        select 1
                        from country as russia_country

                        where
                            russia_country.id = 1

                        union

                        select
                            company.id as id_country
                    ) as some_table
                ) as some_table on true
                `
        });
    });


    it("test #33", () => {
        testCleaner({
            dirty: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select * from (
                        select
                            russia_country.id as id_country
                        from country as russia_country

                        where
                            russia_country.id = 1

                        union

                        select
                            company.id as id_country
                    ) as some_table

                    limit 1
                ) as some_table on true
                    `,
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id
                `
        });
    });



    it("test #34", () => {
        testCleaner({
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select * from (
                        with
                            test as (
                                select
                                    company.name
                            )
                        select * from test
                    ) as some_table
                ) as some_table on true
                    `
        });
    });


    it("test #35", () => {
        testCleaner({
            dirty: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id

                left join company on
                    company.id = comp_id.id

                left join lateral (
                    select * from (
                        with
                            test as (
                                select
                                    company.name
                            )
                        select * from test
                    ) as some_table

                    limit 1
                ) as some_table on true
                    `,
            clean: `
                select
                    comp_id.id
                from (select 1 as id) as comp_id
                `
        });
    });


    it("test #36", () => {
        testCleaner({
            dirty: `
                select from company

                left join public.order as orders on
                    orders.id_company_client = company.id

                left join lateral (
                    select *
                    from country
                    where
                        country.id in (
                            orders.id_country_start,
                            orders.id_country_end
                        )
                    limit 1
                ) as country on true
                    `,
            clean: `
                select from company

                left join public.order as orders on
                    orders.id_company_client = company.id
                `
        });
    });


    it("test #37", () => {
        testCleaner({
            clean: `
                select CountryEnd.id
                from company

                left join country on
                    country.id = company.id_country

                left join country as CountryEnd on
                    CountryEnd.id = (select country.id)
                `
        });
    });


    it("test #37.1", () => {
        testCleaner({
            clean: `
                select CountryEnd.id
                from company

                left join country on
                    country.id = company.id_country

                left join lateral (
                    select
                    from (select) as tmp

                    inner join country as CountryInner on
                        CountryInner.id = (select country.id)

                    limit 1
                ) as CountryEnd on true
                `
        });
    });

    it("test #38", () => {
        testCleaner({
            dirty: `
                select from company

                left join country on
                    country.id = company.id_country

                left join country as CountryEnd on
                    CountryEnd.id = (select country.id)
                    `,
            clean: `
                select from company
                `
        });
    });


    it("test #39", () => {
        testCleaner({
            dirty: `
                select CountryEnd.id
                from company

                left join country on
                    country.id = company.id_country

                left join country as CountryEnd on
                    CountryEnd.id = (
                        select country.id
                        from country
                        limit 1
                    )
                    `,
            clean: `
                select CountryEnd.id
                from company

                left join country as CountryEnd on
                    CountryEnd.id = (
                        select country.id
                        from country
                        limit 1
                    )
                `
        });
    });


    it("test #40", () => {
        testCleaner({
            dirty: `
                select CountryEnd.id
                from company

                left join country on
                    country.id = company.id_country

                left join lateral (
                    select *
                    from country
                ) as CountryEnd on
                    CountryEnd.id = 1
                    `,
            clean: `
                select CountryEnd.id
                from company

                left join lateral (
                    select *
                    from country
                ) as CountryEnd on
                    CountryEnd.id = 1
                `
        });
    });


    it("test #45", () => {
        testCleaner({
            dirty: `
                select
                    public.order.id,
                    CompanyClient.inn as "client_inn"
                from public.order

                left join company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client

                left join country as "CompanyClient.country" on
                    "CompanyClient.country".id = CompanyClient.id_country
                    `,
            clean: `
                select
                    public.order.id,
                    CompanyClient.inn as "client_inn"
                from public.order

                left join company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
                `
        });
    });

    it("test #46", () => {
        testCleaner({
            clean: `
            select country_second.id
            from company

            left join country as country_first
                left join country as country_second
                on country_second.id = company.id_country + 1
            on country_first.id = company.id_country
                `
        });
    });


    it("test #47", () => {
        testCleaner({
            dirty: `
                select
                    public.order.id,
                    CompanyClient.inn as "client_inn"
                from public.order

                left join company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client

                left join country as "CompanyClient.country" on
                    "CompanyClient.country".id = CompanyClient.id_country
                    `,
            clean: `
                select
                    public.order.id,
                    CompanyClient.inn as "client_inn"
                from public.order

                left join company as CompanyClient on
                    CompanyClient.id = public.order.id_company_client
                `
        });
    });


    it("test #48", () => {
        testCleaner({
            clean: `
            select 
                string_agg( company.name ) filter (where 
                    country.code is not null 
                )
            from company

            left join country on
                country.id = company.id_country
                `
        });
    });


    it("test #49", () => {
        testCleaner({
            clean: `
            select 
                string_agg( 
                    company.name 
                    order by country.code 
                )
            from company

            left join country on
                country.id = company.id_country
                `
        });
    });

    it("test #50", () => {
        testCleaner({
            clean: `
            select 
                string_agg( company.name ) 
                within group (
                    order by country.code
                )
            from company

            left join country on
                country.id = company.id_country
                `
        });
    });


    it("test #51", () => {
        testCleaner({
            clean: `
            select
                row_number() over (
                    order by 
                        company.id desc, 
                        country.name desc
                ) as index_x
            from company

            left join country on
                country.id = company.id_country
                `
        });
    });


    it("test #52", () => {
        testCleaner({
            clean: `
            select
                row_number() over (
                    partition by 
                        company.id, 
                        country.name
                ) as index_x
            from company

            left join country on
                country.id = company.id_country
                `
        });
    });


    it("test #53", () => {
        testCleaner({
            clean: `
            select
                row_number() over (test_x) as index_x
            from company

            left join country on
                country.id = company.id_country

            window
                test_x as (order by company.id desc, country.name desc)
                `
        });
    });



    it("test #54", () => {
        testCleaner({
            clean: `
            select
                row_number() over (test_x) as index_x
            from company

            left join country on
                country.id = company.id_country

            window
                test_x as (partition by company.id, country.name)
                `
        });
    });


    it("test #55", () => {
        testCleaner({
            clean: `
            select 
                totals.count
            from company

            left join country on
                country.id = company.id_country

            left join lateral get_company_totals(
                country.code
            ) as totals on true
                `
        });
    });


    it("test #56", () => {
        testCleaner({
            clean: `
            select totals.count
from company

left join country
    left join lateral get_company_totals(
        country.code
    ) as totals on true
on country.id = company.id_country
                `
        });
    });


    it("test #57", () => {
        testCleaner({
            clean: `
            select next_country.code
            from company

            left join country
                inner join country as next_country
                on next_country.id = (country.id + 1)
            on country.id = company.id_country
                `
        });
    });


    it("test #58", () => {
        testCleaner({
            clean: `
                select *
                from company

                left join country
                    inner join country as next_country
                    on next_country.id = (country.id + 1)
                on country.id = company.id_country
                `
        });
    });


    it("test #59", () => {
        testCleaner({
            clean: `
                select country.code
                from company

                left join country
                    inner join country as next_country
                    on next_country.id = (country.id + 1)
                on country.id = company.id_country
                `
        });
    });


    it("test #60", () => {
        testCleaner({
            dirty: `
                select country.code
                from company

                left join country
                    left join country as next_country
                    on next_country.id = (country.id + 1)
                on country.id = company.id_country
                                    `,
            clean: `
                                select country.code
                from company

                left join country
                on country.id = company.id_country
                `
        });
    });


    // it("test #61", () => {
    //     testCleaner({
    //         dirty: `
    //             select company.inn
    //             from company

    //             left join country
    //                 inner join country as next_country
    //                 on next_country.id = (country.id + 1)
    //             on country.id = company.id_country
    //                 `,
    //         clean: `
    //             select company.inn
    //             from company
    //             `
    //     });
    // });




    // it("test #62", () => {
    //     testCleaner({
    //         dirty: `
    //             select company.inn
    //             from company

    //             left join country
    //                 left join country as country2
    //                 on country2.id = (country.id + 1)

    //                 inner join country as country3
    //                 on country3.id = (country2.id + 1)
    //             on country.id = company.id_country
    //                 `,
    //         clean: `
    //             select company.inn
    //             from company
    //             `
    //     });
    // });


    it("test #63", () => {
        testCleaner({
            clean: `
                select country2.code
                from company

                left join country
                    left join country as country2
                    on country2.id = (country.id + 1)

                    inner join country as country3
                    on country3.id = (country2.id + 1)
                on country.id = company.id_country
                `
        });
    });


    it("test #64", () => {
        testCleaner({
            clean: `
                select country4.code
                from company

                left join country
                    left join country as country2
                    on country2.id = (country.id + 1)

                    inner join country as country3
                        left join country as country4
                        on country4.id = country2.id
                    on country3.id = (country2.id + 1)
                on country.id = company.id_country
                `
        });
    });


    // it("test #65", () => {
    //     testCleaner({
    //         dirty: `
    //             select company.id
    //             from company

    //             left join country
    //                 left join country as country2
    //                 on country2.id = (country.id + 1)

    //                 inner join country as country3
    //                     left join country as country4
    //                     on country4.id = country2.id
    //                 on country3.id = (country2.id + 1)
    //             on country.id = company.id_country
    //                 `,
    //         clean: `
    //             select company.id
    //             from company
    //             `
    //     });
    // });


    it("test #66", () => {
        testCleaner({
            dirty: `
                select country4.code
                from company

                left join country
                    left join country as country2
                    on country2.id = (country.id + 1)

                    inner join country as country3
                        left join country as country4
                        on country4.id = country3.id
                    on country3.id = (country3.id + 1)
                on country.id = company.id_country
                    `,
            clean: `
                select country4.code
                from company

                left join country
                    inner join country as country3
                        left join country as country4
                        on country4.id = country3.id
                    on country3.id = (country3.id + 1)
                on country.id = company.id_country
                `
        });
    });


    it("test #67", () => {
        testCleaner({
            clean: `
                select country4.code
                from company

                left join country
                    inner join country as country2
                    on country2.id = (country.id + 1)

                    inner join country as country3
                        left join country as country4
                        on country4.id = country3.id
                    on country3.id = (country3.id + 1)
                on country.id = company.id_country
                `
        });
    });


    it("test #68", () => {
        testCleaner({
            clean: `
                select test_with_values.*
                from company

                left join country on
                    country.id = company.id_country

                left join lateral (
                    with x as (
                        values ((
                            select country.id
                        ))
                    )
                    select *
                    from x
                    limit 1
                ) as test_with_values on true
                `
        });
    });


    it("test #69", () => {
        testCleaner({
            dirty: `
                select company.id
                from company

                left join country on
                    country.id = company.id_country

                left join lateral (
                    with x as (
                        values ((
                            select country.id
                        ))
                    )
                    select *
                    from x
                    limit 1
                ) as test_with_values on true
                    `,
            clean: `
                select company.id
                from company
                `
        });
    });


    // it("test #70", () => {
    //     testCleaner({
    //         dirty: `
    //             select test_with_values.*
    //             from company

    //             left join country on
    //                 country.id = company.id_country

    //             left join lateral (
    //                 with x as (
    //                     values ((
    //                         select company.id
    //                     ))
    //                 )
    //                 select *
    //                 from x
    //                 limit 1
    //             ) as test_with_values on true
    //                 `,
    //         clean: `
    //             select test_with_values.*
    //             from company

    //             left join lateral (
    //                 with x as (
    //                     values ((
    //                         select company.id
    //                     ))
    //                 )
    //                 select *
    //                 from x
    //                 limit 1
    //             ) as test_with_values on true
    //             `
    //     });
    // });

    it("test #71", () => {
        testCleaner({
            clean: `
                select
                `
        });
    });


    it("test #72", () => {
        testCleaner({
            clean: `
                select
                from companies
                
                left join countries on
                    false in (true, false)
                `
        });
    });


    it("test #73", () => {
        testCleaner({
            clean: `
                select
                from companies
                
                left join countries on
                    1 in (1, 2, 3)
                `
        });
    });

    it("test #74", () => {
        testCleaner({
            dirty: `
                select
                    country.id
                from companies
                
                left join (
                    select 
                        country.code
                    from public.countries as country
                    limit 1
                ) as tmp on true

                inner join public.countries as country on
                    country.id = 1
                `,
            clean: `
                select
                    country.id
                from companies
                
                inner join public.countries as country on
                    country.id = 1
            `
        });
    });
    
    it("test #75", () => {
        testCleaner({
            clean: `
                select
                from companies, countries
                `
        });
    });
    
    
    it("test #76", () => {
        testCleaner({
            dirty: `
                select 
                    (
                        select id
                        from y
                    )
                from x

                left join z on 
                    z.id = 1
            
                `,
            clean: `
                select 
                    (
                        select id
                        from y
                    )
                from x
            `
        });
    });
    
    it("test #77", () => {
        testCleaner({
            clean: `
                select distinct on (countries.code)
                    1
                from companies

                left join countries on 
                    countries.id = companies.id_country
            
                `
        });
    });
    
    it("test #78", () => {
        testCleaner({
            dirty: `
                select distinct on (1)
                    1
                from companies

                left join countries on 
                    countries.id = companies.id_country
            
                `,
            clean: `
                select distinct on (1)
                    1
                from companies
            `
        });
    });

    it("test #79", () => {
        testCleaner({
            clean: `
                select distinct on (1)
                    1
                from companies

                left join countries on 
                    countries.id = companies.id_country
                
                where
                    countries.code is not null
                `
        });
    });

    it("test #79", () => {
        testCleaner({
            dirty: `
                select from companies

                left join lateral (
                    select 
                        string_agg( orders.numb )
                    from orders
                    where
                        orders.id_company = companies.id
                ) as totals on true
                `,
            clean: `
                select from companies
            `
        });
    });

    it("test #80", () => {
        testCleaner({
            dirty: `
                select from companies

                left join lateral (
                    select 
                        array_agg( orders.numb )
                    from orders
                    where
                        orders.id_company = companies.id
                ) as totals on true
                `,
            clean: `
                select from companies
            `
        });
    });

    it("test #81", () => {
        testCleaner({
            dirty: `
                select from companies

                left join lateral (
                    select 
                        count( * )
                    from orders
                    where
                        orders.id_company = companies.id
                ) as totals on true
                `,
            clean: `
                select from companies
            `
        });
    });

    it("test #82", () => {
        testCleaner({
            dirty: `
                select from companies

                left join lateral (
                    select 
                        max( orders.date )
                    from orders
                    where
                        orders.id_company = companies.id
                ) as totals on true
                `,
            clean: `
                select from companies
            `
        });
    });

    it("test #83", () => {
        testCleaner({
            dirty: `
                select from companies

                left join lateral (
                    select 
                        min( orders.date )
                    from orders
                    where
                        orders.id_company = companies.id
                ) as totals on true
                `,
            clean: `
                select from companies
            `
        });
    });

    it("test #84", () => {
        testCleaner({
            clean: `
                select from companies

                left join lateral (
                    select 
                        min( orders.date )
                    from orders
                    where
                        orders.id_company = companies.id
                    
                    group by orders.category
                ) as totals on true
                `
        });
    });

});