export const FormatDate = (dateStr: string | null | undefined) => {
	if (dateStr === null || dateStr === undefined) return '';
	const date = new Date(dateStr);
	return (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
		.toString()
		.replace(/-/g, '/');
};
