import db, { type PaymentStatusInsert } from '$lib/db';

export async function PreInsertPaymentStatus(month: string) {
	const artistData = (await db.GetArtistDataList({ ordered: true, ascending: true }))?.data ?? [];

	const { data, error } = await db.GetPaymentStatus({ season: month });
	if (error) {
		console.error(error);
		return { newData: [], paymentData: [], error: 'get payment status fail' };
	}
	const noPaymentList: PaymentStatusInsert[] = [];
	if (artistData?.length !== data?.length) {
		artistData.forEach((element) => {
			if (element.id !== data?.find((e) => e.artist_id === element.id)?.artist_id) {
				noPaymentList.push({ artist_id: element.id, season: month, process_state: 'todo' });
			}
		});
	}
	if (noPaymentList.length === 0) {
		return { error: null, newData: [], paymentData: data };
	}
	const result = await db.InsertPaymentStatus(noPaymentList);
	if (result.error) {
		return { error: result.error, newData: [], paymentData: data };
	}
	const newData = result.data ?? [];
	return { error: null, newData: newData, paymentData: data };
}
