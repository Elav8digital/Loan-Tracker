
import React, { useRef } from 'react';
import { Upload, Star } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAppContext } from '../contexts/AppContext';

const Settings: React.FC = () => {
    const { settings, setSettings, updateColor, subscriptionStatus, setSubscriptionStatus } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSettings(prev => ({ ...prev, [e.target.name]: e.target.value as any }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({ ...prev, logoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold font-display text-primary">Settings</h1>
            
            <Card>
                <h2 className="text-xl font-bold font-display mb-4">Profile & Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 font-semibold">Date Format</label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center"><input type="radio" name="dateFormat" value="dd/mm/yyyy" checked={settings.dateFormat === 'dd/mm/yyyy'} onChange={handleSettingsChange} className="mr-2 text-primary focus:ring-primary"/> DD/MM/YYYY</label>
                            <label className="flex items-center"><input type="radio" name="dateFormat" value="mm/dd/yyyy" checked={settings.dateFormat === 'mm/dd/yyyy'} onChange={handleSettingsChange} className="mr-2 text-primary focus:ring-primary"/> MM/DD/YYYY</label>
                        </div>
                    </div>
                     <div>
                        <label className="block mb-2 font-semibold" htmlFor="timezone">Timezone</label>
                         <select id="timezone" name="timezone" value={settings.timezone} onChange={handleSettingsChange} className="w-full p-2 bg-background-light dark:bg-card-dark rounded border border-primary/50">
                             <option>Australia/Brisbane</option>
                             <option>America/New_York</option>
                             <option>Europe/London</option>
                         </select>
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-bold font-display mb-4">Branding & Theming</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block mb-2 font-semibold">Logo</label>
                        <div className="flex items-center space-x-4">
                            {settings.logoUrl && <img src={settings.logoUrl} alt="logo" className="h-12 w-12 rounded-full bg-gray-200" />}
                            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                            <Button onClick={() => fileInputRef.current?.click()} variant="secondary"><Upload className="mr-2 h-4 w-4"/> Upload Logo</Button>
                        </div>
                    </div>
                     <div>
                        <label className="block mb-2 font-semibold">Admin: Customize Colors</label>
                        <p className="text-sm text-text-light/70 dark:text-text-dark/70 mb-2">Change the core colors of the site using HEX codes.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.entries(settings.colors).map(([name, value]) => (
                                <div key={name}>
                                    <label className="capitalize block mb-1 text-sm">{name}</label>
                                    <div className="flex items-center space-x-2 p-2 border border-primary/20 rounded-md">
                                        <input type="color" value={value} onChange={(e) => updateColor(name as keyof typeof settings.colors, e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"/>
                                        <input type="text" value={value} onChange={(e) => updateColor(name as keyof typeof settings.colors, e.target.value)} className="w-full p-1 bg-transparent border-none focus:ring-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-bold font-display mb-4">Subscription</h2>
                <div className="flex items-center justify-between bg-primary/10 p-4 rounded-md">
                    <div>
                        <p className="font-bold">You are on the <span className={subscriptionStatus === 'paid' ? 'text-primary' : 'text-secondary'}>{subscriptionStatus === 'paid' ? 'Pro Plan' : 'Free Plan'}</span></p>
                        <p className="text-sm text-text-light/70 dark:text-text-dark/70">Upgrade to Pro for unlimited loans and PDF reports.</p>
                    </div>
                    <Button onClick={() => setSubscriptionStatus(s => s === 'free' ? 'paid' : 'free')}>
                        <Star className="mr-2 h-4 w-4" /> 
                        {subscriptionStatus === 'free' ? 'Upgrade to Pro' : 'Downgrade to Free'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
