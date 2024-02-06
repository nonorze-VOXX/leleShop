import { createClient } from '@supabase/supabase-js';
import { writable } from 'svelte/store';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

const userStore = writable();

supabase.auth.getSession().then(({ data }) => {
	userStore.set(data.session?.user);
});

supabase.auth.onAuthStateChange((event, session) => {
	if (event == 'SIGNED_IN' && session) {
		userStore.set(session.user);
	} else if (event == 'SIGNED_OUT') {
		userStore.set(null);
	}
});

export default {
	trade: {
		async write(
			data: {
				trade_date: string;
				trade_id: string;
				artist_name: string;
				item_name: string;
				quantity: number;
				total_sales: number;
				discount: number;
				net_sales: number;
				state: string;
			}[]
		) {
			let r = await supabase.from('trade').insert({
				trade_date: '2009-07-15 08:00:00 -08:00',
				trade_id: 'test',
				artist_name: 'lele',
				item_name: 'tet',
				quantity: 0,
				total_sales: 0,
				discount: 0,
				net_sales: 0,
				state: ''
			});
			console.log(r);
		}
	}
};
