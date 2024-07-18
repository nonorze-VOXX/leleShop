create or replace view "public"."anon_artist_list_payment" as  SELECT a.id,
    b.state_by_season,
    b.season,
    a.artist_name
   FROM (artist a
     JOIN artist_payment_status b ON ((a.id = b.artist_id)))
  WHERE (a.visible = true);




