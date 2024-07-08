import type {
	Artist,
	ArtistRow,
	ShopRow,
	TradeBody,
	TradeBodyRow,
	TradeHead,
	TradeHeadRow
} from '$lib/db';
import db, { supabase } from '$lib/db';
import { groupBy } from '$lib/function/Utils';

export const findIndex = (dataHeader: string[], target: string) => {
	return dataHeader.findLastIndex((e) => e === target);
};

export const artistIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '類別');
};
export const itemNameIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '商品');
};
export const quantityIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '數量');
};
export const tradeIdIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '收據號碼');
};
export const totalIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '銷售總額');
};
export const discountIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '折扣');
};
export const netIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '淨銷售額');
};
export const stateIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '狀態');
};
export const dateIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '日期');
};
export const GetShopIndex = (dataHeader: string[]) => {
	return findIndex(dataHeader, '商店');
};

export const GetNewArtistList = (
	artistList: ArtistRow[],
	groupByIndex: Record<string, string[][]>,
	dataHeader: string[]
) => {
	const newArtistList: Artist[] = [];
	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;
		const element = groupByIndex[key];
		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex(dataHeader)];
			if (
				artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1 &&
				newArtistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1
			) {
				newArtistList.push({ artist_name });
			}
		}
	}
	return newArtistList;
};

export const GetNewShopNameList = async (
	FilteredBodyHead: { dataHeader: string[]; body: string[][] }[]
) => {
	const shopSet = new Set<ShopRow>();
	const { data } = await db.GetShopList();
	data?.forEach((shop: ShopRow) => {
		shopSet.add(shop);
	});

	const importShopNameList = new Set<string>();
	for (const { dataHeader, body } of FilteredBodyHead) {
		body.forEach((row) => {
			const shopName = row[GetShopIndex(dataHeader)];
			const shopWord = shopName.split(' ');
			if (shopWord.length === 2 && shopWord[0] === 'The創') {
				importShopNameList.add(shopWord[1]);
			} else {
				importShopNameList.add(shopName);
			}
		});
	}
	const newShopList: string[] = [];
	importShopNameList.forEach((element) => {
		let find = false;
		for (const shop of shopSet) {
			if (shop.shop_name === element) {
				find = true;
				break;
			}
		}
		if (!find) {
			newShopList.push(element);
		}
	});
	return newShopList;
};
const CheckDataHeader = (dataHeader: string[]) => {
	const shouldDataHeader = [
		'收據號碼',
		'類別',
		'商品',
		'數量',
		'銷售總額',
		'折扣',
		'淨銷售額',
		// '狀態',
		'日期',
		'商店'
	];
	const notFoundColumn: string[] = [];
	shouldDataHeader.forEach((e) => {
		if (findIndex(dataHeader, e) === -1) {
			notFoundColumn.push(e);
		}
	});
	if (notFoundColumn.length > 0) {
		return {
			error: notFoundColumn.join(',') + ', not found'
		};
	}
	return { error: null };
};
export const timeZoneOffsetToHHMM = (timeZoneOffset: number) => {
	const sign = timeZoneOffset < 0 ? '+' : '-';
	const abs = Math.abs(timeZoneOffset);
	const hour = Math.floor(abs / 60);
	const minute = abs % 60;
	return sign + (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
};

export const GetInDbTradeIdList = async (tradeIdList: string[]) => {
	const { error, data } = await supabase
		.from('trade_head')
		.select('trade_id')
		.in('trade_id', tradeIdList);
	if (error !== null) {
		console.log(error);
	}
	console.log(tradeIdList);
	console.log('db say:');
	console.log(data);
	return (data ?? []).map((i) => i.trade_id);
};

export const GetStoreData = (
	artistList: ArtistRow[],
	groupByIndex: Record<string, string[][]>,
	timezoneOffset: string,
	dataHeader: string[],
	shop_id: number
) => {
	const { error } = CheckDataHeader(dataHeader);
	if (error) {
		return {
			tradeBodyList: [],
			tradeHeadList: [],
			susTradeIdList: [],
			error
		};
	}
	const tradeBodyList: TradeBody[] = [];
	const tradeHeadList: TradeHead[] = [];
	const susTradeIdList: string[] = [];

	for (const key in groupByIndex) {
		if (key === undefined || key === 'undefined') continue;

		const element = groupByIndex[key];
		const date = GetDateWithTimeZone(element[0][dateIndex(dataHeader)], timezoneOffset);
		let state = '關閉';
		if (stateIndex(dataHeader) !== -1) {
			state = element[0][stateIndex(dataHeader)];
		}
		if (state !== '關閉') {
			susTradeIdList.push(key);
			continue;
		}
		tradeHeadList.push({
			trade_date: date.toISOString(),
			trade_id: element[0][tradeIdIndex(dataHeader)],
			shop_id
		});

		for (let i = 0; i < element.length; i++) {
			const artist_name = element[i][artistIndex(dataHeader)];
			if (artistList.findLastIndex((artist) => artist.artist_name === artist_name) === -1) {
				console.error('artist not found', artist_name);
			}
			const artist_id = artistList.find((artist) => artist.artist_name === artist_name)?.id;
			if (artist_id === undefined)
				return {
					error: 'artist not found',
					tradeBodyList: [],
					tradeHeadList: [],
					susTradeIdList: []
				};

			tradeBodyList.push({
				item_name: element[i][itemNameIndex(dataHeader)],
				quantity: parseInt(element[i][quantityIndex(dataHeader)]),
				trade_id: element[i][tradeIdIndex(dataHeader)],
				total_sales: parseFloat(element[i][totalIndex(dataHeader)]),
				discount: parseFloat(element[i][discountIndex(dataHeader)]),
				net_sales: parseFloat(element[i][netIndex(dataHeader)]),
				artist_id: artist_id
			});
		}
	}
	return { tradeBodyList, tradeHeadList, susTradeIdList, error: null };
};

export const fileToArray = async (file: File) => {
	const result2D: string[][] = [];
	const text = await file.text();
	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].split('\r')[0];
		const words = line.split(',');
		const result1D: string[] = [];
		if (words.length === 1 && words[0] === '') {
			continue;
		}
		for (let ii = 0; ii < words.length; ii++) {
			const word = words[ii] ? words[ii] : '';
			result1D.push(word);
		}
		if (result1D.length > 0) {
			result2D.push(result1D);
		}
	}
	return result2D;
};

// dateStr: YYYY-MM-DD HH:MM
export const GetDateWithTimeZone = (dateStr: string, timezoneOffset: string) => {
	if (dateStr.split('+').length == 2) {
		const date = new Date(dateStr);
		return date;
	}
	const date = new Date(dateStr + timezoneOffset);
	return date;
};
export const GetDateRange = async (
	groupByOrder: Record<string, string[][]>,
	dataHeader: string[],
	timezoneOffset: string
) => {
	let minDate: Date | null = null;
	let maxDate: Date | null = null;
	for (const key in groupByOrder) {
		if (key === undefined || key === 'undefined') continue;
		const tradeDate = groupByOrder[key][0][dateIndex(dataHeader)];
		const date = GetDateWithTimeZone(tradeDate, timezoneOffset);
		if (minDate === null) {
			minDate = date;
		}
		if (maxDate === null) {
			maxDate = date;
		}
		if (date < minDate) {
			minDate = date;
		}
		if (date > maxDate) {
			maxDate = date;
		}
	}
	return { minDate, maxDate };
};
const SaveTradeHead = async (head: TradeHead[]) => {
	const { data, error } = await supabase.from('trade_head').insert(head).select();
	if (error !== null) {
		console.log(error);
	}
	return { data, error };
};
const SaveTradeBody = async (body: TradeBody[]) => {
	const { data, error } = await supabase.from('trade_body').insert(body).select();
	if (error !== null) {
		console.log(error);
	}
	return { data, error };
};
export const savePartToDb = async (tradeBodyList: TradeBody[], tradeHeadList: TradeHead[]) => {
	let newTradeHead: TradeHeadRow[] = [];
	let newTradeBody: TradeBodyRow[] = [];
	{
		const { error, data } = await SaveTradeHead(tradeHeadList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeHead = data ?? [];
	}
	{
		const { error, data } = await SaveTradeBody(tradeBodyList);
		if (error !== null) {
			return { error, newTradeHead, newTradeBody };
		}
		newTradeBody = data ?? [];
	}
	return { error: null, newTradeHead, newTradeBody };
};
export async function HeaderAndBodyToGroupByOrderDataHeader(
	notNullFileList: {
		body: string[][];
		dataHeader: string[];
	}[]
) {
	return notNullFileList.map(({ body, dataHeader }) => {
		return { groupByOrder: groupBy(body, (i) => i[tradeIdIndex(dataHeader)]), dataHeader };
	});
}
export async function FileListToHeadAndBody(files: FormDataEntryValue[]) {
	const fileList = await Promise.all(
		files.map(async (tmpFile) => {
			const file = tmpFile as File;
			const fileArr2D = await fileToArray(file);
			let dataHeader: string[] = [];
			dataHeader = fileArr2D[0];
			if (!dataHeader) {
				return null;
			}
			return { body: fileArr2D.slice(1), dataHeader };
		})
	);
	var notNullFileList: {
		body: string[][];
		dataHeader: string[];
	}[] = [];
	fileList.forEach((element) => {
		if (element !== null) {
			notNullFileList.push(element);
		}
	});
	return notNullFileList;
}
