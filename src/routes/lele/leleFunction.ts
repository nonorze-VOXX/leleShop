import db, { supabase, type PaymentStatusInsert } from '$lib/db';
import { add, arr_sum, groupBy } from '$lib/function/Utils';

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
		return { error: 'invalid date', total_sales_sum: -1, net_sales_sum: -1, discount_sum: -1 };
	}
	const query = supabase
		.from('artist_trade')
		.select('*')
		.gt('trade_date', firstDate.toISOString())
		.lt('trade_date', lastDate.toISOString());
	const { data, error } = await query;
	if (error) {
		console.error(error);
		return {
			error: 'get trade data fail',
			total_sales_sum: -1,
			net_sales_sum: -1,
			discount_sum: -1
		};
	}
	console.log(data);
	const group = groupBy(data, (i) => (i.artist_name ? i.artist_name : 'error'));
	console.log(group);
	const total_sales_sum = arr_sum(data.map((el) => el.total_sales ?? 0));
	const net_sales_sum = data.map((el) => el.net_sales ?? 0).reduce(add, 0);
	const discount_sum = data.map((el) => el.discount ?? 0).reduce(add, 0);

	return { total_sales_sum, net_sales_sum, discount_sum };
}
