import { supabase } from '$lib/db';

const randomString = (length: number) => {
	const array = new Uint32Array(length);
	crypto.getRandomValues(array);
	return btoa(array.join('')) //
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
};

export const load = async () => {
	const { data, error } = await supabase.from('artist').select().order('id', { ascending: true });
	if (error) {
		console.log(error);
	}
	return { data };
};

export const actions = {
	UpdateReportKey: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const random = randomString(5);
		const { data, error } = await supabase
			.from('artist')
			.update({ report_key: random })
			.eq('id', id)
			.select();
		if (error) {
			console.log(error);
		}

		const key = data?.at(0)?.report_key;
		return { key };
	}
};
