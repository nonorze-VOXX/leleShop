import db from '$lib/db';

export const load = async () => {
	const { data, error } = await db.GetArtistDataWithPaymentStatus();
	return { data, error };
};
