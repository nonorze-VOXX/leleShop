alter table "public"."artist_payment_status" add column "state_by_season" bigint;

alter table "public"."artist_payment_status" add column "season" bigint;

alter table "public"."artist_payment_status" alter column "year_month" drop not null;



DELETE from artist_payment_status where season != NULL;

INSERT INTO artist_payment_status (season , artist_id, state_by_season)
select 
(case 
when  year_month='2024-02' 
or year_month='2024-03' 
or year_month='2024-04' 
then 1
when  year_month='2024-05' 
or year_month='2024-06' 
or year_month='2024-07' 
then 2
when  year_month='2024-08' 
or year_month='2024-09' 
or year_month='2024-10' 
then 3
when  year_month='2024-11' 
or year_month='2024-12' 
or year_month='2025-01' 
then 4
else null
end) as season,
        t.artist_id ,
        sum(case 
        when t.process_state='done' and year_month='2024-03' then 2 
        when t.process_state='done' then 1 
        else 0 end)
        
from    artist_payment_status t
where artist_id = 57
group by artist_id,
(case 
when  year_month='2024-02' 
or year_month='2024-03' 
or year_month='2024-04' 
then 1
when  year_month='2024-05' 
or year_month='2024-06' 
or year_month='2024-07' 
then 2
when  year_month='2024-08' 
or year_month='2024-09' 
or year_month='2024-10' 
then 3
when  year_month='2024-11' 
or year_month='2024-12' 
or year_month='2025-01' 
then 4
else null
end);

delete from artist_payment_status where season is NULL ;


-- drop old

alter table "public"."artist_payment_status" drop constraint "artist_payment_status_artist_id_season_key";

drop index if exists "public"."artist_payment_status_artist_id_season_key";

alter table "public"."artist_payment_status" drop column "year_month";

drop policy "anon can update todo to doing" on "public"."artist_payment_status";

alter table "public"."artist_payment_status" drop column "process_state";