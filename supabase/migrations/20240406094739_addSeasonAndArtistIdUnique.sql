CREATE UNIQUE INDEX artist_payment_status_artist_id_season_key ON public.artist_payment_status USING btree (artist_id, season);

alter table "public"."artist_payment_status" add constraint "artist_payment_status_artist_id_season_key" UNIQUE using index "artist_payment_status_artist_id_season_key";



