import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/db';
import db from '$lib/db';
import { type TradeBody, type TradeHead, type Artist } from '$lib/db';

let dataHeader: string[] = [];
const findIndex = (target: string) => {
	return dataHeader.findLastIndex((e) => e == target);
};

const artistIndex = () => {
	return findIndex('類別');
};
const itemNameIndex = () => {
	return findIndex('商品');
};
const quantityIndex = () => {
	return findIndex('數量');
};
const tradeIdIndex = () => {
	return findIndex('收據號碼');
};
const totalIndex = () => {
	return findIndex('銷售總額');
};
const discountIndex = () => {
	return findIndex('折扣');
};
const netIndex = () => {
	return findIndex('淨銷售額');
};
const stateIndex = () => {
	return findIndex('狀態');
};
const dateIndex = () => {
	return findIndex('日期');
};

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const files = formData.getAll('fileToUpload');
		if (files.length === 0) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		const { error } = await supabase.auth.signInWithPassword({
			email: email,
			password: password
		});
		if (error !== null) {
			return fail(400, {
				error: true,
				message: 'login failed'
			});
		}

		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			dataHeader = fileArr2D[0];

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex()]);

			await storeToDB(groupByOrder);
		}
		supabase.auth.signOut();
		return true;
	}
};

const storeToDB = async (groupByIndex: Record<string, string[][]>) => {
	console.log('start store');
	const tradeBodyList: TradeBody[] = [];
	const tradeHeadList: TradeHead[] = [];
	const { data, error } = await supabase.from('trade_head').select('trade_id');
	if (error != null) {
		console.log('fetch head fail');
	}
	const tradeQueryResult = data as unknown as { trade_id: string }[];
	const storedIdList = tradeQueryResult.map((i) => i.trade_id);

	const artistResult = await supabase.from('artist').select();
	if (artistResult.error != null) {
		console.log('fetch artist name fail');
	}
	let artistNameInDb = artistResult.data?.map((i) => i.artist_name);
	let artistList = artistResult.data as unknown as Artist[];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		if (storedIdList.includes(key)) {
			console.log('DB had it');
			continue;
		}

		const element = groupByIndex[key];
		const date = new Date(element[0][dateIndex()]);
		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex()],
			state: element[0][stateIndex()]
		});

		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex()];
			if (!artistNameInDb?.includes(artist_name)) {
				const { error, data } = await db.SaveArtistName([{ artist_name }]);
				artistList.push(data as Artist);
				artistNameInDb?.push(artist_name);
				if (error !== null) console.log(error);
			}
			const artist_id = artistList.find((artist) => artist.artist_name == artist_name)?.id;

			tradeBodyList.push({
				item_name: element[i][itemNameIndex()],
				quantity: parseInt(element[i][quantityIndex()]),
				trade_id: element[i][tradeIdIndex()],
				total_sales: parseFloat(element[i][totalIndex()]),
				discount: parseFloat(element[i][discountIndex()]),
				net_sales: parseFloat(element[i][netIndex()]),
				artist_id: artist_id
			});
		}
	}
	if (tradeBodyList.length !== 0) {
		await savePartToDb(tradeBodyList, tradeHeadList);
	}
	console.log('end store');
};
const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	const { error } = await db.SaveTradeHead(tradeHeadList);
	if (error === null) {
		const { error } = await db.SaveTradeBody(tradeBodyList);
		if (error === null) {
			return { error: null };
		}
	}
	return { error };
};

const fileToArray = async (file: File) => {
	const result2D: string[][] = [];
	const text = await file.text();
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].split('\r')[0];
		const words = line.split(',');
		const result1D: string[] = [];
		for (let ii = 0; ii < words.length; ii++) {
			const word = words[ii] ? words[ii] : '';
			result1D.push(word);
		}
		result2D.push(result1D);
	}
	return result2D;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
	arr.reduce(
		(groups, item) => {
			(groups[key(item)] ||= []).push(item);
			return groups;
		},
		{} as Record<K, T[]>
	);
