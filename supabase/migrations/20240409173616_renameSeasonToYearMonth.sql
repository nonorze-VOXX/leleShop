alter table "public"."artist_payment_status" drop constraint "artist_payment_status_artist_id_season_key";

drop index if exists "public"."artist_payment_status_artist_id_season_key";

alter table "public"."artist_payment_status" RENAME  "season" to "year_month" ;

CREATE UNIQUE INDEX artist_payment_status_artist_id_season_key ON public.artist_payment_status USING btree (artist_id, year_month);

alter table "public"."artist_payment_status" add constraint "artist_payment_status_artist_id_season_key" UNIQUE using index "artist_payment_status_artist_id_season_key";



