export enum LoanCalculationMethod {
    DAILY_ACCRUAL = 'Daily Accrual (Actual/365)',
    AMORTIZING_MONTHLY = 'Monthly Amortizing',
}

export enum PaymentFrequency {
    MONTHLY = 'Monthly',
    WEEKLY = 'Weekly',
    FORTNIGHTLY = 'Fortnightly',
    YEARLY = 'Yearly',
}

export interface LoanDetails {
    id: string;
    name: string;
    principal: number;
    annualInterestRate: number;
    startDate: string; // YYYY-MM-DD
    termYears: number;
    calculationMethod: LoanCalculationMethod;
    paymentFrequency: PaymentFrequency;
    notes?: string;
}

export enum TransactionType {
    REPAYMENT = 'Repayment',
    DRAWDOWN = 'Drawdown',
    FEE = 'Fee',
    ADJUSTMENT = 'Adjustment',
}

export interface Transaction {
    id: string;
    eventType: 'transaction';
    date: string; // YYYY-MM-DD
    amount: number;
    type: TransactionType;
    category: string;
    notes?: string;
}

export interface InterestRateChange {
    id: string;
    eventType: 'rateChange';
    date: string; // YYYY-MM-DD
    newRate: number;
}

export type LoanEvent = Transaction | InterestRateChange;

export interface Loan {
    details: LoanDetails;
    transactions: Transaction[];
    rateChanges: InterestRateChange[];
}


export type DateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy';
export type Theme = 'light' | 'dark';

export interface AppSettings {
    dateFormat: DateFormat;
    theme: Theme;
    logoUrl: string | null;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    timezone: string; // e.g. 'Australia/Brisbane'
    currency: string; // e.g. 'AUD'
}

export interface AmortizationEntry {
    date: string;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
    dailyInterest: number;
    accruedInterest: number;
}