set check_function_bodies = off;

create or replace view "public"."artist_trade_with_shop" WITH ("security_invoker"='on') as  SELECT a.artist_name,
    b.id,
    b.trade_id,
    b.item_name,
    b.quantity,
    b.total_sales,
    b.discount,
    b.net_sales,
    b.artist_id,
    h.trade_date,
    s.id AS shop_id,
    s.shop_name,
    s.commission
   FROM (((artist a
     JOIN trade_body b ON ((a.id = b.artist_id)))
     JOIN trade_head h ON ((b.trade_id = h.trade_id)))
     JOIN shop s ON ((h.shop_id = s.id)));


CREATE OR REPLACE FUNCTION public.get_total_trade_with_shop(artist_id integer, start_date timestamp with time zone, end_date timestamp with time zone, shop_id integer)
 RETURNS record
 LANGUAGE plpgsql
AS $function$begin
return (
  (
  select sum(total_sales)from artist_trade_with_shop atws
  where 
  $1=atws.artist_id and
  trade_date>=start_date and 
  trade_date < end_date and 
  $4=atws.shop_id
  ),
  (
    select sum(net_sales) as net_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  ),(
    select sum(discount) as discount_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  ),(
    select sum(quantity) as quantity_total
    from artist_trade_with_shop atws
    where 
    $1=atws.artist_id and
    trade_date>=start_date and 
    trade_date < end_date and 
  $4=atws.shop_id
  )
);
end$function$
;



