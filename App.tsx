
import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import LoanDetail from './views/Transactions'; // Transactions.tsx is now LoanDetail
import Reports from './views/Reports';
import Settings from './views/Settings';

type View = 'dashboard' | 'loanDetail' | 'reports' | 'settings';

const AppContent: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const { activeLoan } = useAppContext();

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                return <Dashboard setView={setView} />;
            case 'loanDetail':
                // If no loan is active, redirect to dashboard
                return activeLoan ? <LoanDetail /> : <Dashboard setView={setView} />;
            case 'reports':
                 // If no loan is active, redirect to dashboard
                 return activeLoan ? <Reports /> : <Dashboard setView={setView} />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard setView={setView} />;
        }
    };

    return (
        <div className="min-h-screen font-sans transition-colors duration-300">
            <Header currentView={view} setView={setView} />
            <main className="p-4 sm:p-6 lg:p-8">
                {renderView()}
            </main>
        </div>
    );
}

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
