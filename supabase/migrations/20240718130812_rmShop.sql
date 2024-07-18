drop policy "Enable insert for authenticated users only" on "public"."shop";

drop policy "Enable read access for all users" on "public"."shop";

drop policy "Enable update for authenticated users only" on "public"."shop";

revoke delete on table "public"."shop" from "anon";

revoke insert on table "public"."shop" from "anon";

revoke references on table "public"."shop" from "anon";

revoke select on table "public"."shop" from "anon";

revoke trigger on table "public"."shop" from "anon";

revoke truncate on table "public"."shop" from "anon";

revoke update on table "public"."shop" from "anon";

revoke delete on table "public"."shop" from "authenticated";

revoke insert on table "public"."shop" from "authenticated";

revoke references on table "public"."shop" from "authenticated";

revoke select on table "public"."shop" from "authenticated";

revoke trigger on table "public"."shop" from "authenticated";

revoke truncate on table "public"."shop" from "authenticated";

revoke update on table "public"."shop" from "authenticated";

revoke delete on table "public"."shop" from "service_role";

revoke insert on table "public"."shop" from "service_role";

revoke references on table "public"."shop" from "service_role";

revoke select on table "public"."shop" from "service_role";

revoke trigger on table "public"."shop" from "service_role";

revoke truncate on table "public"."shop" from "service_role";

revoke update on table "public"."shop" from "service_role";

alter table "public"."shop" drop constraint "shop_commission_check";

alter table "public"."shop" drop constraint "shop_name_key";

alter table "public"."trade_head" drop constraint "public_trade_head_shop_id_fkey";

drop view if exists "public"."artist_trade_with_shop";

drop function if exists "public"."get_total_trade_with_shop"(artist_id integer, start_date timestamp with time zone, end_date timestamp with time zone, shop_id integer);

drop view if exists "public"."artist_trade";

alter table "public"."shop" drop constraint "shop_pkey";

drop index if exists "public"."shop_name_key";

drop index if exists "public"."shop_pkey";

drop table "public"."shop";

alter table "public"."trade_head" drop column "shop_id";

create or replace view "public"."artist_trade" as  SELECT a.artist_name,
    b.id,
    b.trade_id,
    b.item_name,
    b.quantity,
    b.total_sales,
    b.discount,
    b.net_sales,
    b.artist_id,
    h.trade_date
   FROM ((artist a
     JOIN trade_body b ON ((a.id = b.artist_id)))
     JOIN trade_head h ON ((b.trade_id = h.trade_id)));




