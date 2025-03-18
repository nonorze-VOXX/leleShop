import { onePageLength, supabase, type ArtistWithTradeRow, type SalesTotalData } from '$lib/db';
import type { StoreList } from '$lib/store/choosing';
import type { DateRange } from '$lib/type';

const QueryData = ({
	artist_id,
	count,
	dateRange,
	storeList
}: {
	artist_id: number;
	count: boolean;
	dateRange: DateRange;
	storeList: StoreList;
}) => {
	let query = count
		? supabase.from('artist_trade').select('*', { count: 'exact' })
		: supabase.from('artist_trade').select('*');

	query = query.eq('artist_id', artist_id);
	if (dateRange) {
		if (dateRange.firstDate) query = query.gte('trade_date', dateRange.firstDate.toISOString());
		if (dateRange.lastDate) query = query.lte('trade_date', dateRange.lastDate.toISOString());
	}
	if (storeList) {
		if (storeList !== '*') query = query.in('store_name', storeList);
	}

	return query;
};

export const GetPageData = async (param: {
	artist_id: number;
	dateRange: DateRange;
	storeList: StoreList;
}) => {
	const countRes = await QueryData({ ...param, count: true });
	if (countRes.error) {
		console.error(countRes.error);
	}

	const count = countRes.data?.length ?? 0;

	const tradeData: ArtistWithTradeRow[] = [];
	for (let i = 0; i < count / onePageLength; i++) {
		const query = QueryData({ ...param, count: false }).range(
			i * onePageLength,
			(i + 1) * onePageLength - 1
		);
		const res = await query;
		if (res.error) {
			console.error(res.error);
		}
		res.data?.forEach((row) => {
			tradeData.push(row);
		});
	}

	return { tradeData };
};
export function GetTotal(tradeData: ArtistWithTradeRow[]): SalesTotalData {
	return {
		discount_total: tradeData.reduce(
			(acc, cur) => acc + (cur && cur.discount ? cur.discount : 0),
			0
		),
		net_total: tradeData.reduce((acc, cur) => acc + (cur && cur.net_sales ? cur.net_sales : 0), 0),
		sales_total: tradeData.reduce(
			(acc, cur) => acc + (cur && cur.total_sales ? cur.total_sales : 0),
			0
		),
		total_quantity: tradeData.reduce(
			(acc, cur) => acc + (cur && cur.quantity ? cur.quantity : 0),
			0
		)
	};
}

export const GetFilteredTradeData = (filterText: string, tradeData: ArtistWithTradeRow[]) => {
	if (filterText.trim() === '') {
		return tradeData;
	}
	const processedFilter = filterText
		.trim()
		.split(' ')
		.map((s) => s.trim());

	return tradeData.filter((d) =>
		processedFilter.reduce((pre, cur) => pre || JSON.stringify(d).match(cur) !== null, false)
	);
};
