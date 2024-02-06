import { fail } from '@sveltejs/kit';
import { supabase } from '../db.js';

const titleMap = new Map<string, number>([
	['日期', 0],
	['收據號碼', 1],
	['收據類型', 2],
	['類別', 3],
	['SKU', 4],
	['商品', 5],
	['變體', 6],
	['修飾符已应用的', 7],
	['數量', 8],
	['銷售總額', 9],
	['折扣', 10],
	['淨銷售額', 11],
	['銷售成本', 12],
	['毛利潤', 13],
	['稅務', 14],
	['POS', 15],
	['商店', 16],
	['收銀員名稱', 17],
	['客戶名稱', 18],
	['客戶聯繫電話', 19],
	['註釋', 20],
	['狀態', 21]
]);

const needInfo = [
	'日期',
	'收據號碼',
	'類別',
	'商品',
	'數量',
	'銷售總額',
	'折扣',
	'淨銷售額',
	'狀態'
];

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
		for (let i = 0; i < files.length; i++) {
			const file = files[i] as File;
			const fileArr2D = await fileToArray(file);
			const groupByOrder = groupBy(
				fileArr2D.slice(1),
				(i) => i[titleMap.get('收據號碼') as number]
			);

			await storeToDB(groupByOrder);
		}
		return true;
	}
};

const storeToDB = async (groupByIndex: Record<string, string[][]>) => {
	console.log('storetodb');
	let tradeList = [];
	const artistIndex = titleMap.get('類別') as number;
	const itemNameIndex = titleMap.get('商品') as number;
	const quantityIndex = titleMap.get('數量') as number;
	const tradeIdIndex = titleMap.get('收據號碼') as number;
	const totalIndex = titleMap.get('銷售總額') as number;
	const discountIndex = titleMap.get('折扣') as number;
	const netIndex = titleMap.get('淨銷售額') as number;
	for (const key in groupByIndex) {
		console.log(key);
		if (key === undefined || key === 'undefined') continue;
		const trySelect = await supabase.from('trade_head').select('*').eq('trade_id', key);
		const element = groupByIndex[key];

		if (trySelect.data?.length !== 0) continue;
		const date = new Date(element[0][titleMap.get('日期') as number]);

		const err = await supabase.from('trade_head').insert({
			trade_date: date.toISOString(),
			trade_id: element[0][titleMap.get('收據號碼') as number],
			state: element[0][titleMap.get('狀態') as number]
		});
		for (let i = 0; i < element.length; i++) {
			console.log('add' + i + 'to tradelist');
			tradeList.push({
				artist_name: element[i][artistIndex],
				item_name: element[i][itemNameIndex],
				quantity: parseInt(element[i][quantityIndex]),
				trade_id: element[i][tradeIdIndex],
				total_sales: parseFloat(element[i][totalIndex]),
				discount: parseFloat(element[i][discountIndex]),
				net_sales: parseFloat(element[i][netIndex])
			});
		}
		if (tradeList.length > 100) {
			console.log('store100');
			const err = await supabase.from('trade_body').insert(tradeList);
			console.log(err);
			tradeList = [];
		}

		// const element = groupByIndex[key];
		// const err = await supabase.from('trade_body').insert({});
	}
	console.log('start store');
	if (tradeList.length !== 0) {
		const err = await supabase.from('trade_body').insert(tradeList);
		console.log(err);
	}
	console.log('end store');
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
			// const index = titleMap.get(needInfo[i]) as number;
			const word = words[ii] ? words[ii] : '';
			result1D.push(word);
		}
		// for (let i = 0; i < needInfo.length; i++) {
		// 	const index = titleMap.get(needInfo[i]) as number;
		// 	const word = words[index] ? words[index] : '';
		// 	result1D.push(word);
		// }
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
