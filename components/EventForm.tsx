import React, { useState } from 'react';
import { Transaction, InterestRateChange, TransactionType } from '../types';
import Button from './Button';
import { toYMD } from '../utils/dateUtils';

interface EventFormProps {
    onSave: (eventData: Omit<Transaction, 'id' | 'eventType'> | Omit<InterestRateChange, 'id' | 'eventType'>, type: 'transaction' | 'rateChange') => void;
    onCancel: () => void;
    initialData?: Transaction | InterestRateChange;
}

type EventType = 'transaction' | 'rateChange';

const EventForm: React.FC<EventFormProps> = ({ onSave, onCancel, initialData }) => {
    const [eventType, setEventType] = useState<EventType>(initialData?.eventType || 'transaction');
    
    const [transactionData, setTransactionData] = useState({
        date: initialData?.date || toYMD(new Date()),
        amount: (initialData as Transaction)?.amount || 1000,
        type: (initialData as Transaction)?.type || TransactionType.REPAYMENT,
        category: (initialData as Transaction)?.category || '',
        notes: (initialData as Transaction)?.notes || '',
    });

    const [rateChangeData, setRateChangeData] = useState({
        date: initialData?.date || toYMD(new Date()),
        newRate: (initialData as InterestRateChange)?.newRate || 5.0,
    });

    const handleTransactionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTransactionData(prev => ({ ...prev, [name]: name === 'amount' ? parseFloat(value) : value }));
    };

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRateChangeData(prev => ({ ...prev, [name]: name === 'newRate' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventType === 'transaction') {
            onSave(transactionData, 'transaction');
        } else {
            onSave(rateChangeData, 'rateChange');
        }
    };

    const TabButton: React.FC<{ label: string; type: EventType }> = ({ label, type }) => (
        <button
            type="button"
            onClick={() => setEventType(type)}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${eventType === type ? 'border-primary text-primary' : 'border-transparent text-text-light/70 dark:text-text-dark/70 hover:border-primary/50'}`}
        >
            {label}
        </button>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="flex space-x-2 border-b border-primary/20 mb-4">
                <TabButton label="Transaction" type="transaction" />
                <TabButton label="Rate Change" type="rateChange" />
            </div>

            {eventType === 'transaction' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Date</label><input type="date" name="date" value={transactionData.date} onChange={handleTransactionChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Amount</label><input type="number" step="0.01" name="amount" value={transactionData.amount} onChange={handleTransactionChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Type</label><select name="type" value={transactionData.type} onChange={handleTransactionChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50">{Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div><label>Category</label><input type="text" name="category" value={transactionData.category} onChange={handleTransactionChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                    </div>
                    <div><label>Notes</label><textarea name="notes" value={transactionData.notes} onChange={handleTransactionChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                </div>
            )}

            {eventType === 'rateChange' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label>Effective Date</label><input type="date" name="date" value={rateChangeData.date} onChange={handleRateChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>New Annual Rate (%)</label><input type="number" step="0.01" name="newRate" value={rateChangeData.newRate} onChange={handleRateChange} required className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                    </div>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit">Save Event</Button>
            </div>
        </form>
    );
};

export default EventForm;
