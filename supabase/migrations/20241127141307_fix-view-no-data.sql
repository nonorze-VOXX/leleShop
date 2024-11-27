create or replace  view 
  public.artist_trade  WITH ("security_invoker"='on')  as
select
  a.artist_name,
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
from
  artist a
  join trade_body b on a.id = b.artist_id
  join trade_head h on b.trade_id = h.trade_id
  left join store s on s.id = h.store_id;