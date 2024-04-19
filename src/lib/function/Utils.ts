import type { PaymentStatusRow } from '$lib/db';

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
export function GetSeason(offset: number = 0) {
	const date = new Date();
	const d = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3 + offset, 1);
	return d.getFullYear().toString() + '-' + FormatNumberToTwoDigi(d.getMonth().toString());
}
export function GetYearMonth(offset: number = 0) {
	const date = new Date();
	const d = new Date(date.getFullYear(), date.getMonth() + offset, 1);
	return (
		d.getFullYear().toString() + '-' + FormatNumberToTwoDigi(Math.floor(d.getMonth()).toString())
	);
}

export function FormatNumberToTwoDigi(month: string) {
	return month.length === 1 ? '0' + month : month;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
	arr.reduce(
		(groups, item) => {
			if (key(item) === undefined) {
				return groups;
			}
			(groups[key(item)] ||= []).push(item);
			return groups;
		},
		{} as Record<K, T[]>
	);
export const payment_compare_year_month = (a: PaymentStatusRow, b: PaymentStatusRow) => {
	if (a.year_month < b.year_month) return -1;
	else if (a.year_month > b.year_month) return 1;
	return 0;
};
