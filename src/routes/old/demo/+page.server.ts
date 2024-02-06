import { fail } from '@sveltejs/kit';
import db from '../db.js';

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
		const map = new Map<string, number>([
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
		//                     A  B  D  F  I  J   K   L   V
		const needIndexList: number[] = [];
		needInfo.forEach((title) => {
			const index = map.get(title);
			index !== undefined ? needIndexList.push(index) : null;
		});
		let result: string[][] = [];
		result = await filesToArray(files, needIndexList);
		// console.log(result);

		const data: {
			trade_date: string;
			trade_id: string;
			artist_name: string;
			item_name: string;
			quantity: number;
			total_sales: number;
			discount: number;
			net_sales: number;
			state: string;
		}[] = [];
		const resultBody = result.slice(1);
		resultBody.forEach((element) => {
			data.push({
				trade_date: element[needIndexList.indexOf(map.get('日期'))],
				trade_id: element[needIndexList.indexOf(map.get('收據號碼'))],
				artist_name: element[needIndexList.indexOf(map.get('類別'))],
				item_name: element[needIndexList.indexOf(map.get('商品'))],
				quantity: parseInt(element[needIndexList.indexOf(map.get('數量'))]),
				total_sales: parseInt(element[needIndexList.indexOf(map.get('銷售總額'))]),
				discount: parseInt(element[needIndexList.indexOf(map.get('折扣'))]),
				net_sales: parseInt(element[needIndexList.indexOf(map.get('淨銷售額'))]),
				state: element[needIndexList.indexOf(map.get('狀態'))]
			});
		});
		db.trade.write(data);

		return result;
	}
};
async function filesToArray(files: FormDataEntryValue[], needIndexList: number[]) {
	const result: string[][] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const datas = await fileToArray(file as File, needIndexList);
		for (let i = 0; i < datas.length; i++) {
			result.push(datas[i]);
		}
	}
	return result;
}

async function fileToArray(file: File, needIndexList: number[]) {
	const fileToUpload = file;
	const text = await fileToUpload.text();
	const lines = text.split('\n');

	const result: string[][] = [];
	lines.forEach((line) => {
		const words = line.split(',');
		const datas: string[] = [];

		for (let i = 0; i < needIndexList.length; i++) {
			let word: string = words[needIndexList[i]];
			if (word === undefined || word === '' || word === 'undefined' || word === 'NaN') {
				word = '';
				break;
			}
			if (needIndexList[i] === 8) {
				word = parseInt(word).toString();
			}
			if (needIndexList[i] === 21 && word === '取消') {
				break;
			}
			datas.push(word);
		}
		if (datas.length === needIndexList.length) {
			result.push(datas);
		}
	});
	return result;
}
