
import { formatDate } from './dateUtils';

export const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(fieldName => {
                const value = (row as any)[fieldName];
                
                // Check if it looks like a date string 'YYYY-MM-DD' before formatting
                if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    return formatDate(value, 'dd/mm/yyyy');
                }
                
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                 if (typeof value === 'number') {
                    return value.toFixed(2);
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
