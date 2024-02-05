import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		if (
			!(formData.fileToUpload as File).name ||
			(formData.fileToUpload as File).name === 'undefined'
		) {
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}

		const { fileToUpload } = formData as { fileToUpload: File };
		const text = await fileToUpload.text();
		const lines = text.split('\n');
		//                     A  B  D  F  I  J   K   L
		const needIndexList = [0, 1, 3, 5, 8, 9, 10, 11];
		const result: string[][] = [];
		lines.forEach((line) => {
			const words = line.split(',');
			const datas: string[] = [];
			needIndexList.forEach((index) => {
				let word: string = words[index];
				if (word === undefined || word === '' || word === 'undefined' || word === 'NaN') {
					word = '';
				}
				if (index == 8) {
					word = parseInt(word).toString();
				}
				datas.push(word);
			});
			result.push(datas);
		});

		return result;
	}
};
