
import { type Loan, LoanCalculationMethod, PaymentFrequency, TransactionType, type AppSettings } from './types';

export const initialLoans: Loan[] = [
    {
        details: {
            id: 'loan1',
            name: 'Primary Business Loan',
            principal: 50000,
            annualInterestRate: 5.5,
            startDate: '2023-01-01',
            termYears: 5,
            calculationMethod: LoanCalculationMethod.DAILY_ACCRUAL,
            paymentFrequency: PaymentFrequency.MONTHLY,
            notes: 'Initial seed funding for the project.'
        },
        transactions: [
            { id: 't1', eventType: 'transaction', date: '2023-06-15', amount: 1000, type: TransactionType.REPAYMENT, category: 'Scheduled Payment' },
            { id: 't2', eventType: 'transaction', date: '2023-09-01', amount: 5000, type: TransactionType.DRAWDOWN, category: 'Equipment Purchase' },
            { id: 't3', eventType: 'transaction', date: '2024-01-15', amount: 1200, type: TransactionType.REPAYMENT, category: 'Scheduled Payment' },
        ],
        rateChanges: [
            { id: 'rc1', eventType: 'rateChange', date: '2023-11-01', newRate: 6.0 },
        ],
    },
    {
        details: {
            id: 'loan2',
            name: 'Startup Capital',
            principal: 120000,
            annualInterestRate: 4.8,
            startDate: '2022-11-01',
            termYears: 10,
            calculationMethod: LoanCalculationMethod.AMORTIZING_MONTHLY,
            paymentFrequency: PaymentFrequency.MONTHLY,
            notes: 'Series A funding for expansion.'
        },
        transactions: [
            { id: 't4', eventType: 'transaction', date: '2023-02-01', amount: 1500, type: TransactionType.REPAYMENT, category: 'Principal Repayment' },
            { id: 't5', eventType: 'transaction', date: '2023-10-01', amount: 1500, type: TransactionType.REPAYMENT, category: 'Principal Repayment' },
        ],
        rateChanges: [
             { id: 'rc2', eventType: 'rateChange', date: '2024-02-01', newRate: 5.2 },
        ],
    }
];


export const defaultAppSettings: AppSettings = {
    dateFormat: 'dd/mm/yyyy',
    theme: 'dark',
    logoUrl: null,
    colors: {
        primary: '#4f46e5',   // Indigo 600
        secondary: '#10b981', // Emerald 500
        accent: '#38bdf8',    // Sky 400
    },
    timezone: 'Australia/Brisbane',
    currency: 'AUD'
};
