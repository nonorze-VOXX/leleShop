import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/db.js';
import type { Database } from '$lib/db.types.js';

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

const tradeQuery = await supabase.from('trade_head').select('trade_id');
const tradeQueryResult = tradeQuery.data as unknown as { trade_id: string }[];
const storedIdList = tradeQueryResult.map((i) => i.trade_id);
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
type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
type TradeBody = Database['public']['Tables']['trade_body']['Insert'];

const storeToDB = async (groupByIndex: Record<string, string[][]>) => {
	console.log('start store');
	let tradeBodyList: TradeBody[] = [];
	let tradeHeadList: TradeHead[] = [];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		if (storedIdList.includes(key)) continue;
		const element = groupByIndex[key];
		const date = new Date(element[0][dateIndex()]);
		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex()],
			state: element[0][stateIndex()]
		});

		for (let i = 0; i < element.length; i++) {
			tradeBodyList.push({
				artist_name: element[i][artistIndex()],
				item_name: element[i][itemNameIndex()],
				quantity: parseInt(element[i][quantityIndex()]),
				trade_id: element[i][tradeIdIndex()],
				total_sales: parseFloat(element[i][totalIndex()]),
				discount: parseFloat(element[i][discountIndex()]),
				net_sales: parseFloat(element[i][netIndex()])
			});
		}
		if (tradeBodyList.length > 100) {
			await savePartToDb(tradeBodyList, tradeHeadList);
			tradeBodyList = [];
			storedIdList.concat(tradeHeadList.map((i) => i.trade_id));
			tradeHeadList = [];
		}
	}
	if (tradeBodyList.length !== 0) {
		await savePartToDb(tradeBodyList, tradeHeadList);
	}
	console.log('end store');
};
const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	const { error } = await supabase.from('trade_head').insert(tradeHeadList);

	if (error !== null) {
		console.log(error);
	} else {
		const error = await supabase.from('trade_body').insert(tradeBodyList);
		if (error !== null) {
			console.log(error);
		}
	}
};

const fileToArray = async (file: File) => {
	const result2D: string[][] = [];
	const text = await file.text();
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const words = line.split(',');
		const result1D: string[] = [];
		for (let ii = 0; ii < line.length; ii++) {
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
