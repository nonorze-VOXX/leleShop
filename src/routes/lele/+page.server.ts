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
	const { data, error } = await supabase.from('artist').select();
	if (error) {
		console.log(error);
	}
	return { data };
};
