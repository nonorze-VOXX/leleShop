set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_total_trade(artist_id integer, start_date timestamp with time zone, end_date timestamp with time zone)
 RETURNS record
 LANGUAGE plpgsql
AS $function$begin
return (
  (
  select sum(total_sales)
  from artist_trade
  where 
  $1=artist_trade.artist_id and
  trade_date>=start_date and 
  trade_date < end_date
),(
  select sum(net_sales)
  from artist_trade
  where 
  $1=artist_trade.artist_id and
  trade_date>=start_date and 
  trade_date < end_date
  ),(
  select sum(discount)
  from artist_trade
  where 
  $1=artist_trade.artist_id and
  trade_date>=start_date and 
  trade_date < end_date
  )
);
end;$function$
;



