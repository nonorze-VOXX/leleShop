alter table "public"."artist" add column "payment" bigint not null default '0'::bigint;
update artist set artist.payment = (select state_by_season from artist_payment_status where season = 2);
drop policy "Enable insert for authenticated users only" on "public"."artist_payment_status";

drop policy "Enable read access for all users" on "public"."artist_payment_status";

revoke delete on table "public"."artist_payment_status" from "anon";

revoke insert on table "public"."artist_payment_status" from "anon";

revoke references on table "public"."artist_payment_status" from "anon";

revoke select on table "public"."artist_payment_status" from "anon";

revoke trigger on table "public"."artist_payment_status" from "anon";

revoke truncate on table "public"."artist_payment_status" from "anon";

revoke update on table "public"."artist_payment_status" from "anon";

revoke delete on table "public"."artist_payment_status" from "authenticated";

revoke insert on table "public"."artist_payment_status" from "authenticated";

revoke references on table "public"."artist_payment_status" from "authenticated";

revoke select on table "public"."artist_payment_status" from "authenticated";

revoke trigger on table "public"."artist_payment_status" from "authenticated";

revoke truncate on table "public"."artist_payment_status" from "authenticated";

revoke update on table "public"."artist_payment_status" from "authenticated";

revoke delete on table "public"."artist_payment_status" from "service_role";

revoke insert on table "public"."artist_payment_status" from "service_role";

revoke references on table "public"."artist_payment_status" from "service_role";

revoke select on table "public"."artist_payment_status" from "service_role";

revoke trigger on table "public"."artist_payment_status" from "service_role";

revoke truncate on table "public"."artist_payment_status" from "service_role";

revoke update on table "public"."artist_payment_status" from "service_role";

alter table "public"."artist_payment_status" drop constraint "artist_payment_status_artist_id_fkey";

drop view if exists "public"."anon_artist_list_payment";

alter table "public"."artist_payment_status" drop constraint "artist_payment_status_pkey";

drop index if exists "public"."artist_payment_status_pkey";

drop table "public"."artist_payment_status";




