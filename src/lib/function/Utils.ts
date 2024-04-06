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
export function GetNowSeason() {
	return (
		new Date().getFullYear().toString() +
		'-' +
		FormatNumberToTwoDigi((Math.floor(new Date().getMonth() / 3) * 3).toString())
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
