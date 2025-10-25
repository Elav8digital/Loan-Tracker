import { useMemo } from 'react';
import { type Loan, type Transaction, type InterestRateChange, TransactionType, type AmortizationEntry, LoanCalculationMethod, LoanEvent } from '../types';
import { addDays, toYMD } from '../utils/dateUtils';

export const useLoanCalculator = (
    loan: Loan | undefined
): { schedule: AmortizationEntry[], summary: { totalInterest: number, currentBalance: number } } => {

    const calculation = useMemo(() => {
        if (!loan || !loan.details.startDate || loan.details.principal <= 0) {
            return { schedule: [], summary: { totalInterest: 0, currentBalance: 0 } };
        }
        
        const { details: loanDetails, transactions, rateChanges } = loan;

        const schedule: AmortizationEntry[] = [];

        const events: LoanEvent[] = [
            ...transactions,
            ...rateChanges
        ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let currentBalance = loanDetails.principal;
        let currentAnnualRate = loanDetails.annualInterestRate;
        let totalAccruedInterest = 0;
        let interestAccruedThisMonth = 0;
        let currentDate = new Date(loanDetails.startDate + 'T00:00:00');
        const endDate = new Date(); 
        
        let eventIndex = 0;

        while (currentDate <= endDate) {
            const todayStr = toYMD(currentDate);

            // Process any events for today before calculating interest
            while (eventIndex < events.length && events[eventIndex].date === todayStr) {
                const event = events[eventIndex];
                
                switch (event.eventType) {
                    case 'transaction':
                        if (event.type === TransactionType.REPAYMENT) {
                            currentBalance -= event.amount;
                        } else if (event.type === TransactionType.DRAWDOWN) {
                            currentBalance += event.amount;
                        } else if (event.type === TransactionType.FEE) {
                             currentBalance += event.amount;
                        } else if (event.type === TransactionType.ADJUSTMENT) {
                            currentBalance += event.amount;
                        }
                        break;
                    case 'rateChange':
                        currentAnnualRate = event.newRate;
                        break;
                }
                eventIndex++;
            }
            
            // Interest calculation
            let dailyInterest = 0;
            if (currentBalance > 0) {
                 const dailyRate = (currentAnnualRate / 100) / 365;
                 dailyInterest = currentBalance * dailyRate;
                 totalAccruedInterest += dailyInterest;
            }

            if (loanDetails.calculationMethod === LoanCalculationMethod.DAILY_ACCRUAL) {
                if (currentBalance > 0) {
                    currentBalance += dailyInterest;
                }
            } else if (loanDetails.calculationMethod === LoanCalculationMethod.AMORTIZING_MONTHLY) {
                 if (currentBalance > 0) {
                    interestAccruedThisMonth += dailyInterest;
                }
                // If it's the last day of the month, capitalize the interest
                const nextDay = addDays(currentDate, 1);
                if (nextDay.getDate() === 1) {
                    currentBalance += interestAccruedThisMonth;
                    interestAccruedThisMonth = 0;
                }
            }

            schedule.push({
                date: todayStr,
                payment: 0, 
                principal: 0, 
                interest: 0, 
                dailyInterest: dailyInterest,
                accruedInterest: totalAccruedInterest,
                balance: currentBalance,
            });

            currentDate = addDays(currentDate, 1);
        }
        
        const summary = {
            totalInterest: totalAccruedInterest,
            currentBalance: currentBalance < 0 ? 0 : currentBalance,
        };

        return { schedule, summary };
    }, [loan]);

    return calculation;
};
