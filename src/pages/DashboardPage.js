import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { Wallet, Ticket, History, Plus, ArrowRight, Loader2, Trophy, CreditCard, PoundSterling, ArrowUpRight, Clock, Gift, Users } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardPage = () => {
    const { user, token, refreshUser } = useAuth();
    const { t, isRomanian } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine which tab based on route
    const getActiveTab = () => {
        if (location.pathname.includes('/tickets')) return 'tickets';
        if (location.pathname.includes('/wallet')) return 'wallet';
        if (location.pathname.includes('/history')) return 'history';
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
        fetchData();
    }, []);

    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [location.pathname]);

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
            toast.error('Minimum deposit is £1');
            return;
        }

        setDepositing(true);
        try {
            const response = await axios.post(
                `${API}/wallet/deposit`,
                { amount },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Redirect to Viva checkout
            window.location.href = response.data.checkout_url;
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create deposit');
            setDepositing(false);
        }
    };

    const handleTabChange = (value) => {
        setActiveTab(value);
        switch (value) {
            case 'overview':
                navigate('/dashboard');
                break;
            case 'tickets':
                navigate('/dashboard/tickets');
                break;
            case 'wallet':
                navigate('/dashboard/wallet');
                break;
            case 'history':
                navigate('/dashboard/history');
                break;
            case 'referral':
                navigate('/dashboard/referral');
                break;
            default:
                break;
        }
    };

    // Group tickets by competition
    const groupedTickets = tickets.reduce((acc, ticket) => {
        const key = ticket.competition_id;
        if (!acc[key]) {
            acc[key] = {
                competition_id: ticket.competition_id,
                competition_title: ticket.competition_title,
                tickets: []
            };
        }
        acc[key].tickets.push(ticket);
        return acc;
    }, {});

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {t('welcome')}, <span className="gradient-text">{user?.username}</span>
                            </h1>
                            <p className="text-muted-foreground">{t('dashboard_subtitle')}</p>
                        </div>
                        <Card className="glass border-secondary/30 w-fit">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">{t('your_balance')}</p>
                                    <p className="text-2xl font-bold text-secondary" data-testid="wallet-balance">
                                        £{(user?.balance || 0).toFixed(2)}
                                    </p>
                                </div>
                                <Button 
                                    size="sm" 
                                    className="btn-secondary ml-4"
                                    onClick={() => setShowDepositDialog(true)}
                                    data-testid="add-funds-btn"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {t('add')}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="bg-muted p-1 h-auto flex-wrap">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20" data-testid="tab-overview">
                                {t('tab_overview')}
                            </TabsTrigger>
                            <TabsTrigger value="tickets" className="data-[state=active]:bg-primary/20" data-testid="tab-tickets">
                                <Ticket className="w-4 h-4 mr-2" />
                                {t('tab_tickets')}
                            </TabsTrigger>
                            <TabsTrigger value="wallet" className="data-[state=active]:bg-primary/20" data-testid="tab-wallet">
                                <Wallet className="w-4 h-4 mr-2" />
                                {t('tab_wallet')}
                            </TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20" data-testid="tab-history">
                                <History className="w-4 h-4 mr-2" />
                                {t('tab_history')}
                            </TabsTrigger>
                            <TabsTrigger value="referral" className="data-[state=active]:bg-primary/20" data-testid="tab-referral">
                                <Gift className="w-4 h-4 mr-2" />
                                {isRomanian ? 'Referral' : 'Referral'}
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="glass border-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                                <Ticket className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Tickets</p>
                                                <p className="text-2xl font-bold">{tickets.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="glass border-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                                                <Trophy className="w-6 h-6 text-secondary" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Competitions</p>
                                                <p className="text-2xl font-bold">{Object.keys(groupedTickets).length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="glass border-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                                <History className="w-6 h-6 text-accent" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Transactions</p>
                                                <p className="text-2xl font-bold">{transactions.length}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link to="/competitions">
                                    <Card className="glass border-white/10 card-hover h-full">
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold mb-1">Browse Competitions</h3>
                                                <p className="text-sm text-muted-foreground">Enter exciting competitions and win prizes</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-primary" />
                                        </CardContent>
                                    </Card>
                                </Link>
                                <Card 
                                    className="glass border-white/10 card-hover cursor-pointer"
                                    onClick={() => setShowDepositDialog(true)}
                                >
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold mb-1">Add Funds</h3>
                                            <p className="text-sm text-muted-foreground">Deposit money to your wallet</p>
                                        </div>
                                        <Plus className="w-5 h-5 text-secondary" />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recent Activity */}
                            {recentTransactions.length > 0 && (
                                <Card className="glass border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Recent Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentTransactions.map((txn) => (
                                                <div key={txn.transaction_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                            txn.amount > 0 ? 'bg-secondary/20' : 'bg-primary/20'
                                                        }`}>
                                                            {txn.amount > 0 ? (
                                                                <ArrowUpRight className="w-4 h-4 text-secondary" />
                                                            ) : (
                                                                <Ticket className="w-4 h-4 text-primary" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{txn.description}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(txn.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-bold ${txn.amount > 0 ? 'text-secondary' : 'text-primary'}`}>
                                                        {txn.amount > 0 ? '+' : ''}£{Math.abs(txn.amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Tickets Tab */}
                        <TabsContent value="tickets" className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : Object.keys(groupedTickets).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.values(groupedTickets).map((group) => (
                                        <Card key={group.competition_id} className="glass border-white/10" data-testid={`tickets-group-${group.competition_id}`}>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center justify-between">
                                                    <span>{group.competition_title || 'Competition'}</span>
                                                    <Badge className="badge-instant">{group.tickets.length} tickets</Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex flex-wrap gap-2">
                                                    {group.tickets.sort((a, b) => a.ticket_number - b.ticket_number).map((ticket) => (
                                                        <span key={ticket.ticket_id} className="ticket-badge">
                                                            #{ticket.ticket_number}
                                                        </span>
                                                    ))}
                                                </div>
                                                <Link to={`/competitions/${group.competition_id}`}>
                                                    <Button variant="link" className="text-primary p-0 mt-4">
                                                        View Competition <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No Tickets Yet</h3>
                                    <p className="text-muted-foreground mb-4">Purchase tickets to enter competitions</p>
                                    <Link to="/competitions">
                                        <Button className="btn-primary">
                                            Browse Competitions
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </TabsContent>

                        {/* Wallet Tab */}
                        <TabsContent value="wallet" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="glass border-secondary/30">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                                            <Wallet className="w-8 h-8 text-secondary" />
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                                        <p className="text-4xl font-bold text-secondary mb-6">
                                            £{(user?.balance || 0).toFixed(2)}
                                        </p>
                                        <Button 
                                            className="btn-secondary w-full"
                                            onClick={() => setShowDepositDialog(true)}
                                            data-testid="deposit-btn"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Funds
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="glass border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Payment Methods</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 mb-4">
                                            <CreditCard className="w-8 h-8 text-accent" />
                                            <div>
                                                <p className="font-medium">Viva Payments</p>
                                                <p className="text-sm text-muted-foreground">Secure card payments</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            All payments are processed securely through Viva Payments. We never store your card details.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="space-y-6">
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : transactions.length > 0 ? (
                                <Card className="glass border-white/10">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full table-modern">
                                                <thead>
                                                    <tr className="border-b border-white/10">
                                                        <th>Date</th>
                                                        <th>Type</th>
                                                        <th>Description</th>
                                                        <th>Status</th>
                                                        <th className="text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.map((txn) => (
                                                        <tr key={txn.transaction_id} data-testid={`txn-${txn.transaction_id}`}>
                                                            <td className="text-sm">
                                                                {new Date(txn.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <Badge variant="outline" className="capitalize">
                                                                    {txn.transaction_type.replace('_', ' ')}
                                                                </Badge>
                                                            </td>
                                                            <td className="text-sm text-muted-foreground">
                                                                {txn.description}
                                                            </td>
                                                            <td>
                                                                <Badge className={
                                                                    txn.status === 'completed' ? 'status-active' :
                                                                    txn.status === 'pending' ? 'status-completed' :
                                                                    'bg-destructive/20 text-destructive'
                                                                }>
                                                                    {txn.status}
                                                                </Badge>
                                                            </td>
                                                            <td className={`text-right font-bold ${
                                                                txn.amount > 0 ? 'text-secondary' : 'text-primary'
                                                            }`}>
                                                                {txn.amount > 0 ? '+' : ''}£{Math.abs(txn.amount).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="text-center py-16">
                                    <History className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No Transaction History</h3>
                                    <p className="text-muted-foreground">Your transaction history will appear here</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            {/* Deposit Dialog */}
            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
                <DialogContent className="sm:max-w-md glass border-white/10">
                    <DialogHeader>
                        <DialogTitle>Add Funds</DialogTitle>
                        <DialogDescription>
                            Deposit money to your wallet using Viva Payments
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (£)</Label>
                            <div className="relative">
                                <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="10.00"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    className="pl-10 input-modern"
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
                                    className="border-white/20"
                                >
                                    £{amt}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
                            Cancel
                        </Button>
                        <Button 
                            className="btn-secondary"
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
