DELETE FROM trade_body WHERE trade_id IN
(
SELECT h.trade_id
FROM trade_head h
INNER JOIN trade_body b
on h.trade_id=b.trade_id
WHERE h.state!='關閉'
);

DELETE
FROM trade_head h
WHERE h.state!='關閉';

alter table "public"."trade_head" drop column "state";

