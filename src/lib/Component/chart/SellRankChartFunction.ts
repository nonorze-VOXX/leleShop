import type { ArtistWithTradeRow } from '$lib/db';

// Aggregate data by date
export function aggregateDataByDate(trades: ArtistWithTradeRow[]) {
	const dateMap = new Map<string, { net_sales: number; total_sales: number; quantity: number }>();

	trades.forEach((trade) => {
		if (!trade.trade_date) return;

		const date = new Date(trade.trade_date).toLocaleDateString('en-CA'); // YYYY-MM-DD format

		const existing = dateMap.get(date) || { net_sales: 0, total_sales: 0, quantity: 0 };
		existing.net_sales += trade.net_sales ?? 0;
		existing.total_sales += trade.total_sales ?? 0;
		existing.quantity += trade.quantity ?? 0;

		dateMap.set(date, existing);
	});

	// Sort by date
	return Array.from(dateMap.entries())
		.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
		.map(([date, data]) => ({ date, ...data }));
}

export function aggregateDataByItem(trades: ArtistWithTradeRow[]) {
	const itemMap = new Map<string, { net_sales: number }>();

	trades.forEach((trade) => {
		const itemName = trade.item_name || 'Unknown Item';
		const existing = itemMap.get(itemName) || { net_sales: 0 };
		existing.net_sales += trade.net_sales ?? 0;
		itemMap.set(itemName, existing);
	});

	// Convert to array and sort by net_sales descending
	return Array.from(itemMap.entries())
		.map(([itemName, data]) => ({ itemName, ...data }))
		.sort((a, b) => b.net_sales - a.net_sales);
}
