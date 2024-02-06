import { fail } from '@sveltejs/kit';

export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const files = formData.getAll('fileToUpload');

		if (files.length === 0) {
			console.log('fail');
			return fail(400, {
				error: true,
				message: 'You must provide a file to upload'
			});
		}
		//                     A  B  D  F  I  J   K   L
		const needIndexList = [0, 1, 3, 5, 8, 9, 10, 11];
		let result: string[][] = [];
		result = await filesToArray(files, needIndexList);

		return result;
	}
};
async function filesToArray(files: FormDataEntryValue[], needIndexList: number[]) {
	let result: string[][] = [];
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const datas = await fileToArray(file as File, needIndexList);
		for (let i = 0; i < datas.length; i++) {
			result.push(datas[i]);
		}
	}
	return result;
}

async function fileToArray(file: File, needIndexList: number[]) {
	const fileToUpload = file;
	const text = await fileToUpload.text();
	const lines = text.split('\n');

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
