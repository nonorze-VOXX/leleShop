import { supabase, type QueryTradeBodyWithTradeHead, type PaymentStatusUpdate } from '$lib/db';
import db from '$lib/db';
import { GetSeason, GetYearMonth } from '$lib/function/Utils.js';
import { fail } from '@sveltejs/kit';
import { PreInsertPaymentStatus } from './leleFunction.server';

const randomNumber = (length: number) => {
	let number = '';
	for (let i = 0; i < length; i++) {
		number += Math.floor(Math.random() * 10).toString();
	}
	return number;
};

function GetNextMonth(offset: number = 1) {
	return GetYearMonth(offset);
}

export const load = async () => {
	const artistData = (await db.GetArtistDataList({ ordered: true, ascending: true }))?.data;
	await PreInsertPaymentStatus(GetYearMonth());
	await PreInsertPaymentStatus(GetNextMonth());
	await PreInsertPaymentStatus(GetNextMonth(2));
	await PreInsertPaymentStatus(GetNextMonth(3));
	let query = supabase.from('artist').select('id, artist_name, visible,artist_payment_status(*) ');
	query = query
		.in('artist_payment_status.year_month', [GetSeason(0), GetSeason(1), GetSeason(2)])
		.order('id', { ascending: true });
	const { data, error } = await query;
	if (error) {
		console.error(error);
	}
	if (!data) {
		return { artistData: [], paymentStatus: [] };
	}
	data.forEach((element) => {
		element.artist_payment_status.sort((a, b) => {
			if (a.year_month < b.year_month) return -1;
			else if (a.year_month > b.year_month) return 1;
			return 0;
		});
	});
	return { artistData, paymentStatus: data };
};

export const actions = {
	UpdatePaymentStatus: async ({ request }) => {
		const formData = await request.formData();
		const season = formData.get('season') as string; // YYYY-MM
		const artist_id = parseInt(formData.get('artist_id') as string);
		const payment_id = parseInt(formData.get('payment_id') as string);
		const process_state = formData.get('process_state') as string;
		if (process_state !== 'todo' && process_state !== 'done' && process_state !== 'doing')
			return fail(400, { message: 'process_state is invalid' });

		const update: PaymentStatusUpdate = { artist_id, year_month: season, process_state };

		const { error } = await db.ChangePaymentStatus(update, payment_id);
		if (error) {
			console.error(error);
			return fail(400, { error });
		}
		return {};
	},
	UpdateReportKey: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const random = randomNumber(5);
		const { data, error } = await supabase
			.from('artist')
			.update({ report_key: random })
			.eq('id', id)
			.select()
			.single();

		if (error) {
			console.error(error);
		}

		const key = data?.report_key;
		return { key };
	},
	UpdateTradeData: async ({ request }) => {
		const formData = await request.formData();
		const firstDate = formData.get('firstDate') as string;
		const lastDate = formData.get('lastDate') as string;

		const tradeDataList: QueryTradeBodyWithTradeHead = (
			await db.GetTradeData('*', {
				firstDate: new Date(firstDate),
				lastDate: new Date(lastDate)
			})
		).data as QueryTradeBodyWithTradeHead;
		const { count } = await db.GetTradeDataCount('*', {
			firstDate: new Date(firstDate),
			lastDate: new Date(lastDate)
		});

		return { tradeDataList: tradeDataList, count };
	},

	UpdateArtistVisible: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const visible = formData.get('visible') === 'true' ? true : false;
		const { data, error } = await supabase.from('artist').update({ visible }).eq('id', id).select();

		if (error) {
			console.error(error);
		}

		return { data };
	}
};
