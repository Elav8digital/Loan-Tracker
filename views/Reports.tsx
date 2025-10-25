
import React, { useState, useMemo } from 'react';
import { Download, Printer, Lock, TrendingUp, Edit, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import { formatDate, toYMD, getStartOfYear, getFinancialYearDates } from '../utils/dateUtils';
import { exportToCSV } from '../utils/exportUtils';
import { LoanCalculationMethod, TransactionType } from '../types';

interface MonthlyReportEntry {
    month: string;
    date: string;
    interestForMonth: number;
    endOfMonthBalance: number;
}

const Reports: React.FC = () => {
    const { activeLoan, settings, subscriptionStatus } = useAppContext();
    const { schedule } = useLoanCalculator(activeLoan);
    
    const [startDate, setStartDate] = useState(toYMD(getStartOfYear()));
    const [endDate, setEndDate] = useState(toYMD(new Date()));

    const handlePrint = () => {
        if (subscriptionStatus === 'paid') {
            window.print();
        } else {
            alert('PDF export is a Pro feature. Please upgrade your plan.');
        }
    };
    
    const filteredEvents = useMemo(() => {
        if (!activeLoan) return [];
        const allEvents = [...activeLoan.transactions, ...activeLoan.rateChanges];
        return allEvents
            .filter(event => {
                const eventDate = new Date(event.date + 'T00:00:00');
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T00:00:00');
                return eventDate >= start && eventDate <= end;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activeLoan, startDate, endDate]);
    
    const reportData = useMemo(() => {
        const dateFilteredSchedule = schedule.filter(entry => {
            const entryDate = new Date(entry.date + 'T00:00:00');
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T00:00:00');
            return entryDate >= start && entryDate <= end;
        });

        if (activeLoan?.details.calculationMethod === LoanCalculationMethod.AMORTIZING_MONTHLY) {
            const monthlyEntries: MonthlyReportEntry[] = [];
            const byMonth = dateFilteredSchedule.reduce((acc, entry) => {
                const monthKey = entry.date.substring(0, 7); // YYYY-MM
                if (!acc[monthKey]) acc[monthKey] = [];
                acc[monthKey].push(entry);
                return acc;
            }, {} as Record<string, typeof dateFilteredSchedule>);

            for (const monthKey in byMonth) {
                const monthDailyEntries = byMonth[monthKey];
                const endOfMonthEntry = monthDailyEntries[monthDailyEntries.length - 1];
                const interestForMonth = monthDailyEntries.reduce((sum, entry) => sum + entry.dailyInterest, 0);
                
                monthlyEntries.push({
                    month: monthKey,
                    date: endOfMonthEntry.date,
                    interestForMonth: interestForMonth,
                    endOfMonthBalance: endOfMonthEntry.balance,
                });
            }
            return monthlyEntries;
        }

        return dateFilteredSchedule;
    }, [schedule, startDate, endDate, activeLoan]);

    const handleExport = () => {
        if (!activeLoan) return;

        let dataToExport;
        let filename = `${activeLoan.details.name.replace(/ /g, '_')}_schedule_report`;

        if (activeLoan.details.calculationMethod === LoanCalculationMethod.AMORTIZING_MONTHLY) {
             dataToExport = (reportData as MonthlyReportEntry[]).map(entry => ({
                'Month End': entry.date,
                'Interest This Month': entry.interestForMonth,
                'Ending Balance': entry.endOfMonthBalance,
            }));
        } else {
             dataToExport = reportData.map((entry: any) => ({
                'Date': entry.date,
                'Daily Interest': entry.dailyInterest,
                'Accrued Interest': entry.accruedInterest,
                'Ending Balance': entry.balance,
            }));
        }
        exportToCSV(dataToExport, filename);
    };
    
    const handleExportEvents = () => {
        if (!activeLoan) return;
         const dataToExport = filteredEvents.map(event => {
            if (event.eventType === 'transaction') {
                return {
                    Date: event.date,
                    Type: event.type,
                    Category: event.category,
                    Amount: event.amount,
                    Notes: event.notes || '',
                };
            } else {
                 return {
                    Date: event.date,
                    Type: 'Rate Change',
                    Category: '',
                    Amount: event.newRate,
                    Notes: `New rate: ${event.newRate}%`,
                };
            }
        });
        const filename = `${activeLoan.details.name.replace(/ /g, '_')}_events_report`;
        exportToCSV(dataToExport, filename);
    };

    const setDateRange = (start: Date, end: Date) => {
        setStartDate(toYMD(start));
        setEndDate(toYMD(end));
    };

    if (!activeLoan) {
        return <Card>No loan selected. Please go to the dashboard to select a loan to view reports.</Card>;
    }

    const isMonthlyReport = activeLoan.details.calculationMethod === LoanCalculationMethod.AMORTIZING_MONTHLY;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-primary">Reports</h1>
                    <p className="text-text-light/70 dark:text-text-dark/70">For loan: {activeLoan.details.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Button onClick={handlePrint} disabled={subscriptionStatus === 'free'} title={subscriptionStatus === 'free' ? 'Upgrade to Pro for PDF exports' : 'Print to PDF'}>
                            {subscriptionStatus === 'free' && <Lock className="mr-2 h-4 w-4" />}
                            <Printer className="mr-2 h-5 w-5" /> Print to PDF
                        </Button>
                    </div>
                </div>
            </div>

             <Card>
                <h2 className="text-xl font-bold font-display mb-4">Select Date Range</h2>
                <div className="flex flex-wrap items-end gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50"/>
                    </div>
                     <div className="flex space-x-2">
                        <Button onClick={() => setDateRange(getStartOfYear(), new Date())} variant="secondary">YTD</Button>
                        <Button onClick={() => { const {start, end} = getFinancialYearDates(2023); setDateRange(start, end); }} variant="secondary">FY 23-24</Button>
                        <Button onClick={() => { const {start, end} = getFinancialYearDates(2024); setDateRange(start, end); }} variant="secondary">FY 24-25</Button>
                    </div>
                </div>
            </Card>

            <Card>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-display">Events in Period</h2>
                    <Button onClick={handleExportEvents} variant="secondary">
                        <Download className="mr-2 h-5 w-5" /> Export Events
                    </Button>
                </div>
                <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-4">
                    Showing {filteredEvents.length} events from {formatDate(startDate, settings.dateFormat)} to {formatDate(endDate, settings.dateFormat)}.
                </p>
                <div className="overflow-x-auto max-h-[40vh]">
                     <table className="w-full text-left">
                        <thead className="border-b border-primary/20 sticky top-0 bg-card-light dark:bg-card-dark">
                            <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Details</th>
                                <th className="p-2 text-right">Amount / Change</th>
                            </tr>
                        </thead>
                         <tbody>
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="border-b border-primary/10">
                                    <td className="p-2 whitespace-nowrap">{formatDate(event.date, settings.dateFormat)}</td>
                                    {event.eventType === 'transaction' ? (
                                        <>
                                            <td className="p-2">
                                                <p className="font-semibold">{event.type}</p>
                                                <p className="text-sm text-text-light/70 dark:text-text-dark/70">{event.category}</p>
                                            </td>
                                            <td className={`p-2 text-right font-mono whitespace-nowrap ${event.type === TransactionType.REPAYMENT ? 'text-green-400' : 'text-red-400'}`}>
                                                {event.type === TransactionType.REPAYMENT ? '-' : '+'}${event.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-2 italic text-accent" colSpan={2}>
                                                <div className="flex items-center space-x-2">
                                                    <TrendingUp size={16}/>
                                                    <span>Interest Rate changed to {event.newRate.toFixed(2)}%</span>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-display">Detailed Loan Schedule</h2>
                     <Button onClick={handleExport} variant="secondary">
                        <Download className="mr-2 h-5 w-5" /> Export Schedule
                    </Button>
                </div>
                <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-4">
                    Displaying calculated {isMonthlyReport ? 'monthly' : 'daily'} summary from {formatDate(startDate, settings.dateFormat)} to {formatDate(endDate, settings.dateFormat)}.
                </p>
                <div className="overflow-x-auto max-h-[60vh]">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-primary/20 sticky top-0 bg-card-light dark:bg-card-dark">
                            <tr>
                                <th className="p-2">{isMonthlyReport ? 'Month End' : 'Date'}</th>
                                <th className="p-2 text-right">{isMonthlyReport ? 'Interest This Month' : 'Daily Interest'}</th>
                                {!isMonthlyReport && <th className="p-2 text-right">Accrued Interest</th>}
                                <th className="p-2 text-right">Ending Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isMonthlyReport ? (
                                (reportData as MonthlyReportEntry[]).map((entry) => (
                                    <tr key={entry.month} className="border-b border-primary/10">
                                        <td className="p-2">{formatDate(entry.date, settings.dateFormat)}</td>
                                        <td className="p-2 text-right font-mono text-orange-400">${entry.interestForMonth.toFixed(2)}</td>
                                        <td className="p-2 text-right font-mono text-green-400">${entry.endOfMonthBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                ))
                            ) : (
                                reportData.map((entry: any, index) => (
                                    <tr key={index} className="border-b border-primary/10">
                                        <td className="p-2">{formatDate(entry.date, settings.dateFormat)}</td>
                                        <td className="p-2 text-right font-mono text-red-400">${entry.dailyInterest.toFixed(2)}</td>
                                        <td className="p-2 text-right font-mono text-orange-400">${entry.accruedInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className="p-2 text-right font-mono text-green-400">${entry.balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Reports;
