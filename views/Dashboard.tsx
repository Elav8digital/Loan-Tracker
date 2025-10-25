
import React, { useState } from 'react';
import { PlusCircle, ChevronsUpDown } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import { useLoanCalculator } from '../hooks/useLoanCalculator';
import { Loan, LoanDetails } from '../types';
import { formatDate } from '../utils/dateUtils';
import Modal from '../components/Modal';
import LoanForm from '../components/LoanForm';

interface LoanCardProps {
    loan: Loan;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onViewDetails: () => void;
}

const LoanStat: React.FC<{ label: string; value: string; }> = ({ label, value }) => (
    <div>
        <p className="text-sm text-text-light/70 dark:text-text-dark/70">{label}</p>
        <p className="font-bold text-lg">{value}</p>
    </div>
);


const LoanCard: React.FC<LoanCardProps> = ({ loan, isExpanded, onToggleExpand, onViewDetails }) => {
    const { settings } = useAppContext();
    const { summary, schedule } = useLoanCalculator(loan);

    // Format data for the chart
    const chartData = schedule.map(entry => ({
        date: formatDate(entry.date, settings.dateFormat),
        Balance: entry.balance,
    }));

    return (
        <Card className="flex flex-col justify-between transition-all duration-300">
            <div className="cursor-pointer" onClick={onToggleExpand}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold font-display text-primary">{loan.details.name}</h3>
                        <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-4">{loan.details.notes}</p>
                    </div>
                    <ChevronsUpDown className={`text-accent transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-auto border-t border-primary/10 pt-4">
                    <LoanStat label="Current Balance" value={`$${summary.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <LoanStat label="Interest Accrued" value={`$${summary.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <LoanStat label="Start Date" value={formatDate(loan.details.startDate, settings.dateFormat)} />
                    <LoanStat label="Calculation" value={loan.details.calculationMethod} />
                </div>
            </div>

            {/* Expanded Content */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[500px] mt-6 pt-6 border-t border-primary/20' : 'max-h-0'}`}>
                <h4 className="text-lg font-bold mb-4 font-display text-secondary">Balance Over Time</h4>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(79, 70, 229, 0.2)" />
                            <XAxis dataKey="date" tick={{ fill: 'var(--color-text-dark)', fontSize: 12 }} tickFormatter={(tick) => chartData.length > 365 && chartData.indexOf(chartData.find(d => d.date === tick)!) % 90 !== 0 ? '' : tick } />
                            <YAxis tick={{ fill: 'var(--color-text-dark)', fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--color-card-dark)',
                                    borderColor: 'var(--color-primary)',
                                    color: 'var(--color-text-dark)'
                                }}
                                labelStyle={{ fontWeight: 'bold' }}
                                formatter={(value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            />
                            <Legend wrapperStyle={{ color: 'var(--color-text-dark)' }} />
                            <Line type="monotone" dataKey="Balance" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={onViewDetails} variant="secondary">
                        View Full Details & Transactions
                    </Button>
                </div>
            </div>
        </Card>
    );
};


const Dashboard: React.FC<{ setView: (view: 'dashboard' | 'loanDetail' | 'reports' | 'settings') => void }> = ({ setView }) => {
    const { loans, setActiveLoanId, addLoan } = useAppContext();
    const [isAddLoanModalOpen, setIsAddLoanModalOpen] = useState(false);
    const [expandedLoanId, setExpandedLoanId] = useState<string | null>(null);

    const handleSelectLoan = (loanId: string) => {
        setActiveLoanId(loanId);
        setView('loanDetail');
    };

    const handleToggleExpand = (loanId: string) => {
        setExpandedLoanId(prevId => (prevId === loanId ? null : loanId));
    };

    const handleAddLoan = (loanDetails: Omit<LoanDetails, 'id'>) => {
        addLoan(loanDetails);
        setIsAddLoanModalOpen(false);
        // New loan becomes active automatically, so switch view
        setView('loanDetail');
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-display text-primary">Dashboard</h1>
                <Button onClick={() => setIsAddLoanModalOpen(true)}><PlusCircle className="mr-2 h-5 w-5" /> Add New Loan</Button>
            </div>
            
            <div className="space-y-4">
                {loans.length > 0 ? (
                    loans.map(loan => (
                        <LoanCard 
                            key={loan.details.id} 
                            loan={loan} 
                            isExpanded={expandedLoanId === loan.details.id}
                            onToggleExpand={() => handleToggleExpand(loan.details.id)}
                            onViewDetails={() => handleSelectLoan(loan.details.id)}
                        />
                    ))
                ) : (
                    <Card className="text-center py-12">
                        <h2 className="text-xl font-bold">No loans found.</h2>
                        <p className="text-text-light/70 dark:text-text-dark/70 mb-4">Get started by adding your first loan.</p>
                        <Button onClick={() => setIsAddLoanModalOpen(true)}><PlusCircle className="mr-2 h-5 w-5" /> Add New Loan</Button>
                    </Card>
                )}
            </div>

            <Modal title="Add New Loan" isOpen={isAddLoanModalOpen} onClose={() => setIsAddLoanModalOpen(false)}>
                <LoanForm onSave={handleAddLoan} onCancel={() => setIsAddLoanModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Dashboard;
