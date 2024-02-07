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
			const err = await supabase.from('trade').insert(data);
			if (err !== null) {
				console.log(err);
			}
		}
	}
};
