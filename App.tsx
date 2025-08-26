import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Routes, Route, NavLink, useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Car, CarStatus, Booking, Transaction, TransactionType, MaintenanceRecord, DocumentRecord, User, UserRole, Customer, Notification, NotificationType, TransactionCategory, CustomerDocument, Season, CheckState, DamagePoint, ExtraFee } from './types';
import { ICONS } from './constants';
import { useTranslation } from './i18n';
import * as db from './db';
import { Logo } from './Logo';
import { FileText, Settings, Fuel, CircleDollarSign, ArrowRight, User as UserIcon, Printer, Trash2, ShieldCheck, AlertTriangle, Wrench, Pencil, Download } from 'lucide-react';

// --- MOCK DATA GENERATION ---
// Date generation for mock data to be relevant to the current date
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const initialUsersData: User[] = [
    { id: 'user-1', name: 'Directeur Général', role: UserRole.Admin, password: 'admin' },
    { id: 'user-2', name: 'Réceptionniste', role: UserRole.Employee, password: 'user' },
];

const initialCustomers: Customer[] = [
    { id: 'cust-1', name: 'Ahmed Mahmoud', phone: '0501234567', email: 'ahmed.m@example.com', nationalId: 'AB123456', documents: [] },
    { id: 'cust-2', name: 'Fatima Zahra', phone: '0557654321', email: 'fatima.z@example.com', nationalId: 'CD789012', documents: [] },
];

const initialCars: Car[] = [
    { id: '1', make: 'Toyota', model: 'Corolla', year: 2022, color: 'Blanc', licensePlate: '123-A-45', engineCapacity: '1.6L', fuelType: 'Essence', status: CarStatus.Available, imageUrl: 'https://picsum.photos/seed/corolla/400/300', pricePerDay: 250, maintenanceHistory: [{id: 'm1', date: '2023-10-15', description: 'Vidange d\'huile et filtre', cost: 300}], documents: [{id: 'd1', name: 'Assurance', expiryDate: formatDate(new Date(currentYear + 1, 5, 15)), fileUrl: '#'}, {id: 'd2', name: 'Contrôle Technique', expiryDate: formatDate(new Date(currentYear, 8, 20)), fileUrl: '#'}], nextServiceDate: formatDate(new Date(currentYear, 9, 15)), description: 'Une berline fiable et économique, parfaite pour les voyages en ville et les longs trajets. Profitez de son confort et de sa faible consommation.' },
    { id: '2', make: 'Hyundai', model: 'Elantra', year: 2023, color: 'Argent', licensePlate: '789-B-12', engineCapacity: '2.0L', fuelType: 'Essence', status: CarStatus.Rented, imageUrl: 'https://picsum.photos/seed/elantra/400/300', pricePerDay: 300, maintenanceHistory: [], documents: [{id: 'd3', name: 'Assurance', expiryDate: formatDate(new Date(currentYear + 1, 2, 20)), fileUrl: '#'}], nextServiceDate: formatDate(new Date(currentYear + 1, 0, 10)), description: 'Élégante et moderne, l\'Elantra offre une expérience de conduite supérieure avec ses nombreuses fonctionnalités technologiques. Idéale pour les clients exigeants.' },
    { id: '3', make: 'Kia', model: 'Sportage', year: 2021, color: 'Noir', licensePlate: '456-C-78', engineCapacity: '2.4L', fuelType: 'Diesel', status: CarStatus.Available, imageUrl: 'https://picsum.photos/seed/sportage/400/300', pricePerDay: 400, maintenanceHistory: [{id: 'm2', date: '2024-05-20', description: 'Réparation des freins', cost: 1200}], documents: [{id: 'd4', name: 'Assurance', expiryDate: formatDate(new Date(currentYear, 6, 25)), fileUrl: '#'}], nextServiceDate: formatDate(new Date(currentYear, 8, 1)), description: 'Un SUV spacieux et polyvalent, parfait pour les familles ou les aventures hors des sentiers battus. Robuste et confortable.' },
    { id: '4', make: 'Ford', model: 'Focus', year: 2022, color: 'Bleu', licensePlate: '321-D-90', engineCapacity: '1.5L', fuelType: 'Essence', status: CarStatus.Available, imageUrl: 'https://picsum.photos/seed/focus/400/300', pricePerDay: 280, maintenanceHistory: [], documents: [{id: 'd5', name: 'Assurance', expiryDate: formatDate(new Date(currentYear, 5, 30)), fileUrl: '#'}], nextServiceDate: formatDate(new Date(currentYear, 10, 20)), description: 'Dynamique et agréable à conduire, la Ford Focus est un excellent choix pour ceux qui recherchent une voiture compacte et performante.' },
];

const generateDynamicBookings = () => {
    const bookings: Booking[] = [];
    const carIds = ['1', '2', '3', '4'];
    const customerIds = ['cust-1', 'cust-2'];

    // Booking spanning previous and current month
    bookings.push({ id: `b-prev`, carId: '3', customerId: 'cust-2', startDate: formatDate(new Date(currentYear, currentMonth -1, 25)), endDate: formatDate(new Date(currentYear, currentMonth, 5)), totalPrice: 9 * 400 });

    // Current month bookings
    bookings.push({ id: 'b1', carId: '1', customerId: 'cust-2', startDate: formatDate(new Date(currentYear, currentMonth, 5)), endDate: formatDate(new Date(currentYear, currentMonth, 12)), totalPrice: 7 * 250 });
    bookings.push({ id: 'b2', carId: '2', customerId: 'cust-1', startDate: formatDate(new Date(currentYear, currentMonth, 1)), endDate: formatDate(new Date(currentYear, currentMonth, 20)), totalPrice: 19 * 300, isNew: true });
    bookings.push({ id: 'b6', carId: '3', customerId: 'cust-2', startDate: formatDate(new Date(currentYear, currentMonth, 18)), endDate: formatDate(new Date(currentYear, currentMonth, 22)), totalPrice: 4 * 400 });
    
    // Booking spanning current and next month
    bookings.push({ id: 'b3', carId: '4', customerId: 'cust-1', startDate: formatDate(new Date(currentYear, currentMonth, 28)), endDate: formatDate(new Date(currentYear, currentMonth + 1, 5)), totalPrice: 8 * 280 });
    
    // Next month bookings
    bookings.push({ id: 'b4', carId: '1', customerId: 'cust-1', startDate: formatDate(new Date(currentYear, currentMonth + 1, 8)), endDate: formatDate(new Date(currentYear, currentMonth + 1, 15)), totalPrice: 7 * 250 });

    return bookings;
};

const initialBookings = generateDynamicBookings();
const initialCompanyInfo = { name: 'RentSmart Agence', address: '123 Rue de la Liberté', phone: '0500112233' };

const initialTransactions: Transaction[] = [
    ...initialBookings.map(b => ({
        id: `t-${b.id}`,
        type: TransactionType.Income,
        category: TransactionCategory.Rental,
        description: `Location Car #${b.carId}`,
        amount: b.totalPrice,
        date: b.startDate,
        carId: b.carId,
        bookingId: b.id
    })),
    { id: 't-extra-1', type: TransactionType.Expense, category: TransactionCategory.Maintenance, description: 'Réparation freins Sportage', amount: 1200, date: formatDate(new Date(currentYear, currentMonth - 1, 20)), carId: '3' },
    { id: 't-extra-2', type: TransactionType.Expense, category: TransactionCategory.Fuel, description: 'Plein de carburant pour la flotte', amount: 600, date: formatDate(new Date(currentYear, currentMonth, 3)) },
];


const initialSeasons: Season[] = [
    { id: 's1', name: 'Haute Saison (Été)', startDate: `${currentYear}-07-01`, endDate: `${currentYear}-08-31`, multiplier: 1.25 },
    { id: 's2', name: 'Basse Saison (Hiver)', startDate: `${currentYear}-12-01`, endDate: `${currentYear+1}-02-28`, multiplier: 0.8 },
];

const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    const targetDate = new Date(dateStr);
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

// Reusable UI Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-surface rounded-lg shadow-lg p-6 ${className}`}>{children}</div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-lg m-4 transform transition-transform duration-300 scale-95 animate-modal-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-bold text-text-primary">{title}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">{ICONS.close}</button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
            </div>
            <style>{`
                @keyframes modal-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

const Button: React.FC<{ onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; children: React.ReactNode; className?: string; type?: 'button' | 'submit' | 'reset'; disabled?: boolean;}> = ({ onClick, children, className, type = 'button', disabled = false }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed dark:disabled:bg-gray-700 dark:disabled:text-gray-400 ${className}`}>
        {children}
    </button>
);

// App Components
const Sidebar: React.FC<{currentUser: User; onLogout: () => void; isOpen: boolean; closeSidebar: () => void;}> = ({ currentUser, onLogout, isOpen, closeSidebar }) => {
    const { t } = useTranslation();
    const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
        const location = useLocation();
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
        return (
            <NavLink to={to} onClick={closeSidebar} className={`flex items-center gap-4 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary transition-all duration-200 ${isActive ? 'bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-200' : ''}`}>
                {icon}
                <span className="font-semibold">{label}</span>
            </NavLink>
        );
    };

    return (
        <aside className={`w-64 bg-surface p-4 flex-shrink-0 flex flex-col h-screen fixed top-0 start-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'}`}>
            <div className="px-4 mb-8">
                <Link to="/">
                    <Logo className="h-10 w-auto" />
                </Link>
            </div>
            <nav className="flex flex-col space-y-2">
                <NavItem to="/" icon={ICONS.dashboard} label={t('dashboard')} />
                <NavItem to="/fleet" icon={ICONS.fleet} label={t('fleetManagement')} />
                <NavItem to="/bookings" icon={ICONS.bookings} label={t('bookings')} />
                <NavItem to="/calendar" icon={ICONS.calendar} label={t('calendar')} />
                <NavItem to="/customers" icon={ICONS.customers} label={t('customerManagement')} />
                {currentUser.role === UserRole.Admin && <>
                    <NavItem to="/finance" icon={ICONS.finance} label={t('financialManagement')} />
                    <NavItem to="/reports" icon={ICONS.reports} label={t('reports')} />
                </>}
            </nav>
            <div className="mt-auto space-y-2">
                 {currentUser.role === UserRole.Admin && <NavItem to="/settings" icon={ICONS.settings} label={t('settings')} />}
                 <button onClick={onLogout} className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-primary transition-all duration-200">
                    {ICONS.logout}
                    <span className="font-semibold">{t('logout')}</span>
                 </button>
            </div>
        </aside>
    );
};


const NotificationsPanel: React.FC<{ notifications: Notification[]; onRead: (id: string) => void }> = ({ notifications, onRead }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative text-text-secondary hover:text-text-primary">
                {ICONS.notifications}
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>}
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-80 bg-surface rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                    <div className="p-3 font-bold border-b border-gray-200 dark:border-gray-700">{t('notifications')}</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <Link to={n.linkTo || '#'} key={n.id} onClick={() => { onRead(n.id); setIsOpen(false); }} className={`block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${!n.isRead ? 'bg-primary-50 dark:bg-primary-950/50' : ''}`}>
                                <p className="font-semibold text-sm text-text-primary">{n.message}</p>
                                <p className="text-xs text-text-secondary">{new Date(n.date).toLocaleString()}</p>
                            </Link>
                        )) : <p className="p-3 text-sm text-text-secondary">{t('noNewNotifications')}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

const AppHeader: React.FC<{ currentUser: User; notifications: Notification[]; onReadNotification: (id: string) => void; theme: 'light' | 'dark'; toggleTheme: () => void; toggleSidebar: () => void; }> = ({ currentUser, notifications, onReadNotification, theme, toggleTheme, toggleSidebar }) => {
    const { language, changeLanguage } = useTranslation();
    return (
        <header className="flex justify-between items-center mb-8 bg-surface p-4 rounded-lg shadow-md sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="text-text-secondary hover:text-text-primary">
                    {ICONS.menu}
                </button>
            </div>
            <div className="flex items-center gap-6">
                 <button 
                    onClick={() => changeLanguage(language === 'ar' ? 'fr' : 'ar')} 
                    className="bg-surface hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-text-primary font-bold py-2 px-3 rounded-lg transition-colors"
                >
                    {language === 'ar' ? 'FR' : 'ع'}
                </button>
                 <button onClick={toggleTheme} className="text-text-secondary hover:text-text-primary">
                    {theme === 'light' ? ICONS.moon : ICONS.sun}
                </button>
                <NotificationsPanel notifications={notifications} onRead={onReadNotification} />
                <div className="flex items-center gap-3">
                    <UserIcon className="h-8 w-8 text-gray-600 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 p-1 rounded-full" />
                    <div>
                        <p className="font-semibold text-text-primary">{currentUser.name}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};


// Pages
const DashboardPage: React.FC<{ cars: Car[], bookings: Booking[], transactions: Transaction[], customers: Customer[], currentUser: User }> = ({ cars, bookings, transactions, customers, currentUser }) => {
    const { t, language } = useTranslation();
    const totalIncome = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    const currency = t('currency');

    const financeData = useMemo(() => {
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        transactions.forEach(t => {
            const month = new Date(t.date).toLocaleString(language === 'ar' ? 'ar-EG' : 'fr-FR', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
            if (t.type === TransactionType.Income) monthlyData[month].income += t.amount;
            else monthlyData[month].expense += t.amount;
        });
        return Object.entries(monthlyData).map(([name, values]) => ({ name, ...values })).reverse();
    }, [transactions, language]);
    
    const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';

    const StatCard = ({ icon, title, value, colorClass }: { icon: React.ReactNode; title: string; value: string | number; colorClass: string }) => (
        <Card className="flex items-center gap-4 h-full">
            <div className={`p-3 rounded-full ${colorClass}`}>{icon}</div>
            <div>
                <p className="text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </Card>
    );
    const availableCars = cars.filter(c => c.status === CarStatus.Available).length;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link to="/fleet" className="block hover:scale-[1.02] transition-transform duration-200">
                    <StatCard icon={ICONS.fleet} title={t('availableCars')} value={`${availableCars} / ${cars.length}`} colorClass="bg-blue-500/20 text-blue-400" />
                </Link>
                {currentUser.role === UserRole.Admin ? (
                    <>
                        <StatCard icon={ICONS.income} title={t('totalIncome')} value={`${totalIncome.toLocaleString(locale)} ${currency}`} colorClass="bg-green-500/20 text-green-500" />
                        <StatCard icon={ICONS.expense} title={t('totalExpenses')} value={`${totalExpense.toLocaleString(locale)} ${currency}`} colorClass="bg-expense-500/20 text-expense-500" />
                        <StatCard icon={ICONS.finance} title={t('netProfit')} value={`${netProfit.toLocaleString(locale)} ${currency}`} colorClass="bg-primary-500/20 text-primary-400" />
                    </>
                ) : (
                     <StatCard icon={ICONS.bookings} title={t('activeBookings')} value={bookings.filter(b => new Date(b.endDate) >= new Date()).length} colorClass="bg-blue-500/20 text-blue-400" />
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentUser.role === UserRole.Admin && (
                    <Card>
                        <h3 className="text-xl font-bold mb-4">{t('monthlyProfitLoss')}</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={financeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-text-secondary)" />
                                <XAxis dataKey="name" stroke="var(--color-text-secondary)" />
                                <YAxis stroke="var(--color-text-secondary)" unit={currency} tickFormatter={(val) => Number(val).toLocaleString(locale)} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid #cccccc', color: 'var(--color-text-primary)', direction: language === 'ar' ? 'rtl' : 'ltr' }} formatter={(value: number) => `${value.toLocaleString(locale)} ${currency}`} />
                                <Legend />
                                <Bar dataKey="income" fill="#32CD32" name={t('income')} />
                                <Bar dataKey="expense" fill="#FF4081" name={t('expenses')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                )}
                 <Card className={currentUser.role !== UserRole.Admin ? 'lg:col-span-2' : ''}>
                    <h3 className="text-xl font-bold mb-4">{t('upcomingBookingsAndRentedCars')}</h3>
                     <div className="space-y-4 max-h-[300px] overflow-y-auto">
                         {[...bookings].filter(b => new Date(b.endDate) >= new Date()).sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(booking => {
                             const car = cars.find(c => c.id === booking.carId);
                             return (
                                 <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                     <div>
                                         <p className="font-bold">{car?.make} {car?.model}</p>
                                         <p className="text-sm text-text-secondary">{customers.find(c=> c.id === booking.customerId)?.name}</p>
                                     </div>
                                     <div className="text-sm text-right">
                                         <p>{t('from')}: {booking.startDate}</p>
                                         <p>{t('to')}: {booking.endDate}</p>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                </Card>
            </div>
        </div>
    );
};

const FleetPage: React.FC<{ cars: Car[], onAddCar: (car: Omit<Car, 'id' | 'maintenanceHistory' | 'documents'>) => void, currentUser: User }> = ({ cars, onAddCar, currentUser }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const { t } = useTranslation();
    
    const CarCard = ({ car }: { car: Car }) => (
        <Card className="flex flex-col group">
            <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover rounded-lg mb-4" />
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">{car.make} {car.model}</h3>
            </div>
            <p className="text-text-secondary mb-4">{car.year} - {t(car.color) || car.color}</p>
             <p className="text-sm text-text-secondary mb-4 h-16 overflow-y-auto">{car.description}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-text-secondary mb-4">
                <p className="flex items-center gap-2"><FileText size={16} />{car.licensePlate}</p>
                <p className="flex items-center gap-2"><Settings size={16} />{car.engineCapacity}</p>
                <p className="flex items-center gap-2"><Fuel size={16} />{t(car.fuelType) || car.fuelType}</p>
                <p className="flex items-center gap-2"><CircleDollarSign size={16} />{car.pricePerDay} {t('currency')} / {t('day')}</p>
            </div>
             <div className="mt-auto space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                 <Button
                    disabled
                    className={`w-full !cursor-default ${
                        car.status === CarStatus.Available
                            ? '!bg-green-500 hover:!bg-green-500'
                            : car.status === CarStatus.Rented
                            ? '!bg-blue-500 hover:!bg-blue-500'
                            : '!bg-gray-400 hover:!bg-gray-400'
                    }`}
                >
                    {t(car.status)}
                </Button>
                <Link to={`/fleet/${car.id}`} className="w-full text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 group-hover:bg-primary-600 group-hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    {t('viewDetails')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </Card>
    );
    
    const AddCarModal = ({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (car: Omit<Car, 'id' | 'maintenanceHistory' | 'documents'>) => void }) => {
        const { t } = useTranslation();
        const initialFormState = {
            make: '', model: '', year: new Date().getFullYear(), color: '',
            licensePlate: '', engineCapacity: '', fuelType: 'Essence',
            status: CarStatus.Available, pricePerDay: 100, nextServiceDate: '', description: ''
        };
        const [formData, setFormData] = useState(initialFormState);
        const [imagePreview, setImagePreview] = useState<string | null>(null);

        const handleClose = () => {
            setFormData(initialFormState);
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
            setImagePreview(null);
            onClose();
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            if (type === 'file') {
                const input = e.target as HTMLInputElement;
                if (input.files && input.files[0]) {
                    const file = input.files[0];
                    const newImagePreview = URL.createObjectURL(file);
                    if (imagePreview) {
                        URL.revokeObjectURL(imagePreview);
                    }
                    setImagePreview(newImagePreview);
                }
            } else {
                setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value, 10) : value }));
            }
        };

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!imagePreview) {
                alert(t('pleaseSelectCarImage'));
                return;
            }
            onAdd({ ...formData, imageUrl: imagePreview });
            handleClose();
        };

        const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";

        return (
            <Modal isOpen={isOpen} onClose={handleClose} title={t('addNewCar')}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="make" placeholder={t('manufacturer')} value={formData.make} onChange={handleChange} className={inputClass} required />
                        <input name="model" placeholder={t('model')} value={formData.model} onChange={handleChange} className={inputClass} required />
                        <input name="year" type="number" placeholder={t('year')} value={formData.year} onChange={handleChange} className={inputClass} required />
                        <input name="color" placeholder={t('color')} value={formData.color} onChange={handleChange} className={inputClass} required />
                        <input name="licensePlate" placeholder={t('licensePlate')} value={formData.licensePlate} onChange={handleChange} className={inputClass} required />
                        <input name="engineCapacity" placeholder={t('engineCapacity')} value={formData.engineCapacity} onChange={handleChange} className={inputClass} required />
                        <input name="pricePerDay" type="number" placeholder={t('pricePerDay')} value={formData.pricePerDay} onChange={handleChange} className={inputClass} required />
                         <select name="fuelType" value={formData.fuelType} onChange={handleChange} className={inputClass}>
                            <option value="Essence">{t('Essence')}</option>
                            <option value="Diesel">{t('Diesel')}</option>
                            <option value="Électrique">{t('Électrique')}</option>
                        </select>
                         <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-text-secondary mb-1">{t('nextServiceDate')}</label>
                            <input name="nextServiceDate" type="date" value={formData.nextServiceDate} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">{t('description')}</label>
                             <div className="relative">
                                 <textarea name="description" placeholder={t('description')} value={formData.description} onChange={handleChange} className={`${inputClass} h-24`} />
                             </div>
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">{t('carImage')}</label>
                        <div className="mt-2 flex items-center gap-4">
                            <span className="inline-block h-20 w-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {imagePreview ? <img src={imagePreview} alt={t('preview')} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-gray-400">{ICONS.fleet}</div>}
                            </span>
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-text-primary font-semibold py-2 px-3 rounded-lg transition-colors">
                                <span>{t('selectImage')}</span>
                                <input id="file-upload" name="imageFile" type="file" className="sr-only" onChange={handleChange} accept="image/*" />
                            </label>
                        </div>
                    </div>
                     <Button type="submit" className="w-full">{ICONS.add} {t('addCar')}</Button>
                </form>
            </Modal>
        );
    };

    return (
        <div>
            {currentUser.role === UserRole.Admin && (
              <Button onClick={() => setAddModalOpen(true)}>{ICONS.add} {t('addCar')}</Button>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
            <AddCarModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={onAddCar} />
        </div>
    );
};

const AddCustomerModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (customerData: NewCustomerPayload) => Customer; }> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useTranslation();
    const initialFormState = { name: '', phone: '', email: '', nationalId: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [documents, setDocuments] = useState<Omit<CustomerDocument, 'id'>[]>([]);
    const [docName, setDocName] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddDocument = async () => {
        if (docName && docFile) {
            const fileUrl = await fileToBase64(docFile);
            setDocuments(prev => [...prev, { name: docName, fileUrl }]);
            setDocName('');
            setDocFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    
    const handleRemoveDocument = (indexToRemove: number) => {
        setDocuments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleClose = () => {
        setDocuments([]);
        setDocName('');
        setDocFile(null);
        setFormData(initialFormState);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ ...formData, documents });
        handleClose();
    };

    const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('addNewCustomer')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder={t('fullName')} value={formData.name} onChange={handleChange} className={inputClass} required />
                <input name="phone" type="tel" placeholder={t('phoneNumber')} value={formData.phone} onChange={handleChange} className={inputClass} required />
                <input name="nationalId" placeholder={t('nationalId')} value={formData.nationalId} onChange={handleChange} className={inputClass} required />
                <input name="email" type="email" placeholder={t('emailOptional')} value={formData.email} onChange={handleChange} className={inputClass} />
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-2">{t('documents')}</h4>
                    <div className="space-y-2 mb-4">
                        {documents.length === 0 && <p className="text-text-secondary text-sm">{t('noDocumentsAdded')}</p>}
                        {documents.map((doc, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                <span className="text-sm">{doc.name}</span>
                                <button type="button" onClick={() => handleRemoveDocument(index)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                       <input type="text" placeholder={t('documentName')} value={docName} onChange={e => setDocName(e.target.value)} className={inputClass} />
                       <input type="file" ref={fileInputRef} onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)} className={`${inputClass} text-sm`} />
                    </div>
                    <Button type="button" onClick={handleAddDocument} disabled={!docName || !docFile} className="w-full mt-2 !bg-gray-600 hover:!bg-gray-700">{t('addDocumentToList')}</Button>
                </div>

                <Button type="submit" className="w-full">{t('addCustomer')}</Button>
            </form>
        </Modal>
    );
};

const AddBookingModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (bookingData: Omit<Booking, 'id' | 'isNew'>, transactionData: Omit<Transaction, 'id'>) => void;
    onUpdate?: (booking: Booking) => void;
    onAddCustomer: (customerData: NewCustomerPayload) => Customer; 
    cars: Car[]; 
    customers: Customer[]; 
    bookings: Booking[]; 
    seasons: Season[];
    initialData?: { carId: string; startDate: string; };
    editingBooking?: Booking | null;
}> = ({ isOpen, onClose, onAdd, onUpdate, onAddCustomer, cars, customers, bookings, seasons, initialData, editingBooking }) => {
    const { t } = useTranslation();
    const isEditMode = !!editingBooking;
    const initialFormState = { carId: '', customerId: '', startDate: '', endDate: '' };
    
    const [formData, setFormData] = useState(initialFormState);
    const [totalPrice, setTotalPrice] = useState(0);
    const [availabilityError, setAvailabilityError] = useState('');
    const [isAddCustomerModalOpen, setAddCustomerModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setFormData({
                    carId: editingBooking.carId,
                    customerId: editingBooking.customerId,
                    startDate: editingBooking.startDate,
                    endDate: editingBooking.endDate,
                });
            } else {
                 setFormData({ ...initialFormState, ...initialData });
            }
        }
    }, [isOpen, initialData, editingBooking, isEditMode]);

    useEffect(() => {
        if (!formData.carId || !formData.startDate || !formData.endDate) {
            setTotalPrice(0);
            setAvailabilityError('');
            return;
        }

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);

        if (start >= end) {
            setAvailabilityError(t('datesInvalid'));
            setTotalPrice(0);
            return;
        }

        const isUnavailable = bookings.some(b => 
            b.id !== editingBooking?.id &&
            b.carId === formData.carId && 
            new Date(formData.startDate) < new Date(b.endDate) && 
            new Date(formData.endDate) > new Date(b.startDate)
        );
        
        if (isUnavailable) {
            setAvailabilityError(t('carUnavailableInDates'));
            setTotalPrice(0);
        } else {
            setAvailabilityError('');
            const car = cars.find(c => c.id === formData.carId);
            if (!car) {
                setTotalPrice(0);
                return;
            }

            let calculatedPrice = 0;
            let currentDate = new Date(start);
            while (currentDate < end) {
                const season = seasons.find(s => {
                    const seasonStart = new Date(s.startDate);
                    const seasonEnd = new Date(s.endDate);
                    return currentDate >= seasonStart && currentDate <= seasonEnd;
                });
                const multiplier = season ? season.multiplier : 1;
                calculatedPrice += car.pricePerDay * multiplier;
                currentDate.setDate(currentDate.getDate() + 1);
            }
            setTotalPrice(calculatedPrice);
        }

    }, [formData, cars, bookings, seasons, t, editingBooking]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleAddNewCustomer = (customerData: NewCustomerPayload) => {
        const newCustomer = onAddCustomer(customerData);
        if (newCustomer) {
            setFormData(prev => ({ ...prev, customerId: newCustomer.id }));
        }
        setAddCustomerModalOpen(false);
        return newCustomer;
    };
    
    const handleClose = () => {
        setFormData(initialFormState);
        setAvailabilityError('');
        setTotalPrice(0);
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (availabilityError || !totalPrice || !formData.carId || !formData.customerId) return;
        
        if(isEditMode && onUpdate && editingBooking) {
            const updatedBooking: Booking = {
                ...editingBooking,
                ...formData,
                totalPrice,
            };
            onUpdate(updatedBooking);
        } else {
            const car = cars.find(c => c.id === formData.carId);
            const bookingData = { ...formData, totalPrice };
            const transactionData = {
                type: TransactionType.Income,
                category: TransactionCategory.Rental,
                description: `${t('Rental')} ${car?.make} ${car?.model}`,
                amount: totalPrice,
                date: formData.startDate,
                carId: formData.carId,
            };
            onAdd(bookingData, transactionData);
        }
        handleClose();
    };
    
    const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? t('editBooking') : t('addNewBooking')}>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="flex items-center gap-2">
                        <select name="customerId" value={formData.customerId} onChange={handleChange} className={inputClass} required>
                            <option value="">{t('selectCustomer')}</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                         <Button type="button" onClick={() => setAddCustomerModalOpen(true)} className="!bg-gray-200 hover:!bg-gray-300 !text-gray-800 dark:!bg-gray-700 dark:hover:!bg-gray-600 dark:!text-gray-200 whitespace-nowrap text-sm py-2 px-3">
                            {ICONS.add} {t('addCustomer')}
                        </Button>
                    </div>
                    <select name="carId" value={formData.carId} onChange={handleChange} className={inputClass} required>
                        <option value="">{t('selectCar')}</option>
                        {cars.filter(c => c.status === CarStatus.Available || (isEditMode && c.id === editingBooking.carId)).map(c => <option key={c.id} value={c.id}>{c.make} {c.model} - {c.licensePlate}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-text-secondary">{t('startDate')}</label>
                            <input name="startDate" type="date" value={formData.startDate} onChange={handleChange} className={inputClass} required />
                        </div>
                         <div>
                            <label className="text-sm text-text-secondary">{t('endDate')}</label>
                            <input name="endDate" type="date" value={formData.endDate} onChange={handleChange} className={inputClass} required />
                        </div>
                    </div>
                    {availabilityError && <p className="text-red-400 text-sm">{availabilityError}</p>}
                    {totalPrice > 0 && <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"><span className="text-text-secondary">{t('totalPrice')}: </span><span className="font-bold text-xl">{totalPrice.toLocaleString()} {t('currency')}</span></div>}
                    <Button type="submit" disabled={!!availabilityError || !totalPrice} className="w-full">{isEditMode ? t('saveChanges') : t('bookNow')}</Button>
                </form>
            </Modal>
            <AddCustomerModal isOpen={isAddCustomerModalOpen} onClose={() => setAddCustomerModalOpen(false)} onAdd={handleAddNewCustomer} />
        </>
    );
};

const BookingsPage: React.FC<{ bookings: Booking[]; cars: Car[]; customers: Customer[]; seasons: Season[]; companyInfo: {name: string}; onAddBooking: (bookingData: Omit<Booking, 'id' | 'isNew'>, transactionData: Omit<Transaction, 'id'>) => void; onAddCustomer: (customerData: NewCustomerPayload) => Customer; }> = ({ bookings, cars, customers, seasons, companyInfo, onAddBooking, onAddCustomer }) => {
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const { t } = useTranslation();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const generateWhatsAppLink = (phone: string, message: string) => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div>
            <Button onClick={() => setAddModalOpen(true)}>{ICONS.add} {t('newBooking')}</Button>
            <Card className="mt-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4 text-start">{t('car')}</th>
                                <th className="p-4 text-start">{t('customer')}</th>
                                <th className="p-4 text-start">{t('startDate')}</th>
                                <th className="p-4 text-start">{t('endDate')}</th>
                                <th className="p-4 text-start">{t('totalPrice')}</th>
                                <th className="p-4 text-start">{t('status')}</th>
                                <th className="p-4 text-start">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...bookings].sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(booking => {
                                const car = cars.find(c => c.id === booking.carId);
                                const customer = customers.find(c => c.id === booking.customerId);
                                const isPast = new Date(booking.endDate) < new Date();
                                return (
                                <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-4 font-semibold">{car?.make} {car?.model}</td>
                                    <td className="p-4">{customer?.name}</td>
                                    <td className="p-4">{booking.startDate}</td>
                                    <td className="p-4">{booking.endDate}</td>
                                    <td className="p-4">{booking.totalPrice.toLocaleString()} {t('currency')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${isPast ? 'bg-gray-500 text-white' : 'bg-green-500 text-white'}`}>
                                            {isPast ? t('finished') : t('active')}
                                        </span>
                                    </td>
                                    <td className="p-4 relative">
                                        <button onClick={() => setOpenMenu(openMenu === booking.id ? null : booking.id)} className="text-text-secondary hover:text-text-primary">{ICONS.more}</button>
                                        {openMenu === booking.id && (
                                            <div ref={menuRef} className="absolute end-0 top-12 bg-surface border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 w-56">
                                                <Link to={`/booking/${booking.id}/check`} className="flex items-center gap-2 w-full text-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800">{ICONS.fleet} {t('vehicleCheck')}</Link>
                                                <Link to={`/booking/${booking.id}/contract`} className="flex items-center gap-2 w-full text-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800"><Printer className="h-4 w-4"/> {t('printContract')}</Link>
                                                <a href={generateWhatsAppLink(customer?.phone || '', t('whatsapp_confirmation_message', {customerName: customer?.name || '', carName: `${car?.make} ${car?.model}`, startDate: booking.startDate, endDate: booking.endDate, totalPrice: booking.totalPrice.toLocaleString(), currency: t('currency'), companyName: companyInfo.name}))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full text-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800">{ICONS.whatsapp} {t('confirmViaWhatsapp')}</a>
                                                <a href={generateWhatsAppLink(customer?.phone || '', t('whatsapp_pickup_reminder_message', {customerName: customer?.name || '', carName: `${car?.make} ${car?.model}`, startDate: booking.startDate, companyName: companyInfo.name}))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full text-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800">{ICONS.whatsapp} {t('sendPickupReminder')}</a>
                                                <a href={generateWhatsAppLink(customer?.phone || '', t('whatsapp_return_reminder_message', {customerName: customer?.name || '', carName: `${car?.make} ${car?.model}`, endDate: booking.endDate, companyName: companyInfo.name}))} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full text-start p-2 hover:bg-gray-100 dark:hover:bg-gray-800">{ICONS.whatsapp} {t('sendReturnReminder')}</a>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
             <AddBookingModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={onAddBooking} onAddCustomer={onAddCustomer} cars={cars} customers={customers} bookings={bookings} seasons={seasons} />
        </div>
    );
};

const AddExpenseModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (record: Omit<Transaction, 'id' | 'type'>) => void; }> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useTranslation();
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        category: TransactionCategory.Maintenance,
        description: '',
        amount: 0
    };
    const [formData, setFormData] = useState<Omit<Transaction, 'id'|'type'>>(initialFormState);
    const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? Number(value) : value}));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData(initialFormState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addNewExpense')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block text-sm font-medium text-text-secondary">{t('date')}</label>
                <input name="date" type="date" value={formData.date} onChange={handleChange} className={inputClass} required />
                
                <label className="block text-sm font-medium text-text-secondary">{t('category')}</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                    {Object.values(TransactionCategory).filter(cat => cat !== TransactionCategory.Rental && cat !== TransactionCategory.ExtraFee).map(cat => <option key={cat} value={cat}>{t(cat)}</option>)}
                </select>

                <label className="block text-sm font-medium text-text-secondary">{t('description')}</label>
                <input name="description" placeholder={t('expenseDetails')} value={formData.description} onChange={handleChange} className={inputClass} required />
                
                <label className="block text-sm font-medium text-text-secondary">{t('amount')}</label>
                <input name="amount" type="number" placeholder={t('amount')} value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})} className={inputClass} required />
                
                <Button type="submit" className="w-full">{t('addExpense')}</Button>
            </form>
        </Modal>
    );
};

const FinancePage: React.FC<{ transactions: Transaction[], onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void; }> = ({ transactions, onAddTransaction }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const { t, language } = useTranslation();
    const currency = t('currency');
    const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';


    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date);
            const start = dateRange.start ? new Date(dateRange.start) : null;
            const end = dateRange.end ? new Date(dateRange.end) : null;
            if (start && date < start) return false;
            if (end && date > end) return false;
            return true;
        }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, dateRange]);

    const totalIncome = filteredTransactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filteredTransactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;
    
    const handleAddExpense = (expenseData: Omit<Transaction, 'id' | 'type'>) => {
        onAddTransaction({ ...expenseData, type: TransactionType.Expense });
    };

    const handleExport = () => {
        const headers = [t('date'), t('type'), t('category'), t('description'), t('amount')];
        const rows = filteredTransactions.map(tr => [tr.date, t(tr.type), t(tr.category), tr.description, tr.amount]);
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transactions_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const inputClass = "p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";
    
    return (
        <div>
             <div className="flex justify-between items-center">
                <Button onClick={() => setAddModalOpen(true)}>{ICONS.add} {t('addExpense')}</Button>
                <div className="flex items-center gap-4">
                     <Button onClick={handleExport} className="text-sm py-2 px-3 bg-gray-600 hover:bg-gray-700">
                        {ICONS.export} {t('exportToCsv')}
                    </Button>
                    <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} className={inputClass} />
                    <span>-</span>
                    <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                <Card className="text-center"><p className="text-text-secondary">{t('totalIncome')}</p><p className="text-2xl font-bold text-green-500">{totalIncome.toLocaleString(locale)} {currency}</p></Card>
                <Card className="text-center"><p className="text-text-secondary">{t('totalExpenses')}</p><p className="text-2xl font-bold text-expense-500">{totalExpense.toLocaleString(locale)} {currency}</p></Card>
                <Card className="text-center"><p className="text-text-secondary">{t('netProfit')}</p><p className="text-2xl font-bold text-primary-500">{netProfit.toLocaleString(locale)} {currency}</p></Card>
            </div>

            <Card>
                <h3 className="text-xl font-bold mb-4">{t('transactionLog')}</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                             <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4 text-start">{t('date')}</th>
                                <th className="p-4 text-start">{t('type')}</th>
                                <th className="p-4 text-start">{t('category')}</th>
                                <th className="p-4 text-start">{t('description')}</th>
                                <th className="p-4 text-end">{t('amount')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(tr => (
                                <tr key={tr.id} className="border-b border-gray-100 dark:border-gray-800">
                                    <td className="p-4">{tr.date}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${tr.type === TransactionType.Income ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : 'bg-expense-100 dark:bg-expense-900 text-expense-700 dark:text-expense-200'}`}>
                                            {t(tr.type)}
                                        </span>
                                    </td>
                                    <td className="p-4">{t(tr.category)}</td>
                                    <td className="p-4">{tr.description}</td>
                                    <td className={`p-4 text-end font-semibold ${tr.type === TransactionType.Income ? 'text-green-500' : 'text-expense-500'}`}>
                                        {tr.type === TransactionType.Income ? '+' : '-'} {tr.amount.toLocaleString(locale)} {currency}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddExpense} />
        </div>
    );
};

const ReportsPage: React.FC<{ cars: Car[], transactions: Transaction[], bookings: Booking[] }> = ({ cars, transactions, bookings }) => {
    const { t, language } = useTranslation();
    const currency = t('currency');
    const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';

    const expenseByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        transactions.filter(t => t.type === TransactionType.Expense).forEach(t => {
            const categoryName = t.category;
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + t.amount;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name: t(name), value }));
    }, [transactions, t]);

    const carProfitability = useMemo(() => {
        return cars.map(car => {
            const income = transactions.filter(t => t.carId === car.id && t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
            const expense = transactions.filter(t => t.carId === car.id && t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
            return {
                name: `${car.make} ${car.model}`,
                income,
                expense,
                netProfit: income - expense
            };
        }).sort((a, b) => b.netProfit - a.netProfit);
    }, [cars, transactions]);

    const PIE_COLORS = ['#FF4081', '#0088FE', '#00C49F', '#FFBB28', '#AF19FF'];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="text-xl font-bold mb-4">{t('expenseAnalysisByCategory')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => `${value.toLocaleString(locale)} ${currency}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold mb-4">{t('carProfitability')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={carProfitability} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" stroke="var(--color-text-secondary)" unit={currency} tickFormatter={(val) => Number(val).toLocaleString(locale)} />
                            <YAxis type="category" dataKey="name" width={120} stroke="var(--color-text-secondary)" />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString(locale)} ${currency}`} />
                            <Legend />
                            <Bar dataKey="netProfit" fill="#8884d8" name={t('netProfitPerCar')} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

const CustomersPage: React.FC<{ customers: Customer[]; onAddCustomer: (customer: NewCustomerPayload) => Customer; onUpdateCustomer: (customer: Customer) => void; }> = ({ customers, onAddCustomer, onUpdateCustomer }) => {
    const { t } = useTranslation();
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isViewDocsModalOpen, setViewDocsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [docName, setDocName] = useState('');
    const [docFile, setDocFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleViewDocuments = (customer: Customer) => {
        setSelectedCustomer(customer);
        setViewDocsModalOpen(true);
    };

    const handleAddDocument = async () => {
        if (!selectedCustomer || !docName || !docFile) {
            alert(t('documentNameAndFileRequired'));
            return;
        }
        const fileUrl = await fileToBase64(docFile);
        const newDocument: CustomerDocument = {
            id: `cdoc-${Date.now()}`,
            name: docName,
            fileUrl: fileUrl
        };
        const updatedCustomer = {
            ...selectedCustomer,
            documents: [...selectedCustomer.documents, newDocument]
        };
        onUpdateCustomer(updatedCustomer);
        setSelectedCustomer(updatedCustomer);
        setDocName('');
        setDocFile(null);
        if(fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleRemoveDocument = (docId: string) => {
        if (!selectedCustomer) return;
        const updatedDocs = selectedCustomer.documents.filter(d => d.id !== docId);
        const updatedCustomer = {...selectedCustomer, documents: updatedDocs};
        onUpdateCustomer(updatedCustomer);
        setSelectedCustomer(updatedCustomer);
    };

    return (
        <div>
            <Button onClick={() => setAddModalOpen(true)}>{ICONS.add} {t('addCustomer')}</Button>
            <Card className="mt-8">
                 <div className="overflow-x-auto">
                    <table className="w-full text-start">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="p-4 text-start">{t('name')}</th>
                                <th className="p-4 text-start">{t('phoneNumber')}</th>
                                <th className="p-4 text-start">{t('nationalId')}</th>
                                <th className="p-4 text-start">{t('email')}</th>
                                <th className="p-4 text-start">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map(customer => (
                                <tr key={customer.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="p-4 font-semibold">{customer.name}</td>
                                    <td className="p-4">{customer.phone}</td>
                                    <td className="p-4">{customer.nationalId}</td>
                                    <td className="p-4">{customer.email}</td>
                                    <td className="p-4">
                                        <Button onClick={() => handleViewDocuments(customer)} className="text-sm !py-1 !px-2 bg-gray-600 hover:bg-gray-700">{t('viewDocuments')}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <AddCustomerModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAdd={onAddCustomer} />
            
            <Modal isOpen={isViewDocsModalOpen} onClose={() => setViewDocsModalOpen(false)} title={`${t('customerDocuments')} - ${selectedCustomer?.name}`}>
                <div className="space-y-4">
                    <div className="space-y-2">
                        {selectedCustomer?.documents.length === 0 && <p className="text-text-secondary">{t('noCustomerDocuments')}</p>}
                        {selectedCustomer?.documents.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline font-medium">{doc.name}</a>
                                <div className="flex items-center gap-4">
                                    <a href={doc.fileUrl} download={doc.name} className="text-text-secondary hover:text-primary-600" title={t('download')}>
                                        <Download size={16} />
                                    </a>
                                    <button onClick={() => handleRemoveDocument(doc.id)} className="text-red-500 hover:text-red-700" title={t('delete')}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <h4 className="font-bold">{t('addDocument')}</h4>
                        <input type="text" placeholder={t('documentName')} value={docName} onChange={e => setDocName(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" />
                        <input type="file" ref={fileInputRef} onChange={e => setDocFile(e.target.files ? e.target.files[0] : null)} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" />
                        <Button onClick={handleAddDocument} className="w-full">{t('addThisDocument')}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

const BookingDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    car: Car | null | undefined;
    customer: Customer | null | undefined;
    onDelete: (bookingId: string) => void;
    onEdit: (booking: Booking) => void;
}> = ({ isOpen, onClose, booking, car, customer, onDelete, onEdit }) => {
    const { t } = useTranslation();

    if (!isOpen || !booking || !car || !customer) return null;

    const handleDelete = () => {
        if (window.confirm(t('confirmDeleteBooking'))) {
            onDelete(booking.id);
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('bookingDetails')}>
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold">{t('car')}</h4>
                    <p>{car.make} {car.model} ({car.licensePlate})</p>
                </div>
                <div>
                    <h4 className="font-bold">{t('customer')}</h4>
                    <p>{customer.name} ({customer.phone})</p>
                </div>
                <div>
                    <h4 className="font-bold">{t('rentalPeriodDetails')}</h4>
                    <p>{t('from')}: {booking.startDate} {t('to')}: {booking.endDate}</p>
                </div>
                 <div>
                    <h4 className="font-bold">{t('totalPrice')}</h4>
                    <p>{booking.totalPrice.toLocaleString()} {t('currency')}</p>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={onClose} className="!bg-gray-600 hover:!bg-gray-700">{t('close')}</Button>
                    <Button onClick={() => onEdit(booking)} className="!bg-blue-600 hover:!bg-blue-700">{t('edit')}</Button>
                    <Button onClick={handleDelete} className="!bg-red-600 hover:!bg-red-700">{t('deleteBooking')}</Button>
                </div>
            </div>
        </Modal>
    )
}


const CalendarPage: React.FC<{ 
    bookings: Booking[], 
    cars: Car[], 
    customers: Customer[],
    seasons: Season[],
    onAddBooking: (bookingData: Omit<Booking, 'id' | 'isNew'>, transactionData: Omit<Transaction, 'id'>) => void;
    onAddCustomer: (customerData: NewCustomerPayload) => Customer;
    onUpdateBooking: (booking: Booking) => void;
    onDeleteBooking: (bookingId: string) => void;
}> = ({ bookings, cars, customers, seasons, onAddBooking, onAddCustomer, onUpdateBooking, onDeleteBooking }) => {
    const { t, language } = useTranslation();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [prefilledBooking, setPrefilledBooking] = useState<{carId: string, startDate: string} | null>(null);
    const [bookingToEdit, setBookingToEdit] = useState<Booking | null>(null);
    
    const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
    const [draggingBooking, setDraggingBooking] = useState<{booking: Booking} | null>(null);

    const handleQuickAdd = (carId: string, date: Date) => {
        setBookingToEdit(null);
        setPrefilledBooking({ carId, startDate: formatDate(date) });
        setAddEditModalOpen(true);
    };
    
    const handleEditBooking = (booking: Booking) => {
        setBookingToEdit(booking);
        setPrefilledBooking(null);
        setSelectedBookingForDetail(null);
        setAddEditModalOpen(true);
    };

    const handleDeleteBookingPress = (bookingId: string) => {
        if(window.confirm(t('confirmDeleteBooking'))) {
            onDeleteBooking(bookingId);
        }
    };

    const handleCloseAddEditModal = () => {
        setAddEditModalOpen(false);
        setPrefilledBooking(null);
        setBookingToEdit(null);
    };
    
    const handleBookingClick = (booking: Booking) => {
        setSelectedBookingForDetail(booking);
    };

    const handleCloseDetailModal = () => {
        setSelectedBookingForDetail(null);
    };

    const dateManipulation = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (language === 'ar' ? 0 : 1)); 
        if(language === 'ar') startOfWeek.setDate(startOfWeek.getDate() -1); // Start week on Saturday for AR
        
        const dates = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(date.getDate() + i);
            return date;
        });
        return { startOfWeek, dates };
    }, [currentDate, language]);

    const { dates } = dateManipulation;

    const navigateWeeks = (direction: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + 7 * direction);
            return newDate;
        });
    };
    
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const isToday = (d: Date) => isSameDay(d, new Date());
    
    const relevantBookings = useMemo(() => {
        const viewStart = dates[0];
        const viewEnd = dates[dates.length - 1];
        viewEnd.setHours(23, 59, 59, 999);
        
        return bookings.filter(b => 
            new Date(b.startDate) <= viewEnd && new Date(b.endDate) >= viewStart
        );
    }, [bookings, dates]);
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, booking: Booking) => {
        setDraggingBooking({booking});
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); 
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, carId: string, date: Date) => {
        e.preventDefault();
        if (!draggingBooking) return;

        // If dropping on the same car, do nothing
        if (draggingBooking.booking.carId === carId) {
            handleDragEnd();
            return;
        }

        const originalBooking = draggingBooking.booking;
        const originalStartDate = new Date(originalBooking.startDate);
        const originalEndDate = new Date(originalBooking.endDate);

        // Check for conflicts with the new car
        const conflict = bookings.some(b => 
            b.id !== originalBooking.id &&
            b.carId === carId && 
            new Date(b.startDate) < originalEndDate && 
            new Date(b.endDate) > originalStartDate
        );

        if(conflict) {
            alert(t('bookingConflictError'));
            setDraggingBooking(null); // Explicitly reset dragging state
            return;
        }

        const updatedBooking = {
            ...originalBooking,
            carId: carId,
        };
        onUpdateBooking(updatedBooking);
    };

    const handleDragEnd = () => {
        setDraggingBooking(null);
    };


    return (
      <>
        <Card>
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigateWeeks(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">&lt;</button>
                     <h3 className="text-xl font-bold">{dates[0].toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {month: 'long', day: 'numeric'})} - {dates[6].toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {month: 'long', day: 'numeric', year: 'numeric'})}</h3>
                    <button onClick={() => navigateWeeks(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">&gt;</button>
                </div>
                 <Button onClick={() => setCurrentDate(new Date())} className="text-sm !py-1 !px-2 bg-gray-600 hover:bg-gray-700">{t('today')}</Button>
            </div>
            <div className="overflow-x-auto relative">
                <div className="grid min-w-[1200px]" style={{
                    gridTemplateColumns: `150px repeat(7, 1fr)`,
                }}>
                    {/* Corner */}
                    <div className="sticky top-0 start-0 z-30 bg-surface border-b border-e border-gray-200 dark:border-gray-700"></div> 
                    {/* Date Headers */}
                    {dates.map(date => (
                        <div key={date.toString()} className={`sticky top-0 bg-surface z-20 text-center p-2 border-b border-gray-200 dark:border-gray-700 font-semibold ${isToday(date) ? 'bg-primary-100 dark:bg-primary-950' : ''}`}>
                            <p className="text-sm">{date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR', {weekday: 'short'})}</p>
                            <p className="text-lg">{date.getDate()}</p>
                        </div>
                    ))}
                    
                    {/* Car Rows & Day Cells */}
                    {cars.map(car => (
                       <React.Fragment key={car.id}>
                           <div className="sticky start-0 bg-surface z-20 p-2 border-b border-e border-gray-200 dark:border-gray-700 flex flex-col justify-center font-bold text-sm">
                               {car.make} {car.model}
                               <span className="font-normal text-xs text-text-secondary">{car.licensePlate}</span>
                           </div>
                           {dates.map(date => {
                               const isBooked = relevantBookings.some(b => b.carId === car.id && date >= new Date(b.startDate) && date < new Date(b.endDate));
                               const isMaintenance = car.nextServiceDate && isSameDay(date, new Date(car.nextServiceDate));
                               return (
                                   <div 
                                       key={date.toString()} 
                                       onDragOver={handleDragOver}
                                       onDrop={(e) => handleDrop(e, car.id, date)}
                                       className={`relative h-20 border-b border-e border-gray-200 dark:border-gray-700 group day-cell
                                        ${isToday(date) ? 'bg-primary-50 dark:bg-primary-950/50' : ''}
                                        ${!isBooked && !isMaintenance ? 'hover:bg-green-50 dark:hover:bg-green-950/50' : ''}
                                   `}>
                                       {isMaintenance && <div className="absolute top-1 end-1 text-text-secondary" title={t('Maintenance')}><Wrench size={16}/></div>}
                                       {!isBooked && !isMaintenance && (
                                          <button 
                                            onClick={() => handleQuickAdd(car.id, date)} 
                                            className="absolute inset-0 w-full h-full flex items-center justify-center bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={t('addBookingOnDate', {date: date.toLocaleDateString()})}>
                                               <div className="p-2 rounded-full bg-primary-600 text-white">{ICONS.add}</div>
                                          </button>
                                       )}
                                   </div>
                               );
                            })}
                       </React.Fragment>
                    ))}

                </div>
                 {/* Booking Blocks - Rendered on top of the grid */}
                 <div className="absolute top-0 start-0 w-full h-full pointer-events-none" style={{
                    display: 'grid',
                    gridTemplateColumns: `150px repeat(7, 1fr)`,
                    gridTemplateRows: `49px repeat(${cars.length}, 80px)`,
                    gridAutoFlow: 'dense',
                 }}>
                    {relevantBookings.map(booking => {
                        const carIndex = cars.findIndex(c => c.id === booking.carId);
                        if(carIndex === -1) return null;

                        const bookingStart = new Date(booking.startDate);
                        const bookingEnd = new Date(booking.endDate);
                        
                        let startDayIndex = dates.findIndex(d => isSameDay(d, bookingStart));
                        if(startDayIndex === -1 && bookingStart < dates[0]) {
                            startDayIndex = 0;
                        }
                        
                        let durationInDays = Math.ceil((bookingEnd.getTime() - bookingStart.getTime()) / (1000 * 3600 * 24));
                        
                        if (bookingStart < dates[0]) {
                            durationInDays = Math.ceil((bookingEnd.getTime() - dates[0].getTime()) / (1000 * 3600 * 24));
                        }
                        if(startDayIndex + durationInDays > 7) {
                            durationInDays = 7 - startDayIndex;
                        }

                        if(startDayIndex === -1 || durationInDays <= 0) return null;

                        const customer = customers.find(c => c.id === booking.customerId);

                        return (
                            <div 
                                key={booking.id} 
                                draggable="true"
                                onDragStart={(e) => handleDragStart(e, booking)}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleBookingClick(booking)}
                                title={`${customer?.name} - ${t('dragToModify')}`}
                                style={{
                                    gridRow: carIndex + 2,
                                    gridColumn: `${startDayIndex + 2} / span ${durationInDays}`
                                }} 
                                className={`bg-blue-500 text-white text-xs p-1 rounded-lg m-1 flex items-center justify-center overflow-hidden z-10 pointer-events-auto cursor-grab active:cursor-grabbing group relative ${draggingBooking?.booking.id === booking.id ? 'opacity-50' : ''}`}>
                                <span className="truncate font-semibold">{customer?.name}</span>
                                <div className="absolute end-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                                    <button onClick={(e) => { e.stopPropagation(); handleEditBooking(booking); }} className="p-1 rounded bg-black/30 hover:bg-black/50" title={t('edit')}><Pencil size={12} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBookingPress(booking.id); }} className="p-1 rounded bg-black/30 hover:bg-black/50" title={t('delete')}><Trash2 size={12} /></button>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
        </Card>
        <AddBookingModal 
            isOpen={isAddEditModalOpen}
            onClose={handleCloseAddEditModal}
            onAdd={onAddBooking}
            onUpdate={onUpdateBooking}
            onAddCustomer={onAddCustomer}
            cars={cars}
            customers={customers}
            bookings={bookings}
            seasons={seasons}
            initialData={prefilledBooking || undefined}
            editingBooking={bookingToEdit}
        />
        <BookingDetailModal
            isOpen={!!selectedBookingForDetail}
            onClose={handleCloseDetailModal}
            booking={selectedBookingForDetail}
            car={cars.find(c => c.id === selectedBookingForDetail?.carId)}
            customer={customers.find(c => c.id === selectedBookingForDetail?.customerId)}
            onDelete={onDeleteBooking}
            onEdit={(booking) => {
                handleCloseDetailModal();
                handleEditBooking(booking);
            }}
        />
      </>
    );
};


const CarDetailsPage: React.FC<{ cars: Car[], onUpdateCar: (car: Car) => void; onAddTransaction: (transaction: Omit<Transaction, 'id'| 'type'>) => void; }> = ({ cars, onUpdateCar, onAddTransaction }) => {
    const { id } = useParams<{ id: string }>();
    const car = cars.find(c => c.id === id);
    const [isMaintModalOpen, setMaintModalOpen] = useState(false);
    const [isDocModalOpen, setDocModalOpen] = useState(false);
    const { t } = useTranslation();

    if (!car) return <div className="text-center p-8"><h2 className="text-2xl font-bold text-red-500">{t('error')}</h2><p>{t('carNotFound')}</p><Link to="/fleet"><Button className="mt-4">{t('backToFleet')}</Button></Link></div>;

    const handleAddMaintenance = (record: Omit<MaintenanceRecord, 'id'>) => {
        const newRecord = { ...record, id: `maint-${Date.now()}` };
        const updatedCar = { ...car, maintenanceHistory: [...car.maintenanceHistory, newRecord] };
        onUpdateCar(updatedCar);
        onAddTransaction({
            date: record.date,
            category: TransactionCategory.Maintenance,
            description: `${t(TransactionCategory.Maintenance)} - ${car.make} ${car.model}: ${record.description}`,
            amount: record.cost,
            carId: car.id
        });
    };
    
    const handleAddDocument = (record: Omit<DocumentRecord, 'id'>) => {
        const newRecord = { ...record, id: `doc-${Date.now()}` };
        const updatedCar = { ...car, documents: [...car.documents, newRecord] };
        onUpdateCar(updatedCar);
    };

    const getStatusInfo = (days: number) => {
        if (days < 0) return { text: t('expired'), color: 'text-red-500' };
        if (days <= 30) return { text: t('expires_soon_period', { days }), color: 'text-yellow-500' };
        return { text: t('valid_period', { days }), color: 'text-green-500' };
    };

    return (
        <div className="space-y-8">
            <Card>
                 <div className="flex flex-col md:flex-row gap-8">
                    <img src={car.imageUrl} alt={`${car.make} ${car.model}`} className="w-full md:w-1/3 h-64 object-cover rounded-lg" />
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold">{car.make} {car.model}</h2>
                        <p className="text-text-secondary mt-1 mb-4">{car.year} - {t(car.color) || car.color}</p>
                        <p className="mb-6">{car.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-text-secondary">
                            <p><strong>{t('licensePlate')}:</strong> {car.licensePlate}</p>
                            <p><strong>{t('engineCapacity')}:</strong> {car.engineCapacity}</p>
                            <p><strong>{t('fuelType')}:</strong> {t(car.fuelType) || car.fuelType}</p>
                            <p><strong>{t('pricePerDay')}:</strong> {car.pricePerDay} {t('currency')}</p>
                        </div>
                         <div className={`mt-4 p-3 rounded-lg text-center font-bold ${car.status === CarStatus.Available ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{t('status')}: {t(car.status)}</div>
                    </div>
                 </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{t('maintenanceHistory')}</h3>
                        <Button onClick={() => setMaintModalOpen(true)} className="text-sm !py-1 !px-2">{ICONS.add} {t('addRecord')}</Button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {car.maintenanceHistory.length === 0 && <p className="text-text-secondary">{t('noMaintenanceRecords')}</p>}
                        {car.maintenanceHistory.map(r => (
                            <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-semibold">{r.description}</p>
                                <p className="text-sm text-text-secondary">{r.date} - {r.cost} {t('currency')}</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">{t('carDocuments')}</h3>
                        <Button onClick={() => setDocModalOpen(true)} className="text-sm !py-1 !px-2">{ICONS.add} {t('addDocument')}</Button>
                    </div>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                         {car.documents.length === 0 && <p className="text-text-secondary">{t('noDocuments')}</p>}
                         {car.documents.map(d => {
                            const daysRemaining = getDaysUntil(d.expiryDate);
                            const status = getStatusInfo(daysRemaining);
                            return (
                                <div key={d.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{d.name}</p>
                                        <p className={`text-sm ${status.color}`}>{t('expires')}: {d.expiryDate} ({status.text})</p>
                                    </div>
                                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"><Button className="text-sm !py-1 !px-2 bg-gray-600 hover:bg-gray-700">{t('viewDocument')}</Button></a>
                                </div>
                            );
                         })}
                    </div>
                </Card>
            </div>

            <AddMaintenanceModal isOpen={isMaintModalOpen} onClose={() => setMaintModalOpen(false)} onAdd={handleAddMaintenance} />
            <AddDocumentModal isOpen={isDocModalOpen} onClose={() => setDocModalOpen(false)} onAdd={handleAddDocument} />
        </div>
    );
};

const AddMaintenanceModal: React.FC<{ isOpen: boolean, onClose: () => void, onAdd: (record: Omit<MaintenanceRecord, 'id'>) => void }> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useTranslation();
    const initialFormState = { date: new Date().toISOString().split('T')[0], description: '', cost: 0 };
    const [formData, setFormData] = useState(initialFormState);
    const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData(initialFormState);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addMaintenanceRecord')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="date" type="date" value={formData.date} onChange={handleChange} className={inputClass} />
                <input name="description" placeholder={t('description')} value={formData.description} onChange={handleChange} className={inputClass} required />
                <input name="cost" type="number" placeholder={t('cost')} value={formData.cost} onChange={handleChange} className={inputClass} required />
                <Button type="submit" className="w-full">{t('addRecord')}</Button>
            </form>
        </Modal>
    );
};

const AddDocumentModal: React.FC<{ isOpen: boolean, onClose: () => void, onAdd: (record: Omit<DocumentRecord, 'id'>) => void }> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useTranslation();
    const initialFormState = { name: '', expiryDate: '', fileUrl: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [file, setFile] = useState<File | null>(null);
    const inputClass = "w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (type === 'file') {
            setFile((e.target as HTMLInputElement).files?.[0] || null);
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert(t('uploadFile'));
            return;
        }
        const fileUrl = await fileToBase64(file);
        onAdd({...formData, fileUrl});
        setFormData(initialFormState);
        setFile(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('addNewDocument')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" placeholder={t('documentNamePlaceholder')} value={formData.name} onChange={handleChange} className={inputClass} required/>
                <input name="expiryDate" type="date" value={formData.expiryDate} onChange={handleChange} className={inputClass} required/>
                <label className="block text-sm font-medium text-text-secondary">{t('documentFile')}</label>
                <input type="file" onChange={handleChange} className={inputClass} required/>
                <Button type="submit" className="w-full">{t('addDocument')}</Button>
            </form>
        </Modal>
    );
};

const BookingContractPage: React.FC<{ bookings: Booking[], cars: Car[], customers: Customer[], companyInfo: { name: string, address: string, phone: string } }> = ({ bookings, cars, customers, companyInfo }) => {
    const { id } = useParams<{ id: string }>();
    const booking = bookings.find(b => b.id === id);
    const car = booking ? cars.find(c => c.id === booking.carId) : null;
    const customer = booking ? customers.find(c => c.id === booking.customerId) : null;
    const { t } = useTranslation();

    if (!booking || !car || !customer) return <div>{t('bookingNotFound')}</div>;

    const rentalDays = getDaysUntil(booking.endDate) - getDaysUntil(booking.startDate);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <Link to="/bookings"><Button className="bg-gray-600 hover:bg-gray-700">{t('backToBookings')}</Button></Link>
                <Button onClick={() => window.print()}><Printer className="h-4 w-4"/> {t('print')}</Button>
            </div>
            <div id="contract-to-print" className="bg-surface p-8 shadow-lg rounded-lg">
                <style>{`
                    @media print {
                        body * { visibility: hidden; }
                        #contract-to-print, #contract-to-print * { visibility: visible; }
                        #contract-to-print { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}</style>
                <header className="text-center mb-8 border-b pb-4">
                    <Logo className="h-12 w-auto mx-auto" />
                    <p className="text-text-secondary mt-2">{companyInfo.address} | {companyInfo.phone}</p>
                    <h2 className="text-2xl font-semibold mt-4">{t('carRentalContract')}</h2>
                    <p className="text-sm text-text-secondary">{t('editedOn')} {new Date().toLocaleDateString()}</p>
                </header>
                <main className="space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="p-4 border rounded">
                            <h3 className="font-bold text-lg mb-2">{t('partyOne')}</h3>
                            <p><strong>{t('companyName')}:</strong> {companyInfo.name}</p>
                            <p><strong>{t('address')}:</strong> {companyInfo.address}</p>
                            <p><strong>{t('phoneNumber')}:</strong> {companyInfo.phone}</p>
                        </div>
                        <div className="p-4 border rounded">
                            <h3 className="font-bold text-lg mb-2">{t('partyTwo')}</h3>
                            <p><strong>{t('fullName')}:</strong> {customer.name}</p>
                            <p><strong>{t('nationalId')}:</strong> {customer.nationalId}</p>
                            <p><strong>{t('phoneNumber')}:</strong> {customer.phone}</p>
                        </div>
                    </div>
                    <div className="p-4 border rounded">
                        <h3 className="font-bold text-lg mb-2">{t('rentedCarDetails')}</h3>
                        <p><strong>{t('car')}:</strong> {car.make} {car.model} ({car.year})</p>
                        <p><strong>{t('licensePlate')}:</strong> {car.licensePlate}</p>
                        <p><strong>{t('color')}:</strong> {t(car.color)}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="p-4 border rounded">
                            <h3 className="font-bold text-lg mb-2">{t('rentalPeriodDetails')}</h3>
                            <p><strong>{t('startDate')}:</strong> {booking.startDate}</p>
                            <p><strong>{t('endDate')}:</strong> {booking.endDate}</p>
                            <p><strong>{t('days')}:</strong> {rentalDays}</p>
                        </div>
                        <div className="p-4 border rounded bg-gray-50 dark:bg-gray-800">
                            <h3 className="font-bold text-lg mb-2">{t('financialDetails')}</h3>
                            <p><strong>{t('pricePerDay')}:</strong> {car.pricePerDay} {t('currency')}</p>
                            <p className="font-bold text-xl"><strong>{t('totalRentalAmount')}:</strong> {booking.totalPrice} {t('currency')}</p>
                        </div>
                     </div>
                </main>
                <footer className="mt-16 pt-8 border-t">
                    <div className="grid grid-cols-2 gap-16">
                         <div>
                            <p className="mb-12">{t('signaturePartyOne')}</p>
                            <div className="border-t border-gray-400"></div>
                        </div>
                         <div>
                             <p className="mb-12">{t('signaturePartyTwo')}</p>
                             <div className="border-t border-gray-400"></div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

const VehicleCheckPage: React.FC<{ bookings: Booking[]; cars: Car[]; onUpdateBooking: (booking: Booking) => void }> = ({ bookings, cars, onUpdateBooking }) => {
    const { id } = useParams<{ id: string }>();
    const booking = bookings.find(b => b.id === id);
    const car = booking ? cars.find(c => c.id === booking.carId) : null;
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'checkout' | 'checkin'>('checkout');

    if (!booking || !car) return <div>{t('bookingNotFound')}</div>;

    const CheckForm: React.FC<{ state?: CheckState, onSave: (state: CheckState) => void }> = ({ state, onSave }) => {
        // Dummy implementation. A real one would have more complex state management.
        const [mileage, setMileage] = useState(state?.mileage || 0);
        const [fuelLevel, setFuelLevel] = useState(state?.fuelLevel || 50);

        const handleSave = () => {
             const newState: CheckState = {
                ...(state || { damages: [], checklist: {}, notes: '' }),
                mileage,
                fuelLevel,
                timestamp: new Date().toISOString()
            };
            onSave(newState);
            alert("Saved!");
        };

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>{t('mileage')}</label>
                        <input type="number" value={mileage} onChange={e => setMileage(Number(e.target.value))} className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded" />
                    </div>
                    <div>
                        <label>{t('fuelLevel')} (%)</label>
                        <input type="range" min="0" max="100" value={fuelLevel} onChange={e => setFuelLevel(Number(e.target.value))} className="w-full" />
                        <span className="text-center block">{fuelLevel}%</span>
                    </div>
                </div>
                {/* A real app would have a visual car model for damages and a full checklist here */}
                <p className="text-center text-text-secondary"> (Visual damage selector and detailed checklist would appear here)</p>
                <Button onClick={handleSave} className="w-full">{t('save')}</Button>
            </div>
        );
    }
    
    const handleSaveState = (type: 'checkout' | 'checkin', state: CheckState) => {
        const updatedBooking = {
            ...booking,
            [type === 'checkout' ? 'checkOutState' : 'checkInState']: state
        };
        onUpdateBooking(updatedBooking);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">{t('vehicleCheck')} for {car.make} {car.model}</h2>
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('checkout')} className={`px-4 py-2 ${activeTab === 'checkout' ? 'border-b-2 border-primary-600 text-primary-600' : ''}`}>{t('checkOut_departure')}</button>
                <button onClick={() => setActiveTab('checkin')} className={`px-4 py-2 ${activeTab === 'checkin' ? 'border-b-2 border-primary-600 text-primary-600' : ''}`}>{t('checkIn_return')}</button>
            </div>
            <Card>
                {activeTab === 'checkout' && <CheckForm state={booking.checkOutState} onSave={(state) => handleSaveState('checkout', state)} />}
                {activeTab === 'checkin' && <CheckForm state={booking.checkInState} onSave={(state) => handleSaveState('checkin', state)} />}
            </Card>
        </div>
    );
}

const SettingsPage: React.FC<{
    users: User[]; onUpdateUsers: (users: User[]) => void;
    companyInfo: any; onUpdateCompanyInfo: (info: any) => void;
    notificationDays: number; onUpdateNotificationDays: (days: number) => void;
    seasons: Season[]; onUpdateSeasons: (seasons: Season[]) => void;
    onExport: () => void; onImport: (data: string) => Promise<boolean>;
}> = ({ users, onUpdateUsers, companyInfo, onUpdateCompanyInfo, notificationDays, onUpdateNotificationDays, seasons, onUpdateSeasons, onExport, onImport }) => {
    const { t } = useTranslation();
    const [localCompanyInfo, setLocalCompanyInfo] = useState(companyInfo);
    const [localNotificationDays, setLocalNotificationDays] = useState(notificationDays);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCompanyInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalCompanyInfo({ ...localCompanyInfo, [e.target.name]: e.target.value });
    };

    const handleSaveCompanyInfo = () => {
        onUpdateCompanyInfo(localCompanyInfo);
        alert(t('save') + '!');
    };
    
    const handleSaveNotificationDays = () => {
        onUpdateNotificationDays(localNotificationDays);
         alert(t('save') + '!');
    };

    const handleImportClick = () => {
        if (window.confirm(t('importConfirmation'))) {
            fileInputRef.current?.click();
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target?.result as string;
                if (await onImport(text)) {
                    alert(t('importSuccess'));
                     window.location.reload();
                } else {
                    alert(t('importError'));
                }
            };
            reader.readAsText(file);
        }
    };

    // Placeholder for other settings sections
    const UsersSection = () => (
        <Card><h3 className="font-bold">{t('userManagement')}</h3><p>User management UI coming soon.</p></Card>
    );

    const SeasonsSection = () => {
        const [localSeasons, setLocalSeasons] = useState(seasons);
        const [newSeason, setNewSeason] = useState({name: '', startDate: '', endDate: '', multiplier: 1});

        const handleAddSeason = () => {
            const updatedSeasons = [...localSeasons, {...newSeason, id: `s-${Date.now()}`}];
            setLocalSeasons(updatedSeasons);
            onUpdateSeasons(updatedSeasons);
            setNewSeason({name: '', startDate: '', endDate: '', multiplier: 1});
        };
        const handleRemoveSeason = (id: string) => {
            const updatedSeasons = localSeasons.filter(s => s.id !== id);
             setLocalSeasons(updatedSeasons);
            onUpdateSeasons(updatedSeasons);
        };
        return (
            <Card>
                <h3 className="font-bold mb-4">{t('pricingSeasons')}</h3>
                <div className="space-y-2 mb-4">
                {localSeasons.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <p>{s.name} ({s.startDate} - {s.endDate}): x{s.multiplier}</p>
                        <button onClick={() => handleRemoveSeason(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 border-t pt-4">
                    <input value={newSeason.name} onChange={e => setNewSeason({...newSeason, name: e.target.value})} placeholder={t('seasonName')} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded col-span-2"/>
                    <input type="date" value={newSeason.startDate} onChange={e => setNewSeason({...newSeason, startDate: e.target.value})} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded"/>
                    <input type="date" value={newSeason.endDate} onChange={e => setNewSeason({...newSeason, endDate: e.target.value})} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded"/>
                    <input type="number" step="0.01" value={newSeason.multiplier} onChange={e => setNewSeason({...newSeason, multiplier: Number(e.target.value)})} placeholder={t('multiplier')} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded"/>
                </div>
                 <Button onClick={handleAddSeason} className="w-full mt-2">{t('addSeason')}</Button>
            </Card>
        )
    };

    return (
        <div className="space-y-6">
            <Card>
                <h3 className="font-bold mb-4">{t('companyInformation')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="name" value={localCompanyInfo.name} onChange={handleCompanyInfoChange} placeholder={t('companyName')} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded" />
                    <input name="address" value={localCompanyInfo.address} onChange={handleCompanyInfoChange} placeholder={t('address')} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded" />
                    <input name="phone" value={localCompanyInfo.phone} onChange={handleCompanyInfoChange} placeholder={t('phoneNumber')} className="p-2 bg-gray-50 dark:bg-gray-800 border rounded" />
                </div>
                <Button onClick={handleSaveCompanyInfo} className="mt-4">{t('save')}</Button>
            </Card>
            <Card>
                 <h3 className="font-bold mb-2">{t('notificationSettings')}</h3>
                 <div className="flex items-center gap-2">
                     <span className="whitespace-nowrap">{t('notificationDaysPrompt')}</span>
                     <input type="number" value={localNotificationDays} onChange={e => setLocalNotificationDays(Number(e.target.value))} className="p-2 w-20 bg-gray-50 dark:bg-gray-800 border rounded" />
                     <span>{t('days')}</span>
                     <Button onClick={handleSaveNotificationDays} className="text-sm !py-1 !px-2">{t('save')}</Button>
                 </div>
            </Card>
             <SeasonsSection/>
            <Card>
                 <h3 className="font-bold mb-2">{t('dataManagement')}</h3>
                 <div className="flex gap-4">
                    <Button onClick={onExport} className="bg-gray-600 hover:bg-gray-700">{ICONS.export} {t('exportData')}</Button>
                    <Button onClick={handleImportClick} className="bg-gray-600 hover:bg-gray-700">{ICONS.import} {t('importData')}</Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json"/>
                 </div>
            </Card>
            <UsersSection />
        </div>
    );
};

const LoginPage: React.FC<{ onLogin: (code: string) => Promise<boolean>; users: User[] }> = ({ onLogin, users }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(await onLogin(code))) {
            setError(t('incorrectSecretCode'));
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <Card className="w-full max-w-sm">
                <div className="text-center mb-6">
                    <Logo className="h-12 w-auto mx-auto mb-2" />
                    <p className="text-text-secondary">{t('enterSecretCode')}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        value={code}
                        onChange={(e) => { setCode(e.target.value); setError(''); }}
                        placeholder={t('secretCode')}
                        className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-center"
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" className="w-full !py-3">{t('login')}</Button>
                </form>
                 {users.length > 0 && (
                    <div className="mt-6 text-center text-sm text-text-secondary">
                        <p className="font-bold">{t('demoAccessCodes')}:</p>
                        {users.map(u => <p key={u.id}>{u.role} : <strong>{u.password}</strong></p>)}
                    </div>
                )}
            </Card>
        </div>
    );
};

const ProtectedRoute: React.FC<{ currentUser: User | null; role?: UserRole; children: React.ReactNode }> = ({ currentUser, role, children }) => {
    const { t } = useTranslation();
    if (!currentUser) return null; // Should be handled by main App logic
    
    if (role && currentUser.role !== role) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold text-red-500">{t('unauthorizedAccess')}</h2>
                <p className="text-text-secondary">{t('unauthorizedAccess_desc')}</p>
            </div>
        );
    }
    return <>{children}</>;
};

type NewCustomerPayload = Omit<Customer, 'id' | 'documents'> & {
    documents: Omit<CustomerDocument, 'id'>[];
};

function App() {
    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [cars, setCars] = useState<Car[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [companyInfo, setCompanyInfo] = useState<any>({});
    const [notificationDays, setNotificationDays] = useState<number>(30);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const { t, language } = useTranslation();

    // Data loading from IndexedDB
    useEffect(() => {
        const loadData = async () => {
            try {
                await db.initDB();
                
                const [
                    carsData, bookingsData, transactionsData, customersData, usersData, seasonsData,
                    companyInfoData, notificationDaysData, notificationsData, currentUserData, themeData
                ] = await Promise.all([
                    db.getAllFromDB<Car>('cars'),
                    db.getAllFromDB<Booking>('bookings'),
                    db.getAllFromDB<Transaction>('transactions'),
                    db.getAllFromDB<Customer>('customers'),
                    db.getAllFromDB<User>('users'),
                    db.getAllFromDB<Season>('seasons'),
                    db.getFromDB<any>('companyInfo', 'info'),
                    db.getFromDB<number>('notificationDays', 'days'),
                    db.getAllFromDB<Notification>('notifications'),
                    db.getFromDB<User | null>('currentUser', 'user'),
                    db.getFromDB<'light' | 'dark'>('theme', 'theme'),
                ]);

                const dataPopulationPromises: Promise<any>[] = [];

                if (carsData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'cars', items: initialCars, type: 'put' }]));
                    setCars(initialCars);
                } else {
                    setCars(carsData);
                }
                
                if (bookingsData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'bookings', items: initialBookings, type: 'put' }]));
                    setBookings(initialBookings);
                } else {
                    setBookings(bookingsData);
                }

                if (transactionsData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'transactions', items: initialTransactions, type: 'put' }]));
                    setTransactions(initialTransactions);
                } else {
                    setTransactions(transactionsData);
                }
                
                if (customersData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'customers', items: initialCustomers, type: 'put' }]));
                    setCustomers(initialCustomers);
                } else {
                    setCustomers(customersData);
                }

                if (usersData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'users', items: initialUsersData, type: 'put' }]));
                    setUsers(initialUsersData);
                } else {
                    setUsers(usersData);
                }

                if (seasonsData.length === 0) {
                    dataPopulationPromises.push(db.bulkOperation([{ storeName: 'seasons', items: initialSeasons, type: 'put' }]));
                    setSeasons(initialSeasons);
                } else {
                    setSeasons(seasonsData);
                }

                if (!companyInfoData) {
                    dataPopulationPromises.push(db.putToDB('companyInfo', initialCompanyInfo, 'info'));
                    setCompanyInfo(initialCompanyInfo);
                } else {
                    setCompanyInfo(companyInfoData);
                }
                
                if (!notificationDaysData) {
                    dataPopulationPromises.push(db.putToDB('notificationDays', 30, 'days'));
                    setNotificationDays(30);
                } else {
                    setNotificationDays(notificationDaysData);
                }
                
                setNotifications(notificationsData);
                setCurrentUser(currentUserData || null);
                setTheme(themeData || 'light');
                
                await Promise.all(dataPopulationPromises);

            } catch (error) {
                console.error("Failed to load data from IndexedDB", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);


    // Theme toggling
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        await db.putToDB('theme', newTheme, 'theme');
        setTheme(newTheme);
    };
    
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    // Notification generation
    useEffect(() => {
        if(isLoading) return; // Don't run on initial empty state

        const generatedNotifications: Notification[] = [];
        // Check car documents
        cars.forEach(car => {
            car.documents.forEach(doc => {
                const daysUntil = getDaysUntil(doc.expiryDate);
                if (daysUntil > 0 && daysUntil <= notificationDays) {
                    const msg = t('notif_doc_expires', { docName: doc.name, carName: `${car.make} ${car.model}`, days: daysUntil });
                    if (!notifications.some(n => n.message === msg)) {
                         generatedNotifications.push({ id: `notif-doc-${doc.id}`, type: NotificationType.Document, message: msg, date: new Date().toISOString(), isRead: false, linkTo: `/fleet/${car.id}` });
                    }
                }
            });
            if(car.nextServiceDate) {
                const daysUntil = getDaysUntil(car.nextServiceDate);
                 if (daysUntil > 0 && daysUntil <= notificationDays) {
                     const msg = t('notif_maintenance_due', { carName: `${car.make} ${car.model}`, days: daysUntil });
                     if (!notifications.some(n => n.message === msg)) {
                        generatedNotifications.push({ id: `notif-maint-${car.id}`, type: NotificationType.Maintenance, message: msg, date: new Date().toISOString(), isRead: false, linkTo: `/fleet/${car.id}` });
                     }
                }
            }
        });
        // Check for new bookings
        bookings.filter(b => b.isNew).forEach(b => {
             const car = cars.find(c => c.id === b.carId);
             if (car) {
                const msg = t('notif_new_booking', { carName: `${car.make} ${car.model}`});
                if (!notifications.some(n => n.message === msg)) {
                    generatedNotifications.push({ id: `notif-book-${b.id}`, type: NotificationType.Booking, message: msg, date: new Date().toISOString(), isRead: false, linkTo: '/bookings' });
                }
             }
        });

        if (generatedNotifications.length > 0) {
            const updatedNotifications = [...generatedNotifications, ...notifications];
            setNotifications(updatedNotifications);
            db.bulkOperation([{ storeName: 'notifications', items: updatedNotifications, type: 'put' }]);
            
            // Mark new bookings as not new anymore
            const bookingsToUpdate = bookings.filter(b => b.isNew).map(b => ({...b, isNew: false}));
            const updatedBookings = bookings.map(b => b.isNew ? {...b, isNew: false} : b);
            setBookings(updatedBookings);
            db.bulkOperation([{ storeName: 'bookings', items: bookingsToUpdate, type: 'put' }]);
        }
    }, [cars, bookings, notificationDays, isLoading, t]);

    // Handlers
    const handleLogin = async (code: string): Promise<boolean> => {
        const user = users.find(u => u.password === code);
        if (user) {
            await db.putToDB('currentUser', user, 'user');
            setCurrentUser(user);
            navigate('/');
            return true;
        }
        return false;
    };
    
    const handleLogout = async () => {
        await db.putToDB('currentUser', null, 'user');
        setCurrentUser(null);
        navigate('/');
    };
    
    const handleAddCar = async (carData: Omit<Car, 'id' | 'maintenanceHistory' | 'documents'>) => {
        const newCar: Car = {
            ...carData,
            id: `car-${Date.now()}`,
            maintenanceHistory: [],
            documents: []
        };
        await db.putToDB('cars', newCar);
        setCars(prev => [newCar, ...prev]);
    };

    const handleUpdateCar = async (updatedCar: Car) => {
        await db.putToDB('cars', updatedCar);
        setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
    };

    const handleAddCustomer = (customerData: NewCustomerPayload): Customer => {
        const newCustomer: Customer = {
            ...customerData,
            id: `cust-${Date.now()}`,
            documents: customerData.documents.map((doc, index) => ({
                ...doc,
                id: `cdoc-${Date.now()}-${index}`,
            }))
        };
        db.putToDB('customers', newCustomer);
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
    };
    
    const handleUpdateCustomer = async (updatedCustomer: Customer) => {
        await db.putToDB('customers', updatedCustomer);
        setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    };

    const handleAddBooking = async (bookingData: Omit<Booking, 'id' | 'isNew'>, transactionData: Omit<Transaction, 'id'>) => {
        const newBooking: Booking = {
            ...bookingData,
            id: `booking-${Date.now()}`,
            isNew: true
        };
        const newTransaction = { ...transactionData, id: `trans-${Date.now()}`, bookingId: newBooking.id };
        const carToUpdate = cars.find(c => c.id === newBooking.carId);
        if(!carToUpdate) return;
        const updatedCar = { ...carToUpdate, status: CarStatus.Rented };
        
        await Promise.all([
            db.putToDB('bookings', newBooking),
            db.putToDB('transactions', newTransaction),
            db.putToDB('cars', updatedCar)
        ]);

        setBookings(prev => [newBooking, ...prev]);
        setTransactions(prev => [newTransaction, ...prev]);
        setCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
    };
    
    const handleUpdateBooking = async (updatedBooking: Booking) => {
        const originalBooking = bookings.find(b => b.id === updatedBooking.id);

        const transactionUpdatePromise = (async () => {
            const allTransactions = await db.getAllFromDB<Transaction>('transactions');
            const transactionToUpdate = allTransactions.find(t => t.bookingId === updatedBooking.id);
            if(transactionToUpdate) {
                const updatedTransaction = { ...transactionToUpdate, amount: updatedBooking.totalPrice, date: updatedBooking.startDate, carId: updatedBooking.carId };
                await db.putToDB('transactions', updatedTransaction);
            }
        })();
        
        const carStatusPromises: Promise<any>[] = [];
        if (originalBooking && originalBooking.carId !== updatedBooking.carId) {
            // Car has changed. Update status of old and new cars.
            const originalCar = cars.find(c => c.id === originalBooking.carId);
            const newCar = cars.find(c => c.id === updatedBooking.carId);
            
            if (originalCar) {
                // Check if old car has any other active bookings. If not, set to available.
                const otherBookingsForOldCar = bookings.some(b => b.id !== originalBooking.id && b.carId === originalCar.id && new Date(b.endDate) >= new Date());
                if(!otherBookingsForOldCar) {
                    carStatusPromises.push(db.putToDB('cars', {...originalCar, status: CarStatus.Available}));
                }
            }
            if (newCar) {
                carStatusPromises.push(db.putToDB('cars', {...newCar, status: CarStatus.Rented}));
            }
        }
        
        await Promise.all([db.putToDB('bookings', updatedBooking), transactionUpdatePromise, ...carStatusPromises]);

        // Reload all data from DB to ensure consistency
        const [carsData, bookingsData, transactionsData] = await Promise.all([
            db.getAllFromDB<Car>('cars'),
            db.getAllFromDB<Booking>('bookings'),
            db.getAllFromDB<Transaction>('transactions'),
        ]);
        setCars(carsData);
        setBookings(bookingsData);
        setTransactions(transactionsData);
    };

    const onDeleteBooking = async (bookingId: string) => {
        const bookingToDelete = bookings.find(b => b.id === bookingId);
        if (!bookingToDelete) return;

        const transactionToDelete = transactions.find(t => t.bookingId === bookingId);

        const carToUpdate = cars.find(c => c.id === bookingToDelete.carId);
        let updatedCar: Car | undefined;
        if (carToUpdate) {
            const otherActiveBookings = bookings.some(b => 
                b.id !== bookingId && 
                b.carId === carToUpdate.id && 
                new Date(b.endDate) >= new Date()
            );
            if (!otherActiveBookings) {
                updatedCar = { ...carToUpdate, status: CarStatus.Available };
            }
        }
        
        const dbPromises: Promise<any>[] = [db.deleteFromDB('bookings', bookingId)];
        if (transactionToDelete) {
            dbPromises.push(db.deleteFromDB('transactions', transactionToDelete.id));
        }
        if (updatedCar) {
            dbPromises.push(db.putToDB('cars', updatedCar));
        }

        await Promise.all(dbPromises);
        
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        if(transactionToDelete) {
            setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
        }
        if (updatedCar) {
            setCars(prev => prev.map(c => c.id === updatedCar!.id ? updatedCar! : c));
        }
    };
    
    const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...transactionData, type: TransactionType.Expense, id: `trans-${Date.now()}` };
        await db.putToDB('transactions', newTransaction);
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const handleUpdateUsers = async (updatedUsers: User[]) => {
        await db.bulkOperation([{ storeName: 'users', items: updatedUsers, type: 'put' }]);
        setUsers(updatedUsers);
    };

    const handleUpdateCompanyInfo = async (info: any) => {
        await db.putToDB('companyInfo', info, 'info');
        setCompanyInfo(info);
    };

    const handleUpdateNotificationDays = async (days: number) => {
        await db.putToDB('notificationDays', days, 'days');
        setNotificationDays(days);
    };
    
    const handleUpdateSeasons = async (updatedSeasons: Season[]) => {
        await db.bulkOperation([{ storeName: 'seasons', items: updatedSeasons, type: 'put' }]);
        setSeasons(updatedSeasons);
    };

    const handleExportData = () => {
        const dataToExport = {
            cars, bookings, transactions, customers, users, seasons,
            companyInfo, notificationDays
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rentsmart_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportData = async (jsonString: string): Promise<boolean> => {
        try {
            const data = JSON.parse(jsonString);
            if (!data.cars || !data.bookings || !data.customers) {
                throw new Error("Invalid file format");
            }
            
            const storesToClear = db.STORE_NAMES.filter(name => 
                !['notifications', 'currentUser', 'theme'].includes(name)
            );
            await Promise.all(storesToClear.map(store => db.clearStore(store)));

            const operations = [
                { storeName: 'cars', items: data.cars || [], type: 'put' as const },
                { storeName: 'bookings', items: data.bookings || [], type: 'put' as const },
                { storeName: 'transactions', items: data.transactions || [], type: 'put' as const },
                { storeName: 'customers', items: data.customers || [], type: 'put' as const },
                { storeName: 'users', items: data.users || [], type: 'put' as const },
                { storeName: 'seasons', items: data.seasons || [], type: 'put' as const },
            ];
            await db.bulkOperation(operations);
            
            if (data.companyInfo) await db.putToDB('companyInfo', data.companyInfo, 'info');
            if (data.notificationDays) await db.putToDB('notificationDays', data.notificationDays, 'days');
            
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    };

    const handleReadNotification = async (id: string) => {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.isRead) {
            const updatedNotification = { ...notification, isRead: true };
            const updatedNotifications = notifications.map(n => n.id === id ? updatedNotification : n);
            await db.putToDB('notifications', updatedNotification);
            setNotifications(updatedNotifications);
        }
    };
    
    // UI Rendering
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-background text-text-primary">Loading...</div>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} users={users} />;
    }

    return (
        <div className={`flex h-screen bg-background text-text-primary ${language === 'ar' ? 'rtl' : 'ltr'}`}>
             <Sidebar currentUser={currentUser} onLogout={handleLogout} isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
             <div className={`flex-1 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ms-64' : 'ms-0'}`}>
                <AppHeader 
                    currentUser={currentUser} 
                    notifications={notifications} 
                    onReadNotification={handleReadNotification}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    toggleSidebar={toggleSidebar}
                />
                 <main className="p-6">
                    <Routes>
                        <Route path="/" element={<DashboardPage cars={cars} bookings={bookings} transactions={transactions} customers={customers} currentUser={currentUser} />} />
                        <Route path="/fleet" element={<FleetPage cars={cars} onAddCar={handleAddCar} currentUser={currentUser} />} />
                        <Route path="/fleet/:id" element={<CarDetailsPage cars={cars} onUpdateCar={handleUpdateCar} onAddTransaction={handleAddTransaction} />} />
                        <Route path="/bookings" element={<BookingsPage bookings={bookings} cars={cars} customers={customers} seasons={seasons} companyInfo={companyInfo} onAddBooking={handleAddBooking} onAddCustomer={handleAddCustomer} />} />
                        <Route path="/booking/:id/contract" element={<BookingContractPage bookings={bookings} cars={cars} customers={customers} companyInfo={companyInfo} />} />
                        <Route path="/booking/:id/check" element={<VehicleCheckPage bookings={bookings} cars={cars} onUpdateBooking={handleUpdateBooking} />} />
                        <Route path="/calendar" element={<CalendarPage bookings={bookings} cars={cars} customers={customers} seasons={seasons} onAddBooking={handleAddBooking} onAddCustomer={handleAddCustomer} onUpdateBooking={handleUpdateBooking} onDeleteBooking={onDeleteBooking} />} />
                        <Route path="/customers" element={<CustomersPage customers={customers} onAddCustomer={handleAddCustomer} onUpdateCustomer={handleUpdateCustomer} />} />
                        
                        <Route path="/finance" element={<ProtectedRoute currentUser={currentUser} role={UserRole.Admin}><FinancePage transactions={transactions} onAddTransaction={handleAddTransaction} /></ProtectedRoute>} />
                        <Route path="/reports" element={<ProtectedRoute currentUser={currentUser} role={UserRole.Admin}><ReportsPage cars={cars} transactions={transactions} bookings={bookings} /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute currentUser={currentUser} role={UserRole.Admin}><SettingsPage 
                            users={users} onUpdateUsers={handleUpdateUsers}
                            companyInfo={companyInfo} onUpdateCompanyInfo={handleUpdateCompanyInfo}
                            notificationDays={notificationDays} onUpdateNotificationDays={handleUpdateNotificationDays}
                            seasons={seasons} onUpdateSeasons={handleUpdateSeasons}
                            onExport={handleExportData} onImport={handleImportData}
                        /></ProtectedRoute>} />
                    </Routes>
                 </main>
             </div>
        </div>
    );
}

export default App;