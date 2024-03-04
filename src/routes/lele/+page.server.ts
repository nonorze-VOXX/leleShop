import { supabase, type QueryTradeBodyWithTradeHead } from '$lib/db';
import db from '$lib/db';

const randomNumber = (length: number) => {
	let number = '';
	for (let i = 0; i < length; i++) {
		number += Math.floor(Math.random() * 10).toString();
	}
	return number;
};
// const randomString = (length: number) => {
// 	const array = new Uint32Array(length);
// 	crypto.getRandomValues(array);
// 	return btoa(array.join('')) //
// 		.replace(/\+/g, '-')
// 		.replace(/\//g, '_')
// 		.replace(/=+$/, '');
// };
const ArtistData = async () => {
	const { data, error } = await supabase.from('artist').select().order('id', { ascending: true });
	if (error) {
		console.log(error);
	}
	return data;
};

export const load = async () => {
	const artistData = await ArtistData();
	// const tradeDataList: QueryTradeBodyWithTradeHead = (await db.GetTradeData(
	// 	'*'
	// )) as QueryTradeBodyWithTradeHead;

	return { data: artistData };
};

export const actions = {
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

		const tradeDataList: QueryTradeBodyWithTradeHead = (await db.GetTradeData('*', {
			firstDate: new Date(firstDate),
			lastDate: new Date(lastDate)
		})) as QueryTradeBodyWithTradeHead;
		const count = await db.GetTradeDataCount('*', {
			firstDate: new Date(firstDate),
			lastDate: new Date(lastDate)
		});

		return { tradeDataList: tradeDataList, count };
	}
};
