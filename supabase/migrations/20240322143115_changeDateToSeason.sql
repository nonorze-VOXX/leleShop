alter table "public"."artist_payment_status" drop column "create_time";

alter table "public"."artist_payment_status" add column "season" text;

INSERT INTO artist_payment_status (season,process_state,artist_id)
SELECT '2024-03','todo',id 
FROM artist;



