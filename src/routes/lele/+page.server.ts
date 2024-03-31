import { supabase, type QueryTradeBodyWithTradeHead, type PaymentStatusUpdate } from '$lib/db';
import db from '$lib/db';
import { fail } from '@sveltejs/kit';

const randomNumber = (length: number) => {
	let number = '';
	for (let i = 0; i < length; i++) {
		number += Math.floor(Math.random() * 10).toString();
	}
	return number;
};

export const load = async () => {
	const artistData = (await db.GetArtistDataList({ ordered: true, ascending: true }))?.data;
	const date = new Date();
	const season =
		new Date().getFullYear().toString() +
		'-' +
		(Math.floor(new Date().getMonth() / 3) * 3 + 1).toString();
	await db.PreInsertPaymentStatus(season);
	const d = new Date(date.getFullYear(), date.getMonth() + 3, 1);
	const next_season =
		d.getFullYear().toString() + '-' + (Math.floor(d.getMonth() / 3) * 3 + 1).toString();
	await db.PreInsertPaymentStatus(next_season);
	return { artistData };
};

export const actions = {
	UpdatePaymentStatus: async ({ request }) => {
		const formData = await request.formData();
		const season = formData.get('season') as string; // YYYY-MM
		const artist_id = parseInt(formData.get('artist_id') as string);
		const process_state = formData.get('process_state') as string;
		if (process_state !== 'todo' && process_state !== 'done' && process_state !== 'doing')
			return fail(400, { message: 'process_state is invalid' });

		const update: PaymentStatusUpdate = { artist_id, season, process_state };

		const { error } = await db.ChangePaymentStatus(update);
		if (error) {
			console.error(error);
			return fail(400, { error });
		}
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
