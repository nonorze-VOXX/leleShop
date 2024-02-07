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

export default {
	trade: {
		async write(data: Database['public']['Tables']['trade']['Insert']) {
			const err = await supabase.from('trade').insert(data);
			if (err !== null) {
				console.log(err);
			}
		}
	}
};
