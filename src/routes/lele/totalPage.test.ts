import { describe, expect, it } from 'vitest';
import { GetTradeTotalDataEachOne } from './totalPage';
import db, { supabase, type TradeBody, type TradeHead } from '$lib/db';
import { PUBLIC_ADMIN_MAIL_FOR_TEST, PUBLIC_ADMIN_PASSWORD_FOR_TEST } from '$env/static/public';

type TradeBodyWithoutArtistId = Omit<TradeBody, 'artist_id'>;
type TradeBodyWithArtistName = TradeBodyWithoutArtistId & { artist_name: string };
describe('totalPage', () => {
	it.each([
		{
			tradeHeadList: [],
			tradeBodyWithoutArtistIdList: [],
			artistList: [],
			expectResult: []
		},
		{
			tradeHeadList: [{ trade_date: '2000-01-01 00:00:00', trade_id: '1' }],
			tradeBodyWithoutArtistIdList: [
				{
					trade_id: '1',
					quantity: 1,
					total_sales: 1,
					discount: 0,
					net_sales: 1,
					artist_name: 'artist_namr',
					item_name: 'item'
				}
			],
			artistList: [{ artist_name: 'artist_namr' }],
			expectResult: [{ discount_sum: 0, name: 'artist_namr', net_sales_sum: 1, total_sales_sum: 1 }]
		}
	])(
		'get trade total data each one',
		async ({
			tradeBodyWithoutArtistIdList,
			tradeHeadList,
			artistList,
			expectResult
		}: {
			tradeBodyWithoutArtistIdList: TradeBodyWithArtistName[];
			tradeHeadList: TradeHead[];
			artistList: { artist_name: string }[];
			expectResult: {
				discount_sum: number;
				name: string;
				net_sales_sum: number;
				total_sales_sum: number;
			}[];
		}) => {
			await supabase.auth.signInWithPassword({
				email: PUBLIC_ADMIN_MAIL_FOR_TEST,
				password: PUBLIC_ADMIN_PASSWORD_FOR_TEST
			});
			let artist_id = -1;
			{
				const { error } = await supabase.from('trade_body').delete().eq('trade_id', '1');
				expect(error).equal(null);
			}
			{
				const { error } = await supabase.from('trade_head').delete().eq('trade_id', '1');
				expect(error).equal(null);
			}
			{
				const { error } = await supabase
					.from('artist')
					.delete()
					.in(
						'artist_name',
						artistList.map((a) => a.artist_name)
					);
				expect(error).equal(null);
			}
			{
				const { error, data } = await db.SaveArtistName(artistList);
				expect(error).equal(null);
				expect(data?.length).equal(artistList.length);
				const tradeBodyList: TradeBody[] = tradeBodyWithoutArtistIdList.map((tradeBody) => {
					const index = data?.findIndex((a) => a.artist_name === tradeBody.artist_name) ?? -1;
					if (data !== null) {
						artist_id = data[index].id;
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { artist_name: _, ...other } = tradeBody;
						return { ...other, artist_id };
					}

					return { ...tradeBody, artist_id: -1 };
				});

				{
					const { error } = await db.SaveTradeHead(tradeHeadList);
					expect(error).equal(null);
				}
				{
					const { error } = await db.SaveTradeBody(tradeBodyList);
					expect(error).equal(null);
				}
			}

			const firstDate = new Date('2000-01-01 00:00:00');
			const lastDate = new Date('2000-02-01 00:00:00');
			const { result, error } = await GetTradeTotalDataEachOne(firstDate, lastDate);
			expect(error).equal(null);

			const processedExpectResult = expectResult.map((e) => {
				return { ...e, id: artist_id };
			});
			expect(result).toStrictEqual(processedExpectResult);

			{
				const { error } = await supabase.from('trade_body').delete().eq('trade_id', '1');
				expect(error).equal(null);
			}
			{
				const { error } = await supabase.from('trade_head').delete().eq('trade_id', '1');
				expect(error).equal(null);
			}
			await supabase.auth.signOut();
		}
	);
});
