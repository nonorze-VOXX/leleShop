import { describe, expect, it } from 'vitest';
import { GetTradeTotalDataEachOne } from './totalPage';
import db, { supabase, type TradeBody, type TradeHead } from '$lib/db';
import { PUBLIC_ADMIN_MAIL_FOR_TEST, PUBLIC_ADMIN_PASSWORD_FOR_TEST } from '$env/static/public';

type TradeBodyWithoutArtistId = Omit<TradeBody, 'artist_id'>;
type TradeBodyWithArtistName = TradeBodyWithoutArtistId & { artist_name: string };
