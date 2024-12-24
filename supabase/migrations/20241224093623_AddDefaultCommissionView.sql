create or replace view "public"."default_commission_view" 
WITH ("security_invoker"='on') 
as  WITH latest_commission AS (
         SELECT artist_commission.artist_id,
            artist_commission.store_id,
            max(artist_commission.effect_from_date) AS effect_from_date
           FROM artist_commission
          GROUP BY artist_commission.artist_id, artist_commission.store_id
        )
 SELECT ac.effect_from_date,
    ac.artist_id,
    ac.store_id,
    a.artist_name,
    s.store_name
   FROM (((artist_commission ac
     JOIN latest_commission lc ON (((ac.artist_id = lc.artist_id) AND (ac.store_id = lc.store_id) AND (ac.effect_from_date = lc.effect_from_date))))
     JOIN artist a ON ((ac.artist_id = a.id)))
     JOIN store s ON ((ac.store_id = s.id)));




