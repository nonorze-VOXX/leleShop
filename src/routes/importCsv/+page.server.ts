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
	for (const key in groupByIndex) {
		const trySelect = await supabase.from('trade_head').select('*').eq('trade_id', key);
		const element = groupByIndex[key];
		if (trySelect.count == null) {
			const date = new Date(element[0][titleMap.get('日期') as number]);

			const err = await supabase.from('trade_head').insert({
				trade_date: date.toISOString(),
				trade_id: element[0][titleMap.get('收據號碼') as number],
				state: element[0][titleMap.get('狀態') as number]
			});
			for (let i = 0; i < element.length; i++) {
				const err = await supabase.from('trade_body').insert({
					artist_name: element[i][titleMap.get('類別') as number],
					item_name: element[i][titleMap.get('商品') as number],
					quantity: parseInt(element[i][titleMap.get('數量') as number]),
					trade_id: element[i][titleMap.get('收據號碼') as number],
					total_sales: parseFloat(element[i][titleMap.get('銷售總額') as number]),
					discount: parseFloat(element[i][titleMap.get('折扣') as number]),
					net_sales: parseFloat(element[i][titleMap.get('淨銷售額') as number])
				});
				// console.log('');
				// console.log(i);
				// console.log(err);
			}
		}

		// const element = groupByIndex[key];
		// const err = await supabase.from('trade_body').insert({});
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
