
import React, { useState } from 'react';
import { Sun, Moon, Briefcase, FileText, Settings, Menu, X, Rocket, LayoutDashboard } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface HeaderProps {
    currentView: string;
    setView: (view: 'dashboard' | 'loanDetail' | 'reports' | 'settings') => void;
}

const NavLink: React.FC<{
    icon: React.ElementType;
    label: string;
    isActive: boolean;
    onClick: () => void;
    disabled?: boolean;
}> = ({ icon: Icon, label, isActive, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                    ? 'bg-accent/20 text-accent shadow-glow-accent'
                    : 'text-slate-300 hover:bg-primary/20 hover:text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const { settings, setSettings, activeLoan } = useAppContext();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleTheme = () => {
        setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
    };

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'loanDetail', label: 'Loan Details', icon: Briefcase, requiresActiveLoan: true },
        { id: 'reports', label: 'Reports', icon: FileText, requiresActiveLoan: true },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];
    
    return (
        <header className="bg-slate-900 backdrop-blur-sm sticky top-0 z-50 shadow-lg border-b border-primary/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center space-x-2 text-primary font-display cursor-pointer" onClick={() => setView('dashboard')}>
                           {settings.logoUrl ? <img src={settings.logoUrl} alt="Logo" className="h-8 w-auto" /> : <Rocket className="h-8 w-8 text-accent"/>}
                            <span className="text-xl font-bold text-text-dark">LoanTracker</span>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {navItems.map(item => (
                                <NavLink
                                    key={item.id}
                                    icon={item.icon}
                                    label={item.label}
                                    isActive={currentView === item.id}
                                    onClick={() => setView(item.id as any)}
                                    disabled={item.requiresActiveLoan && !activeLoan}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-slate-300 hover:bg-primary/20 hover:text-white transition-colors"
                        >
                            {settings.theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                        </button>
                         <div className="md:hidden ml-2">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map(item => (
                             <NavLink
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                isActive={currentView === item.id}
                                onClick={() => {
                                    setView(item.id as any);
                                    setIsMenuOpen(false);
                                }}
                                disabled={item.requiresActiveLoan && !activeLoan}
                            />
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
