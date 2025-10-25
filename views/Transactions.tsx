import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, TrendingUp, DollarSign, Percent } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';
import { formatDate } from '../utils/dateUtils';
import { TransactionType, LoanCalculationMethod, LoanDetails, InterestRateChange, Transaction, LoanEvent } from '../types';
import Modal from '../components/Modal';
import EventForm from '../components/EventForm';
import { useLoanCalculator } from '../hooks/useLoanCalculator';

// A small component for the new summary cards
const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string; color: string; }> = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center p-4 bg-background-light dark:bg-card-dark rounded-lg border border-primary/20">
        <div className={`p-3 rounded-full bg-${color}-500/20 text-${color}-500 mr-4`}>
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm text-text-light/70 dark:text-text-dark/70">{label}</p>
            <p className="text-2xl font-bold font-mono">{value}</p>
        </div>
    </div>
);


const LoanDetail: React.FC = () => {
    const { 
        activeLoan, 
        updateLoanDetails, 
        settings, 
        addEvent,
        updateEvent,
        deleteEvent
    } = useAppContext();

    const { summary } = useLoanCalculator(activeLoan);
    const [isEditingLoan, setIsEditingLoan] = useState(false);
    const [editedLoanDetails, setEditedLoanDetails] = useState<LoanDetails | undefined>(activeLoan?.details);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<LoanEvent | null>(null);
    
    useEffect(() => {
        setEditedLoanDetails(activeLoan?.details);
    }, [activeLoan]);

    const allEvents = useMemo(() => {
        if (!activeLoan) return [];
        return [...activeLoan.transactions, ...activeLoan.rateChanges]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activeLoan]);

    if (!activeLoan || !editedLoanDetails) {
        return <Card>No loan selected. Please go to the dashboard to select a loan.</Card>;
    }
    
    const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumberField = ['principal', 'annualInterestRate', 'termYears'].includes(name);
        setEditedLoanDetails({ ...editedLoanDetails, [name]: isNumberField ? parseFloat(value) || 0 : value });
    };
    
    const saveLoanDetails = () => {
        if (editedLoanDetails) {
            updateLoanDetails(activeLoan.details.id, editedLoanDetails);
            setIsEditingLoan(false);
        }
    };

    const handleOpenAddEventModal = () => {
        setEventToEdit(null);
        setIsEventModalOpen(true);
    };
    
    const handleOpenEditEventModal = (event: LoanEvent) => {
        setEventToEdit(event);
        setIsEventModalOpen(true);
    };
    
    const handleSaveEvent = (eventData: Omit<Transaction, 'id' | 'eventType'> | Omit<InterestRateChange, 'id' | 'eventType'>, type: 'transaction' | 'rateChange') => {
        const fullEventData = { ...eventData, eventType: type };
        if (eventToEdit) { // Editing existing event
            updateEvent(activeLoan.details.id, { ...fullEventData, id: eventToEdit.id } as LoanEvent);
        } else { // Adding new event
            addEvent(activeLoan.details.id, fullEventData as Omit<Transaction, 'id'> | Omit<InterestRateChange, 'id'>);
        }
        setIsEventModalOpen(false);
        setEventToEdit(null);
    };
    
    const handleDeleteEvent = (event: LoanEvent) => {
        if(window.confirm('Are you sure you want to delete this event? This action cannot be undone.')){
            deleteEvent(activeLoan.details.id, event.id);
        }
    };
    
    const closeModal = () => {
        setIsEventModalOpen(false);
        setEventToEdit(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-primary">{activeLoan.details.name}</h1>
                        <p className="text-text-light/70 dark:text-text-dark/70">{activeLoan.details.notes}</p>
                    </div>
                     {!isEditingLoan ? (
                        <Button onClick={() => setIsEditingLoan(true)} variant="secondary"><Edit className="mr-2 h-4 w-4"/> Edit Details</Button>
                    ) : (
                        <div className="flex space-x-2">
                             <Button onClick={() => { setIsEditingLoan(false); setEditedLoanDetails(activeLoan.details);}} variant="secondary">Cancel</Button>
                            <Button onClick={saveLoanDetails}>Save</Button>
                        </div>
                    )}
                </div>
                {isEditingLoan ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-primary/20 pt-4">
                        <div><label>Loan Name</label><input type="text" name="name" value={editedLoanDetails.name} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Principal Amount</label><input type="number" name="principal" value={editedLoanDetails.principal} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Annual Interest Rate (%)</label><input type="number" name="annualInterestRate" value={editedLoanDetails.annualInterestRate} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Start Date</label><input type="date" name="startDate" value={editedLoanDetails.startDate} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                        <div><label>Term (Years)</label><input type="number" name="termYears" value={editedLoanDetails.termYears} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                         <div><label>Calculation Method</label><select name="calculationMethod" value={editedLoanDetails.calculationMethod} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50">{Object.values(LoanCalculationMethod).map(m => <option key={m}>{m}</option>)}</select></div>
                         <div className="md:col-span-3"><label>Notes</label><textarea name="notes" value={editedLoanDetails.notes ?? ''} onChange={handleLoanChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50" /></div>
                    </div>
                ) : null}
            </Card>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    icon={DollarSign}
                    label="Current Balance"
                    value={`$${summary.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="green"
                />
                <StatCard 
                    icon={Percent}
                    label="Total Interest Accrued"
                    value={`$${summary.totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    color="orange"
                />
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold font-display text-primary">Loan History</h2>
                     <Button onClick={handleOpenAddEventModal}><PlusCircle className="mr-2 h-5 w-5" /> Add Event</Button>
                </div>
                <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="border-b border-primary/20">
                            <tr>
                                <th className="p-2">Date</th>
                                <th className="p-2">Details</th>
                                <th className="p-2 text-right">Amount</th>
                                <th className="p-2 text-right">Actions</th>
                            </tr>
                        </thead>
                         <tbody>
                            {allEvents.map((event) => (
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
                                    <td className="p-2 text-right space-x-2">
                                        <button onClick={() => handleOpenEditEventModal(event)} className="text-primary hover:text-accent p-1 transition-colors"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteEvent(event)} className="text-red-500 hover:text-red-400 p-1 transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            </Card>
            
            <Modal title={eventToEdit ? 'Edit Event' : 'Add New Event'} isOpen={isEventModalOpen} onClose={closeModal}>
                <EventForm onSave={handleSaveEvent} onCancel={closeModal} initialData={eventToEdit ?? undefined} />
            </Modal>
        </div>
    );
};

export default LoanDetail;
