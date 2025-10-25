import React, { useState } from 'react';
import { LoanDetails, LoanCalculationMethod, PaymentFrequency } from '../types';
import Button from './Button';
import { toYMD } from '../utils/dateUtils';

interface LoanFormProps {
    onSave: (loanDetails: Omit<LoanDetails, 'id'>) => void;
    onCancel: () => void;
    initialData?: Omit<LoanDetails, 'id'>;
}

const LoanForm: React.FC<LoanFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        principal: 10000,
        annualInterestRate: 5.0,
        startDate: toYMD(new Date()),
        termYears: 5,
        calculationMethod: LoanCalculationMethod.DAILY_ACCRUAL,
        paymentFrequency: PaymentFrequency.MONTHLY,
        notes: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'principal' || name === 'annualInterestRate' || name === 'termYears' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Loan Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                <div><label>Start Date</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                <div><label>Principal Amount</label><input type="number" step="0.01" name="principal" value={formData.principal} onChange={handleChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                <div><label>Annual Interest Rate (%)</label><input type="number" step="0.01" name="annualInterestRate" value={formData.annualInterestRate} onChange={handleChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                <div><label>Term (Years)</label><input type="number" name="termYears" value={formData.termYears} onChange={handleChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                <div><label>Calculation Method</label><select name="calculationMethod" value={formData.calculationMethod} onChange={handleChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50">{Object.values(LoanCalculationMethod).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            </div>
            <div><label>Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Loan</Button>
            </div>
        </form>
    );
};

export default LoanForm;
