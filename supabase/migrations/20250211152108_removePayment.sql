drop view "public"."default_artist_view";
create or replace view "public"."default_artist_view" 
WITH ("security_invoker"='on') 
as  SELECT DISTINCT artist.id,
    artist.artist_name,
    artist.report_key,
    artist.visible,
    artist_trade.store_name
   FROM (artist
     LEFT JOIN artist_trade ON ((artist_trade.artist_id = artist.id)))
  WHERE artist.visible
  ORDER BY artist.id;

alter table "public"."artist" drop column "payment";