create or replace view "public"."default_commission_view" 
WITH ("security_invoker"='on') 
as  SELECT ac.effect_from_date,
    ac.artist_id,
    ac.store_id,
    a.artist_name,
    s.store_name,
    ac.commission
   FROM ((artist_commission ac
     JOIN artist a ON ((ac.artist_id = a.id)))
     JOIN store s ON ((ac.store_id = s.id)));





