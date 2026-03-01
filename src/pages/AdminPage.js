import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import { 
    Shield, LayoutDashboard, Trophy, Users, Ticket, Plus, Edit, Trash2, 
    Loader2, ArrowLeft, Zap, Clock, Search, DollarSign, Award, CheckCircle,
    XCircle, User, RefreshCw, BarChart3
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Helper to extract error message from axios error
const getErrorMessage = (error, fallback = 'Operation failed') => {
    const detail = error.response?.data?.detail;
    if (!detail) return fallback;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
    if (typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
    return fallback;
};

const AdminPage = () => {
    const { user, token, isAdmin } = useAuth();
    const { t, isRomanian } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [competitions, setCompetitions] = useState([]);
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [winners, setWinners] = useState([]);

    // Modals
    const [showCompModal, setShowCompModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [editingComp, setEditingComp] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    // Form states
    const [compForm, setCompForm] = useState({
        title: '', description: '', ticket_price: '', max_tickets: '', 
        competition_type: 'instant_win', image_url: '', prize_description: '',
        qual_question: '', qual_option1: '', qual_option2: '', qual_option3: '', qual_correct: '0'
    });
    const [userForm, setUserForm] = useState({ balance_change: '', new_password: '', role: '' });
    const [winnerForm, setWinnerForm] = useState({ competition_id: '', user_id: '', ticket_number: '', prize_description: '' });

    // Filters
    const [ticketFilter, setTicketFilter] = useState({ competition_id: '', username: '' });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/dashboard');
            return;
        }
        fetchAll();
    }, [isAdmin, navigate]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, compsRes, usersRes, winnersRes] = await Promise.all([
                axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/competitions`),
                axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API}/winners`)
            ]);
            setStats(statsRes.data);
            setCompetitions(compsRes.data);
            setUsers(usersRes.data);
            setWinners(winnersRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTickets = async () => {
        try {
            let url = `${API}/admin/tickets`;
            const params = new URLSearchParams();
            if (ticketFilter.competition_id) params.append('competition_id', ticketFilter.competition_id);
            if (ticketFilter.username) params.append('username', ticketFilter.username);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setTickets(response.data);
        } catch (error) {
            toast.error('Failed to fetch tickets');
        }
    };

    // Competition handlers
    const handleCompSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                title: compForm.title,
                description: compForm.description,
                ticket_price: parseFloat(compForm.ticket_price),
                max_tickets: parseInt(compForm.max_tickets),
                competition_type: compForm.competition_type,
                image_url: compForm.image_url,
                prize_description: compForm.prize_description
            };
            
            // Include custom qualification question if provided
            if (compForm.qual_question && compForm.qual_option1 && compForm.qual_option2 && compForm.qual_option3) {
                data.qualification_question = {
                    question: compForm.qual_question,
                    options: [compForm.qual_option1, compForm.qual_option2, compForm.qual_option3],
                    correct_answer: parseInt(compForm.qual_correct)
                };
            }
            
            if (editingComp) {
                await axios.put(`${API}/admin/competitions/${editingComp.competition_id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Competition updated');
            } else {
                await axios.post(`${API}/admin/competitions`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Competition created');
            }
            setShowCompModal(false);
            setEditingComp(null);
            setCompForm({ title: '', description: '', ticket_price: '', max_tickets: '', competition_type: 'instant_win', image_url: '', prize_description: '', qual_question: '', qual_option1: '', qual_option2: '', qual_option3: '', qual_correct: '0' });
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const handleDeleteComp = async (compId) => {
        if (!confirm('Are you sure you want to delete this competition?')) return;
        try {
            await axios.delete(`${API}/admin/competitions/${compId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Competition deleted');
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Delete failed'));
        }
    };

    const handleEndComp = async (compId) => {
        if (!confirm('Are you sure you want to end this competition?')) return;
        try {
            await axios.post(`${API}/admin/competitions/${compId}/end`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Competition ended');
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const handleDrawWinner = async (compId) => {
        if (!confirm('Are you sure you want to draw a winner for this competition?')) return;
        try {
            const response = await axios.post(`${API}/admin/competitions/${compId}/draw-winner`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Winner drawn: Ticket #${response.data.ticket_number}`);
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Draw failed'));
        }
    };

    // User handlers
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {};
            if (userForm.balance_change) data.balance_change = parseFloat(userForm.balance_change);
            if (userForm.new_password) data.new_password = userForm.new_password;
            if (userForm.role) data.role = userForm.role;
            
            await axios.put(`${API}/admin/users/${editingUser.user_id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User updated');
            setShowUserModal(false);
            setEditingUser(null);
            setUserForm({ balance_change: '', new_password: '', role: '' });
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Update failed'));
        }
    };

    // Winner handlers
    const handleWinnerSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/admin/winners`, {
                competition_id: winnerForm.competition_id,
                user_id: winnerForm.user_id,
                ticket_number: parseInt(winnerForm.ticket_number),
                prize_description: winnerForm.prize_description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Winner added');
            setShowWinnerModal(false);
            setWinnerForm({ competition_id: '', user_id: '', ticket_number: '', prize_description: '' });
            fetchAll();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Operation failed'));
        }
    };

    const openEditComp = (comp) => {
        setEditingComp(comp);
        const qual = comp.qualification_question;
        setCompForm({
            title: comp.title,
            description: comp.description,
            ticket_price: comp.ticket_price.toString(),
            max_tickets: comp.max_tickets.toString(),
            competition_type: comp.competition_type,
            image_url: comp.image_url || '',
            prize_description: comp.prize_description || '',
            qual_question: qual?.question || '',
            qual_option1: qual?.options?.[0] || '',
            qual_option2: qual?.options?.[1] || '',
            qual_option3: qual?.options?.[2] || '',
            qual_correct: qual?.correct_answer?.toString() || '0'
        });
        setShowCompModal(true);
    };

    const openEditUser = (u) => {
        setEditingUser(u);
        setUserForm({ balance_change: '', new_password: '', role: u.role });
        setShowUserModal(true);
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-xl font-black tracking-tighter">
                                <span className="gradient-text">ZEKTRIX</span>
                                <span className="text-white">.UK</span>
                            </Link>
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                                <Shield className="w-3 h-3 mr-1" /> Admin
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={fetchAll} data-testid="refresh-btn">
                                <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                            </Button>
                            <Link to="/dashboard">
                                <Button variant="outline" className="border-white/20" data-testid="back-to-dashboard">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="bg-muted p-1 mb-8">
                                <TabsTrigger value="dashboard" data-testid="admin-tab-dashboard">
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> {t('admin_dashboard')}
                                </TabsTrigger>
                                <TabsTrigger value="analytics" data-testid="admin-tab-analytics">
                                    <BarChart3 className="w-4 h-4 mr-2" /> {isRomanian ? 'Analize' : 'Analytics'}
                                </TabsTrigger>
                                <TabsTrigger value="competitions" data-testid="admin-tab-competitions">
                                    <Trophy className="w-4 h-4 mr-2" /> {t('admin_competitions')}
                                </TabsTrigger>
                                <TabsTrigger value="users" data-testid="admin-tab-users">
                                    <Users className="w-4 h-4 mr-2" /> {t('admin_users')}
                                </TabsTrigger>
                                <TabsTrigger value="tickets" data-testid="admin-tab-tickets">
                                    <Ticket className="w-4 h-4 mr-2" /> {t('admin_tickets')}
                                </TabsTrigger>
                                <TabsTrigger value="winners" data-testid="admin-tab-winners">
                                    <Award className="w-4 h-4 mr-2" /> {t('admin_winners')}
                                </TabsTrigger>
                            </TabsList>

                            {/* Analytics Tab */}
                            <TabsContent value="analytics">
                                <AnalyticsDashboard />
                            </TabsContent>

                            {/* Dashboard Tab */}
                            <TabsContent value="dashboard">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Card className="glass border-white/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                                    <Users className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                                    <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
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
                                                    <p className="text-2xl font-bold">{stats?.total_competitions || 0}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass border-white/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                                                    <Zap className="w-6 h-6 text-accent" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Active</p>
                                                    <p className="text-2xl font-bold">{stats?.active_competitions || 0}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="glass border-white/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                                    <Ticket className="w-6 h-6 text-yellow-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Total Tickets</p>
                                                    <p className="text-2xl font-bold">{stats?.total_tickets || 0}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* Competitions Tab */}
                            <TabsContent value="competitions">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Manage Competitions</h2>
                                    <Button className="btn-primary" onClick={() => { setEditingComp(null); setCompForm({ title: '', description: '', ticket_price: '', max_tickets: '', competition_type: 'instant_win', image_url: '', prize_description: '' }); setShowCompModal(true); }} data-testid="add-competition-btn">
                                        <Plus className="w-4 h-4 mr-2" /> Add Competition
                                    </Button>
                                </div>
                                <div className="grid gap-4">
                                    {competitions.map((comp) => (
                                        <Card key={comp.competition_id} className="glass border-white/10" data-testid={`admin-comp-${comp.competition_id}`}>
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-bold text-lg">{comp.title}</h3>
                                                            <Badge className={comp.competition_type === 'instant_win' ? 'badge-instant' : 'badge-classic'}>
                                                                {comp.competition_type === 'instant_win' ? <Zap className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                                                                {comp.competition_type === 'instant_win' ? 'Instant' : 'Classic'}
                                                            </Badge>
                                                            <Badge className={comp.status === 'active' ? 'status-active' : 'status-completed'}>
                                                                {comp.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mb-2">{comp.description}</p>
                                                        <div className="flex gap-4 text-sm">
                                                            <span>Price: <strong>RON {comp.ticket_price.toFixed(2)}</strong></span>
                                                            <span>Sold: <strong>{comp.sold_tickets}/{comp.max_tickets}</strong></span>
                                                            {comp.winner_ticket && <span className="text-secondary">Winner: <strong>#{comp.winner_ticket}</strong></span>}
                                                        </div>
                                                        <Progress value={(comp.sold_tickets / comp.max_tickets) * 100} className="h-2 mt-2 max-w-xs" />
                                                    </div>
                                                    <div className="flex gap-2 flex-wrap">
                                                        <Button variant="outline" size="sm" onClick={() => openEditComp(comp)} data-testid={`edit-comp-${comp.competition_id}`}>
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                        {comp.status === 'active' && comp.competition_type === 'classic' && (
                                                            <>
                                                                <Button variant="outline" size="sm" onClick={() => handleEndComp(comp.competition_id)} className="border-yellow-500/30 text-yellow-500" data-testid={`end-comp-${comp.competition_id}`}>
                                                                    End
                                                                </Button>
                                                                {comp.sold_tickets > 0 && (
                                                                    <Button size="sm" className="btn-secondary" onClick={() => handleDrawWinner(comp.competition_id)} data-testid={`draw-winner-${comp.competition_id}`}>
                                                                        <Award className="w-4 h-4 mr-1" /> Draw
                                                                    </Button>
                                                                )}
                                                            </>
                                                        )}
                                                        <Button variant="outline" size="sm" onClick={() => handleDeleteComp(comp.competition_id)} className="border-destructive/30 text-destructive" data-testid={`delete-comp-${comp.competition_id}`}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Users Tab */}
                            <TabsContent value="users">
                                <h2 className="text-2xl font-bold mb-6">Manage Users</h2>
                                <Card className="glass border-white/10">
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full table-modern">
                                                <thead>
                                                    <tr className="border-b border-white/10">
                                                        <th>User</th>
                                                        <th>Email</th>
                                                        <th>Balance</th>
                                                        <th>Role</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((u) => (
                                                        <tr key={u.user_id} data-testid={`admin-user-${u.user_id}`}>
                                                            <td className="font-medium">{u.username}</td>
                                                            <td className="text-muted-foreground">{u.email}</td>
                                                            <td className="text-secondary font-bold">RON {(u.balance || 0).toFixed(2)}</td>
                                                            <td>
                                                                <Badge className={u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted'}>
                                                                    {u.role}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <Button variant="outline" size="sm" onClick={() => openEditUser(u)} data-testid={`edit-user-${u.user_id}`}>
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Tickets Tab */}
                            <TabsContent value="tickets">
                                <h2 className="text-2xl font-bold mb-6">View All Tickets</h2>
                                <Card className="glass border-white/10 mb-6">
                                    <CardContent className="p-4">
                                        <div className="flex flex-wrap gap-4">
                                            <Select value={ticketFilter.competition_id} onValueChange={(v) => setTicketFilter(prev => ({ ...prev, competition_id: v === 'all' ? '' : v }))}>
                                                <SelectTrigger className="w-[250px] bg-muted border-white/10" data-testid="ticket-filter-comp">
                                                    <SelectValue placeholder="Filter by Competition" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Competitions</SelectItem>
                                                    {competitions.map((c) => (
                                                        <SelectItem key={c.competition_id} value={c.competition_id}>{c.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                placeholder="Search by username"
                                                value={ticketFilter.username}
                                                onChange={(e) => setTicketFilter(prev => ({ ...prev, username: e.target.value }))}
                                                className="w-[200px] input-modern"
                                                data-testid="ticket-filter-username"
                                            />
                                            <Button onClick={fetchTickets} data-testid="search-tickets-btn">
                                                <Search className="w-4 h-4 mr-2" /> Search
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                {tickets.length > 0 ? (
                                    <Card className="glass border-white/10">
                                        <CardContent className="p-0">
                                            <div className="overflow-x-auto max-h-[500px]">
                                                <table className="w-full table-modern">
                                                    <thead className="sticky top-0 bg-card">
                                                        <tr className="border-b border-white/10">
                                                            <th>Ticket #</th>
                                                            <th>Competition</th>
                                                            <th>User</th>
                                                            <th>Purchased</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {tickets.map((t) => (
                                                            <tr key={t.ticket_id}>
                                                                <td><span className="ticket-badge">#{t.ticket_number}</span></td>
                                                                <td>{t.competition_title || t.competition_id}</td>
                                                                <td>{t.username || t.user_id}</td>
                                                                <td className="text-muted-foreground">{new Date(t.purchased_at).toLocaleDateString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Card className="glass border-white/10">
                                        <CardContent className="p-8 text-center">
                                            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground">Click Search to view tickets</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Winners Tab */}
                            <TabsContent value="winners">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold">Manage Winners</h2>
                                    <Button className="btn-secondary" onClick={() => setShowWinnerModal(true)} data-testid="add-winner-btn">
                                        <Plus className="w-4 h-4 mr-2" /> Add Winner Manually
                                    </Button>
                                </div>
                                <div className="grid gap-4">
                                    {winners.map((w) => (
                                        <Card key={w.winner_id} className="winner-card rounded-xl" data-testid={`admin-winner-${w.winner_id}`}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                                                            <Trophy className="w-6 h-6 text-secondary" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold">{w.username}</h3>
                                                            <p className="text-sm text-muted-foreground">{w.competition_title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-muted-foreground">Ticket</p>
                                                        <p className="text-xl font-bold text-primary">#{w.ticket_number}</p>
                                                    </div>
                                                    <Badge className={w.is_automatic ? 'badge-instant' : 'badge-classic'}>
                                                        {w.is_automatic ? 'Auto' : 'Manual'}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </main>

            {/* Competition Modal */}
            <Dialog open={showCompModal} onOpenChange={setShowCompModal}>
                <DialogContent className="sm:max-w-lg glass border-white/10">
                    <DialogHeader>
                        <DialogTitle>{editingComp ? 'Edit Competition' : 'Add Competition'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCompSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Title</Label>
                                <Input value={compForm.title} onChange={(e) => setCompForm(prev => ({ ...prev, title: e.target.value }))} className="input-modern" required data-testid="comp-title-input" />
                            </div>
                            <div className="col-span-2">
                                <Label>Description</Label>
                                <Textarea value={compForm.description} onChange={(e) => setCompForm(prev => ({ ...prev, description: e.target.value }))} className="input-modern" required data-testid="comp-desc-input" />
                            </div>
                            <div>
                                <Label>Ticket Price (RON )</Label>
                                <Input type="number" step="0.01" value={compForm.ticket_price} onChange={(e) => setCompForm(prev => ({ ...prev, ticket_price: e.target.value }))} className="input-modern" required data-testid="comp-price-input" />
                            </div>
                            <div>
                                <Label>Max Tickets</Label>
                                <Input type="number" value={compForm.max_tickets} onChange={(e) => setCompForm(prev => ({ ...prev, max_tickets: e.target.value }))} className="input-modern" required data-testid="comp-max-input" />
                            </div>
                            <div className="col-span-2">
                                <Label>Type</Label>
                                <Select value={compForm.competition_type} onValueChange={(v) => setCompForm(prev => ({ ...prev, competition_type: v }))}>
                                    <SelectTrigger className="bg-muted border-white/10" data-testid="comp-type-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant_win">Instant Win (auto draw at 100%)</SelectItem>
                                        <SelectItem value="classic">Classic (manual draw)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Label>Image URL</Label>
                                <Input value={compForm.image_url} onChange={(e) => setCompForm(prev => ({ ...prev, image_url: e.target.value }))} className="input-modern" placeholder="https://..." data-testid="comp-image-input" />
                            </div>
                            <div className="col-span-2">
                                <Label>Prize Description</Label>
                                <Input value={compForm.prize_description} onChange={(e) => setCompForm(prev => ({ ...prev, prize_description: e.target.value }))} className="input-modern" data-testid="comp-prize-input" />
                            </div>
                            
                            {/* Qualification Question Section */}
                            <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                                <p className="text-sm font-medium mb-3 text-accent">Întrebare de Calificare (opțional - se generează automat dacă e gol)</p>
                            </div>
                            <div className="col-span-2">
                                <Label>Întrebare</Label>
                                <Input value={compForm.qual_question} onChange={(e) => setCompForm(prev => ({ ...prev, qual_question: e.target.value }))} className="input-modern" placeholder="Ex: Care este capitala României?" data-testid="comp-qual-question" />
                            </div>
                            <div>
                                <Label>Opțiune 1</Label>
                                <Input value={compForm.qual_option1} onChange={(e) => setCompForm(prev => ({ ...prev, qual_option1: e.target.value }))} className="input-modern" placeholder="Răspuns 1" data-testid="comp-qual-opt1" />
                            </div>
                            <div>
                                <Label>Opțiune 2</Label>
                                <Input value={compForm.qual_option2} onChange={(e) => setCompForm(prev => ({ ...prev, qual_option2: e.target.value }))} className="input-modern" placeholder="Răspuns 2" data-testid="comp-qual-opt2" />
                            </div>
                            <div>
                                <Label>Opțiune 3</Label>
                                <Input value={compForm.qual_option3} onChange={(e) => setCompForm(prev => ({ ...prev, qual_option3: e.target.value }))} className="input-modern" placeholder="Răspuns 3" data-testid="comp-qual-opt3" />
                            </div>
                            <div>
                                <Label>Răspuns Corect</Label>
                                <Select value={compForm.qual_correct} onValueChange={(v) => setCompForm(prev => ({ ...prev, qual_correct: v }))}>
                                    <SelectTrigger className="bg-muted border-white/10" data-testid="comp-qual-correct">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">Opțiune 1</SelectItem>
                                        <SelectItem value="1">Opțiune 2</SelectItem>
                                        <SelectItem value="2">Opțiune 3</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCompModal(false)}>Cancel</Button>
                            <Button type="submit" className="btn-primary" data-testid="comp-submit-btn">{editingComp ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* User Modal */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="sm:max-w-md glass border-white/10">
                    <DialogHeader>
                        <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                        <div>
                            <Label>Balance Adjustment (RON )</Label>
                            <Input type="number" step="0.01" value={userForm.balance_change} onChange={(e) => setUserForm(prev => ({ ...prev, balance_change: e.target.value }))} className="input-modern" placeholder="+10 or -5" data-testid="user-balance-input" />
                            <p className="text-xs text-muted-foreground mt-1">Current: RON {(editingUser?.balance || 0).toFixed(2)}</p>
                        </div>
                        <div>
                            <Label>New Password (leave empty to keep current)</Label>
                            <Input type="password" value={userForm.new_password} onChange={(e) => setUserForm(prev => ({ ...prev, new_password: e.target.value }))} className="input-modern" data-testid="user-password-input" />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Select value={userForm.role} onValueChange={(v) => setUserForm(prev => ({ ...prev, role: v }))}>
                                <SelectTrigger className="bg-muted border-white/10" data-testid="user-role-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Cancel</Button>
                            <Button type="submit" className="btn-primary" data-testid="user-submit-btn">Update User</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Winner Modal */}
            <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
                <DialogContent className="sm:max-w-md glass border-white/10">
                    <DialogHeader>
                        <DialogTitle>Add Winner Manually</DialogTitle>
                        <DialogDescription>For classic competitions only</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWinnerSubmit} className="space-y-4">
                        <div>
                            <Label>Competition</Label>
                            <Select value={winnerForm.competition_id} onValueChange={(v) => setWinnerForm(prev => ({ ...prev, competition_id: v }))}>
                                <SelectTrigger className="bg-muted border-white/10" data-testid="winner-comp-select">
                                    <SelectValue placeholder="Select competition" />
                                </SelectTrigger>
                                <SelectContent>
                                    {competitions.filter(c => c.competition_type === 'classic').map((c) => (
                                        <SelectItem key={c.competition_id} value={c.competition_id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>User</Label>
                            <Select value={winnerForm.user_id} onValueChange={(v) => setWinnerForm(prev => ({ ...prev, user_id: v }))}>
                                <SelectTrigger className="bg-muted border-white/10" data-testid="winner-user-select">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((u) => (
                                        <SelectItem key={u.user_id} value={u.user_id}>{u.username}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Ticket Number</Label>
                            <Input type="number" value={winnerForm.ticket_number} onChange={(e) => setWinnerForm(prev => ({ ...prev, ticket_number: e.target.value }))} className="input-modern" required data-testid="winner-ticket-input" />
                        </div>
                        <div>
                            <Label>Prize Description (optional)</Label>
                            <Input value={winnerForm.prize_description} onChange={(e) => setWinnerForm(prev => ({ ...prev, prize_description: e.target.value }))} className="input-modern" data-testid="winner-prize-input" />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowWinnerModal(false)}>Cancel</Button>
                            <Button type="submit" className="btn-secondary" data-testid="winner-submit-btn">Add Winner</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPage;
