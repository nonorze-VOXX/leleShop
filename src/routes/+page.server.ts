import { supabase } from './db';

export async function load() {
	const { data } = await supabase.from('countries').select();
	// const { error } = await supabase.from('countries').insert({ id: 4, name: 'Denmark' });
	// console.log(error);
	return {
		countries: data ?? []
	};
}
