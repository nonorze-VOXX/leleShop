create or replace view "public"."default_artist_view"  WITH ("security_invoker"='on')  as  SELECT artist.id,
    artist.artist_name,
    artist.report_key,
    artist.visible,
    artist.payment
   FROM artist
  WHERE artist.visible
  ORDER BY artist.id;




