import { fail } from '@sveltejs/kit';
import db from '$lib/db';
import { type TradeBody, type TradeHead } from '$lib/db';

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
		const timezoneOffset = formData.get('dateOffset') as string;

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
			dataHeader = fileArr2D[0];

			const groupByOrder = groupBy(fileArr2D.slice(1), (i) => i[tradeIdIndex()]);

			await storeToDB(groupByOrder, timezoneOffset);
		}
		return true;
	}
};

const storeToDB = async (groupByIndex: Record<string, string[][]>, timezoneOffset: string) => {
	console.log('start store');

	const tradeBodyList: TradeBody[] = [];
	const tradeHeadList: TradeHead[] = [];
	const tradeIdList = (await db.GetTradeIdList()).data ?? [];

	const artistList = (await db.GetArtistName()).data ?? [];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		if (tradeIdList.findLastIndex((i) => i.trade_id === key) !== -1) {
			console.log('DB had it');
			continue;
		}

		const element = groupByIndex[key];
		const date = new Date(element[0][dateIndex()].replace(/ /g, 'T') + timezoneOffset);

		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex()],
			state: element[0][stateIndex()]
		});

		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex()];
			if (artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1) {
				const { data } = await db.SaveArtistName([{ artist_name }]);
				if (data !== null) {
					artistList.push(data[0]);
				}
			}
			const artist_id = artistList.find((artist) => artist.artist_name === artist_name)?.id;

			tradeBodyList.push({
				item_name: element[i][itemNameIndex()],
				quantity: parseInt(element[i][quantityIndex()]),
				trade_id: element[i][tradeIdIndex()],
				total_sales: parseFloat(element[i][totalIndex()]),
				discount: parseFloat(element[i][discountIndex()]),
				net_sales: parseFloat(element[i][netIndex()]),
				artist_id: parseInt(artist_id as unknown as string)
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

export function add(...args: number[]) {
	return args.reduce((a, b) => a + b, 0);
}

// in-source test suites
if (import.meta.vitest) {
	const { it, expect } = import.meta.vitest;
	it('add', () => {
		expect(add()).toBe(0);
		expect(add(1)).toBe(1);
		expect(add(1, 2, 3)).toBe(6);
	});
}
