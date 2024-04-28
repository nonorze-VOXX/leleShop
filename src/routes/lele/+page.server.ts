import { supabase, type PaymentStatusUpdate } from '$lib/db';
import db from '$lib/db';
import { fail } from '@sveltejs/kit';
import { randomNumber } from '$lib/function/Utils';

export const load = async () => {
	const artistData = (await db.GetArtistDataList())?.data;

	return { artistData };
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
