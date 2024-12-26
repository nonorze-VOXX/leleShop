drop view if exists "public"."default_artist_view";

drop view if exists "public"."default_commission_view";

drop view if exists "public"."artist_trade";

alter table "public"."store" drop column "default_commission";

create or replace view "public"."artist_trade" 
WITH ("security_invoker"='on') 
as  SELECT a.artist_name,
    b.id,
    b.trade_id,
    b.item_name,
    b.quantity,
    b.total_sales,
    b.discount,
    b.net_sales,
    b.artist_id,
    h.trade_date,
    s.store_name
   FROM (((artist a
     JOIN trade_body b ON ((a.id = b.artist_id)))
     JOIN trade_head h ON ((b.trade_id = h.trade_id)))
     LEFT JOIN store s ON ((s.id = h.store_id)));


create or replace view "public"."default_artist_view" 
WITH ("security_invoker"='on') 
as  SELECT DISTINCT artist.id,
    artist.artist_name,
    artist.report_key,
    artist.visible,
    artist.payment,
    artist_trade.store_name
   FROM (artist
     LEFT JOIN artist_trade ON ((artist_trade.artist_id = artist.id)))
  WHERE artist.visible
  ORDER BY artist.id;


create or replace view "public"."default_commission_view" 
WITH ("security_invoker"='on') 
as  SELECT ac.year_month,
    ac.artist_id,
    ac.store_id,
    a.artist_name,
    s.store_name,
    ac.commission
   FROM ((artist_commission ac
     JOIN artist a ON ((ac.artist_id = a.id)))
     JOIN store s ON ((ac.store_id = s.id)));




