create or replace view "public"."default_artist_view"  WITH ("security_invoker"='on')  as  
SELECT DISTINCT artist.id,
    artist.artist_name,
    artist.report_key,
    artist.visible,
    artist.payment
    , artist_trade.store_name
   FROM artist
   left join artist_trade
   on artist_trade.artist_id = artist.id
  WHERE artist.visible
  ORDER BY artist.id;