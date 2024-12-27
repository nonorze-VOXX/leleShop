export class YearMonth {
	year: number;
	month: number;

	constructor(yearMonth: string);
	constructor(year: number, month: number);
	constructor(year: string, month: string);
	constructor(yearOrYearMonth: string | number, month?: number | string) {
		if (typeof yearOrYearMonth === 'string' && month === undefined) {
			const [year, month] = yearOrYearMonth.split('-').map(Number);
			this.year = year;
			this.month = month;
		} else if (typeof yearOrYearMonth === 'number' && typeof month === 'number') {
			this.year = yearOrYearMonth;
			this.month = month;
		} else if (typeof yearOrYearMonth === 'string' && typeof month === 'string') {
			this.year = parseInt(yearOrYearMonth);
			this.month = parseInt(month);
		} else {
			throw new Error('Invalid constructor arguments');
		}
	}

	static now(): YearMonth {
		const now = new Date();
		return new YearMonth(now.getFullYear(), now.getMonth() + 1);
	}

	getPreviousMonth(): YearMonth {
		const date = new Date(Date.UTC(this.year, this.month - 2)); // month is 0-indexed
		return new YearMonth(date.getUTCFullYear(), date.getUTCMonth() + 1);
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
