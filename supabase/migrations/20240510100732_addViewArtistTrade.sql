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




