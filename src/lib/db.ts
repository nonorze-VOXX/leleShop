import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';
import { type Database } from './db.types';

export const supabase = createClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

// const userStore = writable();

// supabase.auth.getSession().then(({ data }) => {
// 	userStore.set(data.session?.user);
// });

// supabase.auth.onAuthStateChange((event, session) => {
// 	if (event == 'SIGNED_IN' && session) {
// 		userStore.set(session.user);
// 	} else if (event == 'SIGNED_OUT') {
// 		userStore.set(null);
// 	}
// });

export type TradeHead = Database['public']['Tables']['trade_head']['Insert'];
export type TradeBody = Database['public']['Tables']['trade_body']['Insert'];
export type Artist = Database['public']['Tables']['artist']['Insert'];
export default {
	async SaveArtistName(artist: Artist[]) {
		const { error, data } = await supabase.from('artist').insert(artist).select();
		if (error !== null) {
			console.log(error);
		}
		return { error, data };
	},
	async SaveTradeBody(data: TradeBody[]) {
		const { error } = await supabase.from('trade_body').insert(data);
		if (error !== null) {
			console.log(error);
		}
		return { error };
	},
	async SaveTradeHead(data: TradeHead[]) {
		const { error } = await supabase.from('trade_head').insert(data);
		if (error !== null) {
			console.log(error);
		}
		return { error };
	}
};
