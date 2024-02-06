import { fail } from '@sveltejs/kit';

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
			return fileToArray(file);
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
		for (let i = 0; i < needInfo.length; i++) {
			const index = titleMap.get(needInfo[i]) as number;
			const word = words[index] ? words[index] : '';
			result1D.push(word);
		}
		result2D.push(result1D);
	}
	return groupByIndex(result2D);
	return result2D;
};
function groupByIndex(array: string[][]) {
	const grouped: { [id: string]: string[][] } = {};
	array.forEach((subArray) => {
		const key = subArray[titleMap.get('收據號碼') as number];
		if (!grouped[key]) {
			grouped[key] = [];
		}
		grouped[key].push(subArray);
	});
	return grouped;
}
