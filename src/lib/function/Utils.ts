export const FormatDate = (dateStr: string | null | undefined) => {
	if (dateStr === null || dateStr === undefined) return '';
	const date = new Date(dateStr);
	return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
		.toString()
		.replace(/-/g, '/');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
	arr.reduce(
		(groups, item) => {
			(groups[key(item)] ||= []).push(item);
			return groups;
		},
		{} as Record<K, T[]>
	);
