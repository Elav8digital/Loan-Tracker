
import { type DateFormat } from '../types';

export const formatDate = (dateString: string, format: DateFormat): string => {
    try {
        const date = new Date(dateString + 'T00:00:00'); // Ensure date is parsed as local time
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        if (format === 'dd/mm/yyyy') {
            return `${day}/${month}/${year}`;
        } else {
            return `${month}/${day}/${year}`;
        }
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const toYMD = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const daysBetween = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const getStartOfYear = (): Date => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
};

export const getFinancialYearDates = (startYear: number): { start: Date, end: Date } => {
    // In Australia, FY is 1 July to 30 June
    const start = new Date(startYear, 6, 1); // July 1st
    const end = new Date(startYear + 1, 5, 30); // June 30th
    return { start, end };
};
