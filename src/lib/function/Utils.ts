export const FormatDate = (dateStr: string | null | undefined) => {
	if (dateStr === null || dateStr === undefined) return '';
	const date = new Date(dateStr);
	return (
		date.getFullYear() +
		'-' +
		FormatNumberToTwoDigi((date.getMonth() + 1).toString()) +
		'-' +
		FormatNumberToTwoDigi(date.getDate().toString())
	)
		.toString()
		.replace(/-/g, '/');
};

export function FormatNumberToTwoDigi(n: string) {
	return n.padStart(2, '0');
}

export const randomNumber = (length: number) => {
	let number = '';
	for (let i = 0; i < length; i++) {
		number += Math.floor(Math.random() * 10).toString();
	}
	return number;
};

export const add = (a: number | null, b: number | null) => (a ?? 0) + (b ?? 0);

export const ThisMonthFirstDate = (offset: number = 0) => {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth() + offset, 1);
};
export const NextMonthFirstDate = (offset: number = 0) => {
	const date = new Date();
	return new Date(date.getFullYear(), date.getMonth() + 1 + offset, 1);
};

export const GetFirstDayOfMonth = (date: Date) => {
	const firstDay: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
	return firstDay.toISOString().split('T')[0];
};
export const GetLastDayOfMonth = (date: Date) => {
	const firstDay: Date = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
	return firstDay.toISOString().split('T')[0];
};

// limit dateStr format to 'yyyy-mm-dd'
export const DateStringToDate = (dateStr: string) => {
	const date = new Date(dateStr);
	return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const GetAllMonth = () => {
	return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
};

export function DownloadData(data: string | Blob, name: string) {
	let blob: Blob;
	if (data instanceof Blob) {
		blob = data;
	} else {
		blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
	}
	const a = document.createElement('a');
	document.body.append(a);
	a.download = name;
	a.href = URL.createObjectURL(blob);
	a.click();
	a.remove();
}
