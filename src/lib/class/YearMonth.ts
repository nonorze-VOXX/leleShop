export class YearMonth {
	year: number;
	month: number;

	constructor(yearMonth: string) {
		const [year, month] = yearMonth.split('-').map(Number);
		this.year = year;
		this.month = month;
	}

	getFirstTimePoint(): Date {
		return new Date(this.year, this.month - 1, 1);
	}

	getLastTimePoint(): Date {
		return new Date(this.year, this.month, 1);
	}

	toString(): string {
		return `${this.year}-${String(this.month).padStart(2, '0')}`;
	}
}
