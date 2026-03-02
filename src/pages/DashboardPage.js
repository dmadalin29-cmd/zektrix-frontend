import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { 
    AreaChart, Area, ResponsiveContainer
} from 'recharts';
import { 
    Wallet, Ticket, History, Plus, ArrowRight, Loader2, Trophy, CreditCard, 
    ArrowUpRight, ArrowDownRight, Clock, Gift, Users, TrendingUp, Sparkles,
    ChevronRight, Eye, Target, Crown, Star, Zap, Calendar, DollarSign,
    ShoppingCart, Activity, Bell
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animated Number
const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 2 }) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        const duration = 1200;
        const steps = 40;
        const increment = value / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= value) { setDisplay(value); clearInterval(timer); }
            else setDisplay(current);
        }, duration / steps);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString('ro-RO')}{suffix}</span>;
};

// Sparkline
const Sparkline = ({ data, color, height = 40 }) => (
    <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.map((v, i) => ({ v, i }))}>
                <defs>
                    <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color.replace('#', '')})`} />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

// Stat Card
const StatCard = ({ icon: Icon, label, value, gradient, sparkData, onClick, prefix = '' }) => (
    <div 
        onClick={onClick}
        className={`group relative rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''}`}
        style={{
            background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.15)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
        }}
    >
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `radial-gradient(circle at 50% 50%, ${gradient?.split(' ')[0] || 'rgba(139,92,246,0.15)'}, transparent 70%)` }} />
        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    style={{ background: gradient || 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <p className="text-sm text-gray-400 mb-1 font-medium">{label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">
                <AnimatedNumber value={value} prefix={prefix} decimals={prefix === 'RON ' ? 2 : 0} />
            </p>
            {sparkData && (
                <div className="mt-4 -mx-1">
                    <Sparkline data={sparkData} color={gradient?.includes('emerald') ? '#10b981' : gradient?.includes('orange') ? '#f97316' : '#8b5cf6'} />
                </div>
            )}
        </div>
    </div>
);

// Nav Tab
const NavTab = ({ icon: Icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
            ${active 
                ? 'text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
        style={active ? {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.2) 100%)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        } : {}}
    >
        <Icon className={`w-4 h-4 ${active ? 'text-violet-400' : ''}`} />
        <span>{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="px-1.5 py-0.5 bg-violet-500/30 text-violet-300 text-xs font-bold rounded-full min-w-[20px] text-center">
                {badge}
            </span>
        )}
    </button>
);

// Empty State
const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
            <Icon className="w-10 h-10 text-violet-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-500 max-w-md mb-6">{description}</p>
        {action && (
            <Button onClick={action} className="bg-violet-600 hover:bg-violet-500">
                {actionLabel}
            </Button>
        )}
    </div>
);

const DashboardPage = () => {
    const { user, token, refreshUser } = useAuth();
    const { t, isRomanian } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        if (location.pathname.includes('/tickets')) return 'tickets';
        if (location.pathname.includes('/wallet')) return 'wallet';
        if (location.pathname.includes('/history')) return 'history';
        if (location.pathname.includes('/referral')) return 'referral';
        return 'overview';
    };

    const [activeTab, setActiveTab] = useState(getActiveTab());
    const [tickets, setTickets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [depositing, setDepositing] = useState(false);
    const [showDepositDialog, setShowDepositDialog] = useState(false);

    useEffect(() => { 
        if (token) {
            fetchData(); 
        }
    }, [token]);
    useEffect(() => { setActiveTab(getActiveTab()); }, [location.pathname]);

    const fetchData = async () => {
        try {
            const [ticketsRes, transactionsRes] = await Promise.all([
                axios.get(`${API}/tickets/my`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/wallet/transactions`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setTickets(ticketsRes.data);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount < 1) {
            toast.error('Minimum deposit is RON 1');
            return;
        }
        setDepositing(true);
        try {
            const response = await axios.post(
                `${API}/wallet/deposit`,
                { amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.location.href = response.data.checkout_url;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create deposit');
            setDepositing(false);
        }
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
        const routes = { overview: '/dashboard', tickets: '/dashboard/tickets', wallet: '/dashboard/wallet', history: '/dashboard/history', referral: '/dashboard/referral' };
        navigate(routes[value] || '/dashboard');
    };

    const groupedTickets = tickets.reduce((acc, ticket) => {
        const key = ticket.competition_id;
        if (!acc[key]) acc[key] = { competition_id: ticket.competition_id, competition_title: ticket.competition_title, tickets: [] };
        acc[key].tickets.push(ticket);
        return acc;
    }, {});

    const recentTransactions = transactions.slice(0, 5);
    const sparkData = useMemo(() => [20, 35, 25, 45, 55, 40, 60, 50, 70, 65, 80, 75], []);

    const navItems = [
        { id: 'overview', icon: Activity, label: isRomanian ? 'Prezentare' : 'Overview' },
        { id: 'tickets', icon: Ticket, label: isRomanian ? 'Biletele Mele' : 'My Tickets', badge: tickets.length },
        { id: 'wallet', icon: Wallet, label: isRomanian ? 'Portofel' : 'Wallet' },
        { id: 'history', icon: History, label: isRomanian ? 'Istoric' : 'History' },
        { id: 'referral', icon: Gift, label: 'Referral' },
    ];

    return (
        <div className="min-h-screen bg-[#030014]" data-testid="dashboard-page">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {t('welcome')}, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{user?.first_name || user?.username}</span>
                            </h1>
                            <p className="text-gray-500">{t('dashboard_subtitle')}</p>
                        </div>
                        
                        {/* Balance Card */}
                        <div className="rounded-2xl p-5 flex items-center gap-5"
                            style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
                                border: '1px solid rgba(249, 115, 22, 0.3)',
                                boxShadow: '0 0 30px rgba(249, 115, 22, 0.15)'
                            }}>
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                                <Wallet className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{t('your_balance')}</p>
                                <p className="text-3xl font-bold text-white" data-testid="wallet-balance">
                                    RON <AnimatedNumber value={user?.balance || 0} decimals={2} />
                                </p>
                            </div>
                            <Button 
                                onClick={() => setShowDepositDialog(true)}
                                className="ml-4 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5"
                                data-testid="add-funds-btn"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {isRomanian ? 'ADAUGĂ' : 'ADD'}
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                        {navItems.map(item => (
                            <NavTab 
                                key={item.id}
                                {...item}
                                active={activeTab === item.id}
                                onClick={() => handleTabChange(item.id)}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="space-y-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <StatCard 
                                        icon={Ticket} 
                                        label="Total Tickets" 
                                        value={tickets.length} 
                                        gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)" 
                                        sparkData={sparkData}
                                        onClick={() => handleTabChange('tickets')}
                                    />
                                    <StatCard 
                                        icon={Trophy} 
                                        label="Competitions" 
                                        value={Object.keys(groupedTickets).length} 
                                        gradient="linear-gradient(135deg, #f97316, #ea580c)" 
                                    />
                                    <StatCard 
                                        icon={History} 
                                        label="Transactions" 
                                        value={transactions.length} 
                                        gradient="linear-gradient(135deg, #06b6d4, #0891b2)" 
                                        onClick={() => handleTabChange('history')}
                                    />
                                </div>

                                {/* Quick Actions */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Link to="/competitions" className="group">
                                        <div className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                                border: '1px solid rgba(139, 92, 246, 0.15)'
                                            }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg mb-1">Browse Competitions</h3>
                                                    <p className="text-sm text-gray-500">Enter exciting competitions and win prizes</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                                                    <ArrowRight className="w-6 h-6 text-violet-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="group cursor-pointer" onClick={() => setShowDepositDialog(true)}>
                                        <div className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                                                border: '1px solid rgba(249, 115, 22, 0.2)'
                                            }}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg mb-1">Add Funds</h3>
                                                    <p className="text-sm text-gray-500">Deposit money to your wallet</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                                                    <Plus className="w-6 h-6 text-orange-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                {recentTransactions.length > 0 && (
                                    <div className="rounded-2xl p-6"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                            border: '1px solid rgba(139, 92, 246, 0.15)'
                                        }}>
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="font-bold text-white text-lg">Recent Activity</h3>
                                            <Button variant="ghost" size="sm" onClick={() => handleTabChange('history')} className="text-violet-400 hover:text-violet-300">
                                                View All <ChevronRight className="w-4 h-4 ml-1" />
                                            </Button>
                                        </div>
                                        <div className="space-y-3">
                                            {recentTransactions.map((txn) => (
                                                <div key={txn.transaction_id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                            txn.amount > 0 ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                                                        }`}>
                                                            {txn.amount > 0 ? (
                                                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                                                            ) : (
                                                                <Ticket className="w-5 h-5 text-violet-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-white">{txn.description}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(txn.created_at).toLocaleDateString('ro-RO')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-bold ${txn.amount > 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
                                                        {txn.amount > 0 ? '+' : ''}RON {Math.abs(txn.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Tickets Tab */}
                        {activeTab === 'tickets' && (
                            loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                                </div>
                            ) : Object.keys(groupedTickets).length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {Object.values(groupedTickets).map((group) => (
                                        <div key={group.competition_id} 
                                            className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01]"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                                border: '1px solid rgba(139, 92, 246, 0.15)'
                                            }}
                                            data-testid={`tickets-group-${group.competition_id}`}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-white">{group.competition_title || 'Competition'}</h3>
                                                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                                                    {group.tickets.length} tickets
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                {group.tickets.sort((a, b) => a.ticket_number - b.ticket_number).map((ticket) => (
                                                    <span key={ticket.ticket_id} 
                                                        className="px-3 py-1.5 rounded-lg font-mono font-bold text-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #8b5cf6, #f97316)',
                                                            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                                                        }}>
                                                        #{ticket.ticket_number}
                                                    </span>
                                                ))}
                                            </div>
                                            <Link to={`/competitions/${group.competition_id}`}>
                                                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300 p-0">
                                                    View Competition <ArrowRight className="w-4 h-4 ml-1" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState 
                                    icon={Ticket} 
                                    title="No Tickets Yet" 
                                    description="Purchase tickets to enter competitions"
                                    action={() => navigate('/competitions')}
                                    actionLabel="Browse Competitions"
                                />
                            )
                        )}

                        {/* Wallet Tab */}
                        {activeTab === 'wallet' && (
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="rounded-2xl p-8 text-center"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(234, 88, 12, 0.1) 100%)',
                                        border: '1px solid rgba(249, 115, 22, 0.3)',
                                        boxShadow: '0 0 40px rgba(249, 115, 22, 0.1)'
                                    }}>
                                    <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)' }}>
                                        <Wallet className="w-10 h-10 text-white" />
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">Available Balance</p>
                                    <p className="text-5xl font-bold text-white mb-8">
                                        RON <AnimatedNumber value={user?.balance || 0} decimals={2} />
                                    </p>
                                    <Button 
                                        onClick={() => setShowDepositDialog(true)}
                                        className="w-full py-6 text-lg font-bold bg-orange-500 hover:bg-orange-600"
                                        data-testid="deposit-btn"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Funds
                                    </Button>
                                </div>

                                <div className="rounded-2xl p-6"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                        border: '1px solid rgba(139, 92, 246, 0.15)'
                                    }}>
                                    <h3 className="font-bold text-white text-lg mb-4">Payment Methods</h3>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 mb-4">
                                        <CreditCard className="w-10 h-10 text-cyan-400" />
                                        <div>
                                            <p className="font-medium text-white">Viva Payments</p>
                                            <p className="text-sm text-gray-500">Secure card payments</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mb-4">
                                        <div className="flex-1 p-3 rounded-xl bg-white text-center">
                                            <span className="text-[#1A1F71] font-bold text-lg italic">VISA</span>
                                        </div>
                                        <div className="flex-1 p-3 rounded-xl bg-white flex items-center justify-center">
                                            <div className="flex items-center">
                                                <div className="w-6 h-6 rounded-full bg-[#EB001B]"></div>
                                                <div className="w-6 h-6 rounded-full bg-[#F79E1B] -ml-2"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        All payments are processed securely. We never store your card details.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* History Tab */}
                        {activeTab === 'history' && (
                            loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                                </div>
                            ) : transactions.length > 0 ? (
                                <div className="rounded-2xl overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                        border: '1px solid rgba(139, 92, 246, 0.15)'
                                    }}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left text-xs font-bold uppercase tracking-wider text-violet-400 py-4 px-5">Date</th>
                                                    <th className="text-left text-xs font-bold uppercase tracking-wider text-violet-400 py-4 px-5">Type</th>
                                                    <th className="text-left text-xs font-bold uppercase tracking-wider text-violet-400 py-4 px-5">Description</th>
                                                    <th className="text-left text-xs font-bold uppercase tracking-wider text-violet-400 py-4 px-5">Status</th>
                                                    <th className="text-right text-xs font-bold uppercase tracking-wider text-violet-400 py-4 px-5">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((txn) => (
                                                    <tr key={txn.transaction_id} className="border-b border-white/5 hover:bg-white/5 transition-colors" data-testid={`txn-${txn.transaction_id}`}>
                                                        <td className="py-4 px-5 text-sm text-gray-300">
                                                            {new Date(txn.created_at).toLocaleDateString('ro-RO')}
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 capitalize">
                                                                {txn.transaction_type.replace('_', ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-4 px-5 text-sm text-gray-400">{txn.description}</td>
                                                        <td className="py-4 px-5">
                                                            <Badge className={
                                                                txn.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                                                txn.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                                                'bg-red-500/20 text-red-400 border-red-500/30'
                                                            }>
                                                                {txn.status}
                                                            </Badge>
                                                        </td>
                                                        <td className={`py-4 px-5 text-right font-bold ${txn.amount > 0 ? 'text-emerald-400' : 'text-violet-400'}`}>
                                                            {txn.amount > 0 ? '+' : ''}RON {Math.abs(txn.amount).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <EmptyState 
                                    icon={History} 
                                    title="No Transaction History" 
                                    description="Your transaction history will appear here"
                                />
                            )
                        )}

                        {/* Referral Tab */}
                        {activeTab === 'referral' && (
                            <div className="rounded-2xl p-8 text-center"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                                    border: '1px solid rgba(139, 92, 246, 0.15)'
                                }}>
                                <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #f97316)', boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}>
                                    <Gift className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Referral Program</h3>
                                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                    {isRomanian 
                                        ? 'Invită prietenii și primești bonusuri pentru fiecare care se înregistrează!' 
                                        : 'Invite friends and get bonuses for each one who signs up!'}
                                </p>
                                <div className="p-4 rounded-xl bg-white/5 mb-6 max-w-md mx-auto">
                                    <p className="text-xs text-gray-500 mb-2">Your Referral Code</p>
                                    <p className="text-2xl font-mono font-bold text-violet-400">{user?.referral_code || 'ZEKTRIX' + (user?.user_id?.slice(-4) || '0000')}</p>
                                </div>
                                <Button className="bg-violet-600 hover:bg-violet-500" onClick={() => {
                                    navigator.clipboard.writeText(`https://zektrix.uk?ref=${user?.referral_code || 'ZEKTRIX'}`);
                                    toast.success(isRomanian ? 'Link copiat!' : 'Link copied!');
                                }}>
                                    Copy Referral Link
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Deposit Dialog */}
            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
                <DialogContent className="sm:max-w-md"
                    style={{ background: 'linear-gradient(135deg, rgba(10, 6, 20, 0.98) 0%, rgba(5, 3, 15, 0.99) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <DialogHeader>
                        <DialogTitle className="text-white text-xl">Add Funds</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Deposit money to your wallet using Viva Payments
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-gray-400">Amount (RON)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="10.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="pl-10 bg-white/5 border-white/10 focus:border-violet-500"
                                    min="1"
                                    step="0.01"
                                    data-testid="deposit-amount-input"
                                />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[5, 10, 20, 50, 100].map((amt) => (
                                <Button
                                    key={amt}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDepositAmount(amt.toString())}
                                    className="border-white/20 hover:border-violet-500 hover:bg-violet-500/20"
                                >
                                    RON {amt}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDepositDialog(false)}>Cancel</Button>
                        <Button 
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={handleDeposit}
                            disabled={depositing || !depositAmount}
                            data-testid="confirm-deposit-btn"
                        >
                            {depositing ? (
                                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                            ) : (
                                <>Proceed to Payment</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DashboardPage;
// Force rebuild Mon Mar  2 11:20:52 UTC 2026
