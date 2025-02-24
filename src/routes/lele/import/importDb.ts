import db, { type TradeBody, type TradeHead, type TradeHeadRow, type TradeBodyRow } from '$lib/db';


export const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	let newTradeHead: TradeHeadRow[] = [];
	let newTradeBody: TradeBodyRow[] = [];
	{
		const { error, data } = await db.SaveTradeHead(tradeHeadList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeHead = data ?? [];
	}
	{
		const { error, data } = await db.SaveTradeBody(tradeBodyList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeBody = data ?? [];
	}
	return { error: null, newTradeHead, newTradeBody };
};
