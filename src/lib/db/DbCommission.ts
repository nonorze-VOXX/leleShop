import { supabase } from '$lib/db';
import type { Database } from '$lib/db.types';

export type CommissionRow = Database['public']['Tables']['artist_commission']['Row'];
export type CommissionInsert = Database['public']['Tables']['artist_commission']['Insert'];
export type CommissionUpdate = Database['public']['Tables']['artist_commission']['Update'];
export type CommissionViewRow = Database['public']['Views']['default_commission_view']['Row'];
export default {};
