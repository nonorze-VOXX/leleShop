import db, { supabase, type PaymentStatusInsert } from '$lib/db';
import { arr_sum } from '$lib/function/Utils';

export async function PreInsertPaymentStatus(month: string) {
	const re = /^\d{4}-\d{2}$/;
	if (month.match(re)?.[0].length !== month.length) {
		return { newData: [], paymentData: [], error: 'invalid month format' };
	}

	const { data, error } = await db.GetPaymentStatus({ year_month: month });
	if (error) {
		console.error(error);
		return { newData: [], paymentData: [], error: 'get payment status fail' };
	}
	const artistData = (await db.GetArtistDataList())?.data ?? [];
	const noPaymentList: PaymentStatusInsert[] = [];
	if (artistData?.length !== data?.length) {
		artistData.forEach((element) => {
			if (element.id !== data?.find((e) => e.artist_id === element.id)?.artist_id) {
				noPaymentList.push({ artist_id: element.id, year_month: month, process_state: 'todo' });
			}
		});
	}
	if (noPaymentList.length === 0) {
		return { error: null, newData: [], paymentData: data };
	}
	const result = await db.InsertPaymentStatus(noPaymentList);
	if (result.error) {
		return { error: result.error, newData: [], paymentData: data };
	}
	const newData = result.data ?? [];
	return { error: null, newData: newData, paymentData: data };
}

export async function GetTradeTotalDataEachOne(firstDate: Date, lastDate: Date) {
	if (!firstDate || !lastDate) {
		return { error: 'invalid date', result: [] };
	}
	const query = supabase
		.from('artist')
		.select('id,artist_name, artist_trade(*)')
		.gt('artist_trade.trade_date', firstDate.toISOString())
		.lt('artist_trade.trade_date', lastDate.toISOString());

	const { data, error } = await query;
	if (error) {
		console.error(error);
		return {
			error: 'get trade data fail',
			result: []
		};
	}
	const result: {
		id: number;
		name: string;
		total_sales_sum: number;
		net_sales_sum: number;
		discount_sum: number;
	}[] = [];

	for (let i = 0; i < data.length; i++) {
		const element = data[i];
		const total_sales_sum = arr_sum(element.artist_trade.map((el) => el.total_sales ?? 0));
		const net_sales_sum = arr_sum(element.artist_trade.map((el) => el.net_sales ?? 0));
		const discount_sum = arr_sum(element.artist_trade.map((el) => el.discount ?? 0));
		console.log(element.id, total_sales_sum, net_sales_sum, discount_sum);
		result.push({
			name: element.artist_name,
			id: element.id,
			total_sales_sum,
			net_sales_sum,
			discount_sum
		});
	}

	console.log(result);
	return { result };
}
