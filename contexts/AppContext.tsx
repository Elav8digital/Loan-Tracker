import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { type Loan, type AppSettings, Transaction, InterestRateChange, LoanDetails, LoanEvent } from '../types';
import { defaultAppSettings, initialLoans } from '../constants';

interface AppContextType {
    loans: Loan[];
    setLoans: React.Dispatch<React.SetStateAction<Loan[]>>;
    activeLoanId: string | null;
    setActiveLoanId: React.Dispatch<React.SetStateAction<string | null>>;
    activeLoan: Loan | undefined;
    
    // CRUD Operations
    addLoan: (loanDetails: Omit<LoanDetails, 'id'>) => void;
    updateLoanDetails: (loanId: string, updatedDetails: LoanDetails) => void;
    deleteLoan: (loanId: string) => void;
    
    addEvent: (loanId: string, event: Omit<Transaction, 'id'> | Omit<InterestRateChange, 'id'>) => void;
    updateEvent: (loanId: string, event: LoanEvent) => void;
    deleteEvent: (loanId: string, eventId: string) => void;
    
    settings: AppSettings;
    setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
    updateColor: (colorName: keyof AppSettings['colors'], value: string) => void;
    subscriptionStatus: 'free' | 'paid';
    setSubscriptionStatus: React.Dispatch<React.SetStateAction<'free' | 'paid'>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [loans, setLoans] = useState<Loan[]>(initialLoans);
    const [activeLoanId, setActiveLoanId] = useState<string | null>(loans.length > 0 ? loans[0].details.id : null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'paid'>('free');

    const activeLoan = useMemo(() => loans.find(loan => loan.details.id === activeLoanId), [loans, activeLoanId]);
    
    // --- Loan CRUD ---
    const addLoan = (loanDetails: Omit<LoanDetails, 'id'>) => {
        const newLoan: Loan = {
            details: { ...loanDetails, id: `loan-${Date.now()}` },
            transactions: [],
            rateChanges: [],
        };
        setLoans(prev => [...prev, newLoan]);
        setActiveLoanId(newLoan.details.id);
    };

    const updateLoanDetails = (loanId: string, updatedDetails: LoanDetails) => {
        setLoans(prev => prev.map(l => l.details.id === loanId ? { ...l, details: updatedDetails } : l));
    };

    const deleteLoan = (loanId: string) => {
        setLoans(prev => prev.filter(l => l.details.id !== loanId));
        if (activeLoanId === loanId) {
            setActiveLoanId(loans.length > 1 ? loans.find(l => l.details.id !== loanId)!.details.id : null);
        }
    };
    
    // --- Event CRUD ---
    const addEvent = (loanId: string, event: Omit<Transaction, 'id'> | Omit<InterestRateChange, 'id'>) => {
        setLoans(prev => prev.map(l => {
            if (l.details.id !== loanId) return l;
            if (event.eventType === 'transaction') {
                const newTransaction: Transaction = { ...event, id: `t-${Date.now()}` };
                return { ...l, transactions: [...l.transactions, newTransaction] };
            } else {
                const newRateChange: InterestRateChange = { ...event, id: `rc-${Date.now()}` };
                return { ...l, rateChanges: [...l.rateChanges, newRateChange] };
            }
        }));
    };

    const updateEvent = (loanId: string, event: LoanEvent) => {
        setLoans(prev => prev.map(l => {
            if (l.details.id !== loanId) return l;
            if (event.eventType === 'transaction') {
                return { ...l, transactions: l.transactions.map(t => t.id === event.id ? event : t) };
            } else {
                return { ...l, rateChanges: l.rateChanges.map(rc => rc.id === event.id ? event : rc) };
            }
        }));
    };

    const deleteEvent = (loanId: string, eventId: string) => {
        setLoans(prevLoans => {
            return prevLoans.map(loan => {
                if (loan.details.id === loanId) {
                    const updatedTransactions = loan.transactions.filter(t => t.id !== eventId);
                    const updatedRateChanges = loan.rateChanges.filter(rc => rc.id !== eventId);
                    return {
                        ...loan,
                        transactions: updatedTransactions,
                        rateChanges: updatedRateChanges,
                    };
                }
                return loan;
            });
        });
    };


    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const savedSettings = localStorage.getItem('appSettings');
            return savedSettings ? JSON.parse(savedSettings) : defaultAppSettings;
        } catch (error) {
            console.error("Could not parse saved settings:", error);
            return defaultAppSettings;
        }
    });

    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        document.documentElement.classList.toggle('dark', settings.theme === 'dark');

        document.documentElement.style.setProperty('--color-primary', settings.colors.primary);
        document.documentElement.style.setProperty('--color-secondary', settings.colors.secondary);
        document.documentElement.style.setProperty('--color-accent', settings.colors.accent);
        document.documentElement.style.setProperty('--color-background-light', '#f1f5f9'); // slate-100
        document.documentElement.style.setProperty('--color-background-dark', '#0f172a');  // slate-900
        document.documentElement.style.setProperty('--color-text-light', '#0f172a');     // slate-900
        document.documentElement.style.setProperty('--color-text-dark', '#f1f5f9');     // slate-100
        document.documentElement.style.setProperty('--color-card-light', '#ffffff');    // white
        document.documentElement.style.setProperty('--color-card-dark', '#1e293b');    // slate-800

    }, [settings]);

    const updateColor = (colorName: keyof AppSettings['colors'], value: string) => {
        setSettings(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                // FIX: The computed property name 'name' was incorrect. It should be 'colorName' from the function arguments.
                [colorName]: value
            }
        }));
    };

    const value = useMemo(() => ({
        loans,
        setLoans,
        activeLoanId,
        setActiveLoanId,
        activeLoan,
        addLoan,
        updateLoanDetails,
        deleteLoan,
        addEvent,
        updateEvent,
        deleteEvent,
        settings,
        setSettings,
        updateColor,
        subscriptionStatus,
        setSubscriptionStatus,
    }), [loans, activeLoanId, settings, subscriptionStatus]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};