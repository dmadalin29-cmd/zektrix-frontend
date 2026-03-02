import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { 
    Shield, LayoutDashboard, Trophy, Users, Ticket, Plus, Edit, Trash2, 
    Loader2, ArrowLeft, Zap, Clock, Search, DollarSign, Award, CheckCircle,
    XCircle, User, RefreshCw, BarChart3, Settings, Wifi, WifiOff, Sparkles, Wand2, MessageCircle, Mail, TrendingUp, Eye
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Loading Skeleton
const Skeleton = ({ className }) => <div className={`animate-pulse bg-white/5 rounded ${className}`} />;

// Stats Card with animation
const StatCard = ({ icon: Icon, label, value, color, loading }) => (
    <div className="bg-[#12111a] rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-all">
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-16" />
            </div>
        ) : (
            <>
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
            </>
        )}
    </div>
);

// Table Row Skeleton
const TableSkeleton = ({ cols = 5, rows = 5 }) => (
    <tbody>
        {[...Array(rows)].map((_, i) => (
            <tr key={i} className="border-b border-white/5">
                {[...Array(cols)].map((_, j) => (
                    <td key={j} className="p-3"><Skeleton className="h-4 w-full" /></td>
                ))}
            </tr>
        ))}
    </tbody>
);

const AdminPage = () => {
    const { user, token, isAdmin } = useAuth();
    const { isRomanian } = useLanguage();
    const navigate = useNavigate();

    const [tab, setTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [comps, setComps] = useState([]);
    const [users, setUsers] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [winners, setWinners] = useState([]);
    const [chatMsgs, setChatMsgs] = useState([]);
    const [liveStatus, setLiveStatus] = useState({ isLive: false, message: '' });

    // Modals
    const [showCompModal, setShowCompModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingComp, setEditingComp] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    // Forms
    const [compForm, setCompForm] = useState({
        title: '', description: '', ticket_price: '', max_tickets: '', 
        competition_type: 'instant_win', image_url: '', prize_description: '', category: 'general',
        qual_question: '', qual_option1: '', qual_option2: '', qual_correct: '0'
    });
    const [userForm, setUserForm] = useState({ first_name: '', last_name: '', email: '', phone: '', balance: '', new_password: '', role: '' });
    const [ticketSearch, setTicketSearch] = useState('');
    const [genAI, setGenAI] = useState(false);

    // Fetch all data
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, compsRes, usersRes, ticketsRes, winnersRes] = await Promise.all([
                axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` }}).catch(() => ({ data: {} })),
                axios.get(`${API}/competitions`).catch(() => ({ data: [] })),
                axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` }}).catch(() => ({ data: [] })),
                axios.get(`${API}/admin/tickets`, { headers: { Authorization: `Bearer ${token}` }}).catch(() => ({ data: [] })),
                axios.get(`${API}/winners`).catch(() => ({ data: [] }))
            ]);
            setStats(statsRes.data);
            setComps(compsRes.data);
            setUsers(usersRes.data);
            setTickets(ticketsRes.data);
            setWinners(winnersRes.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    }, [token]);

    useEffect(() => {
        if (!isAdmin) { navigate('/dashboard'); return; }
        fetchAll();
        axios.get(`${API}/settings/live-status`).then(r => setLiveStatus(r.data)).catch(() => {});
        axios.get(`${API}/admin/chat/messages`, { headers: { Authorization: `Bearer ${token}` }}).then(r => setChatMsgs(r.data)).catch(() => {});
    }, [isAdmin, navigate, fetchAll, token]);

    // AI Generate
    const generateAI = async () => {
        if (!compForm.title) { toast.error('Introdu titlul întâi'); return; }
        setGenAI(true);
        try {
            const r = await axios.post(`${API}/admin/generate-ai-content`, { title: compForm.title }, { headers: { Authorization: `Bearer ${token}` }});
            if (r.data.description) setCompForm(p => ({ ...p, description: r.data.description }));
            if (r.data.qualification_question) {
                const q = r.data.qualification_question;
                setCompForm(p => ({ ...p, qual_question: q.question || '', qual_option1: q.options?.[0] || '', qual_option2: q.options?.[1] || '', qual_correct: '0' }));
            }
            toast.success('✨ Generat cu AI!');
        } catch { toast.error('Eroare AI'); }
        setGenAI(false);
    };

    // Competition CRUD
    const saveComp = async (e) => {
        e.preventDefault();
        const data = {
            title: compForm.title, description: compForm.description,
            ticket_price: parseFloat(compForm.ticket_price), max_tickets: parseInt(compForm.max_tickets),
            competition_type: compForm.competition_type, image_url: compForm.image_url,
            prize_description: compForm.prize_description, category: compForm.category,
            qualification_question: compForm.qual_question ? {
                question: compForm.qual_question,
                options: [compForm.qual_option1, compForm.qual_option2],
                correct_answer: parseInt(compForm.qual_correct)
            } : null
        };
        try {
            if (editingComp) {
                await axios.put(`${API}/admin/competitions/${editingComp.competition_id}`, data, { headers: { Authorization: `Bearer ${token}` }});
                toast.success('Competiție actualizată!');
            } else {
                await axios.post(`${API}/admin/competitions`, data, { headers: { Authorization: `Bearer ${token}` }});
                toast.success('Competiție creată!');
            }
            setShowCompModal(false);
            setEditingComp(null);
            setCompForm({ title: '', description: '', ticket_price: '', max_tickets: '', competition_type: 'instant_win', image_url: '', prize_description: '', category: 'general', qual_question: '', qual_option1: '', qual_option2: '', qual_correct: '0' });
            fetchAll();
        } catch (e) { toast.error(e.response?.data?.detail || 'Eroare'); }
    };

    const delComp = async (id) => {
        if (!window.confirm('Ștergi competiția?')) return;
        try {
            await axios.delete(`${API}/admin/competitions/${id}`, { headers: { Authorization: `Bearer ${token}` }});
            toast.success('Șters!');
            fetchAll();
        } catch { toast.error('Eroare'); }
    };

    const editComp = (c) => {
        setEditingComp(c);
        setCompForm({
            title: c.title, description: c.description, ticket_price: c.ticket_price.toString(),
            max_tickets: c.max_tickets.toString(), competition_type: c.competition_type,
            image_url: c.image_url || '', prize_description: c.prize_description || '', category: c.category || 'general',
            qual_question: c.qualification_question?.question || '',
            qual_option1: c.qualification_question?.options?.[0] || '',
            qual_option2: c.qualification_question?.options?.[1] || '',
            qual_correct: (c.qualification_question?.correct_answer || 0).toString()
        });
        setShowCompModal(true);
    };

    // User CRUD
    const saveUser = async (e) => {
        e.preventDefault();
        const data = {};
        if (userForm.first_name) data.first_name = userForm.first_name;
        if (userForm.last_name) data.last_name = userForm.last_name;
        if (userForm.email) data.email = userForm.email;
        if (userForm.phone) data.phone = userForm.phone;
        if (userForm.balance) data.balance = parseFloat(userForm.balance);
        if (userForm.new_password) data.new_password = userForm.new_password;
        if (userForm.role) data.role = userForm.role;
        try {
            await axios.put(`${API}/admin/users/${editingUser.user_id}`, data, { headers: { Authorization: `Bearer ${token}` }});
            toast.success('Utilizator actualizat!');
            setShowUserModal(false);
            fetchAll();
        } catch (e) { toast.error(e.response?.data?.detail || 'Eroare'); }
    };

    const blockUser = async (u) => {
        if (!window.confirm(`${u.is_blocked ? 'Deblochezi' : 'Blochezi'} ${u.username}?`)) return;
        try {
            await axios.put(`${API}/admin/users/${u.user_id}`, { is_blocked: !u.is_blocked }, { headers: { Authorization: `Bearer ${token}` }});
            toast.success(u.is_blocked ? 'Deblocat!' : 'Blocat!');
            fetchAll();
        } catch { toast.error('Eroare'); }
    };

    const delUser = async (u) => {
        if (!window.confirm(`Ștergi permanent ${u.username}?`)) return;
        try {
            await axios.delete(`${API}/admin/users/${u.user_id}`, { headers: { Authorization: `Bearer ${token}` }});
            toast.success('Șters!');
            fetchAll();
        } catch { toast.error('Eroare'); }
    };

    const editUser = (u) => {
        setEditingUser(u);
        setUserForm({ first_name: u.first_name || '', last_name: u.last_name || '', email: u.email || '', phone: u.phone || '', balance: (u.balance || 0).toString(), new_password: '', role: u.role || 'user' });
        setShowUserModal(true);
    };

    // Live Status
    const toggleLive = async () => {
        try {
            await axios.put(`${API}/admin/live-status`, { isLive: !liveStatus.isLive, message: liveStatus.message }, { headers: { Authorization: `Bearer ${token}` }});
            setLiveStatus(p => ({ ...p, isLive: !p.isLive }));
            toast.success(!liveStatus.isLive ? '🔴 LIVE!' : 'Oprit');
        } catch { toast.error('Eroare'); }
    };

    // End Competition
    const endComp = async (c) => {
        const ticketNum = window.prompt(`Numărul biletului câștigător pentru "${c.title}":`);
        if (!ticketNum) return;
        try {
            await axios.post(`${API}/admin/competitions/${c.competition_id}/end`, { winning_ticket: parseInt(ticketNum) }, { headers: { Authorization: `Bearer ${token}` }});
            toast.success('Premiant anunțat!');
            fetchAll();
        } catch (e) { toast.error(e.response?.data?.detail || 'Eroare'); }
    };

    // Filtered tickets
    const filteredTickets = tickets.filter(t => !ticketSearch || t.username?.toLowerCase().includes(ticketSearch.toLowerCase()) || t.user_email?.toLowerCase().includes(ticketSearch.toLowerCase()));

    const tabItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Prezentare' },
        { id: 'analytics', icon: BarChart3, label: 'Analize' },
        { id: 'comps', icon: Trophy, label: 'Competiții' },
        { id: 'users', icon: Users, label: 'Utilizatori' },
        { id: 'tickets', icon: Ticket, label: 'Bilete' },
        { id: 'winners', icon: Award, label: 'Premianți' },
        { id: 'settings', icon: Settings, label: 'Setări' },
        { id: 'chat', icon: MessageCircle, label: 'Chat' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0614]">
            {/* Header */}
            <div className="bg-[#12111a] border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-violet-400" />
                            <span className="font-bold text-white">Admin Panel</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={fetchAll} className="text-gray-400 hover:text-white">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                        <Badge className="bg-violet-500/20 text-violet-400">{user?.username}</Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
                    {tabItems.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                tab === t.id ? 'bg-violet-600 text-white' : 'bg-[#12111a] text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {tab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard icon={Trophy} label="Competiții Active" value={stats?.active_competitions || 0} color="bg-violet-600" loading={loading} />
                            <StatCard icon={Users} label="Total Utilizatori" value={stats?.total_users || 0} color="bg-blue-600" loading={loading} />
                            <StatCard icon={Ticket} label="Bilete Vândute" value={stats?.total_tickets || 0} color="bg-emerald-600" loading={loading} />
                            <StatCard icon={DollarSign} label="Venit Total" value={`RON ${(stats?.total_revenue || 0).toFixed(0)}`} color="bg-orange-600" loading={loading} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <StatCard icon={Award} label="Total Premianți" value={stats?.total_winners || 0} color="bg-yellow-600" loading={loading} />
                            <StatCard icon={TrendingUp} label="Tranzacții" value={stats?.total_transactions || 0} color="bg-cyan-600" loading={loading} />
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {tab === 'analytics' && <AnalyticsDashboard />}

                {/* Competitions Tab */}
                {tab === 'comps' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Competiții ({comps.length})</h2>
                            <Button onClick={() => { setEditingComp(null); setCompForm({ title: '', description: '', ticket_price: '', max_tickets: '', competition_type: 'instant_win', image_url: '', prize_description: '', category: 'general', qual_question: '', qual_option1: '', qual_option2: '', qual_correct: '0' }); setShowCompModal(true); }} className="bg-violet-600 hover:bg-violet-700">
                                <Plus className="w-4 h-4 mr-2" /> Adaugă
                            </Button>
                        </div>
                        <div className="bg-[#12111a] rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5">
                                    <tr className="text-left text-gray-400">
                                        <th className="p-3">Titlu</th>
                                        <th className="p-3">Preț</th>
                                        <th className="p-3">Progress</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Acțiuni</th>
                                    </tr>
                                </thead>
                                {loading ? <TableSkeleton cols={5} rows={5} /> : (
                                    <tbody>
                                        {comps.map(c => {
                                            const pct = Math.round((c.sold_tickets / c.max_tickets) * 100);
                                            return (
                                                <tr key={c.competition_id} className="border-t border-white/5 hover:bg-white/5">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <img src={c.image_url || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
                                                            <div>
                                                                <p className="font-medium text-white">{c.title}</p>
                                                                <p className="text-xs text-gray-500">{c.category}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-violet-400 font-bold">RON {c.ticket_price}</td>
                                                    <td className="p-3">
                                                        <div className="w-24">
                                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                                <div className="h-full bg-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">{c.sold_tickets}/{c.max_tickets} ({pct}%)</p>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge className={c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}>
                                                            {c.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="sm" onClick={() => editComp(c)}><Edit className="w-4 h-4" /></Button>
                                                            {c.status === 'active' && <Button variant="ghost" size="sm" onClick={() => endComp(c)} className="text-yellow-400"><Award className="w-4 h-4" /></Button>}
                                                            <Button variant="ghost" size="sm" onClick={() => delComp(c.competition_id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {tab === 'users' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Utilizatori ({users.length})</h2>
                        <div className="bg-[#12111a] rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5">
                                    <tr className="text-left text-gray-400">
                                        <th className="p-3">Utilizator</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Telefon</th>
                                        <th className="p-3">Sold</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Acțiuni</th>
                                    </tr>
                                </thead>
                                {loading ? <TableSkeleton cols={6} rows={5} /> : (
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u.user_id} className={`border-t border-white/5 hover:bg-white/5 ${u.is_blocked ? 'opacity-50' : ''}`}>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="font-medium text-white">{u.first_name || ''} {u.last_name || ''}</p>
                                                        <p className="text-xs text-gray-500">@{u.username}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-400">{u.email}</td>
                                                <td className="p-3 text-gray-400">{u.phone || '-'}</td>
                                                <td className="p-3 text-emerald-400 font-bold">RON {(u.balance || 0).toFixed(2)}</td>
                                                <td className="p-3">
                                                    {u.is_blocked ? (
                                                        <Badge className="bg-red-500/20 text-red-400"><XCircle className="w-3 h-3 mr-1" />Blocat</Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="w-3 h-3 mr-1" />Activ</Badge>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => editUser(u)}><Edit className="w-4 h-4" /></Button>
                                                        {u.role !== 'admin' && (
                                                            <>
                                                                <Button variant="ghost" size="sm" onClick={() => blockUser(u)} className={u.is_blocked ? 'text-emerald-400' : 'text-yellow-400'}>
                                                                    {u.is_blocked ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                </Button>
                                                                <Button variant="ghost" size="sm" onClick={() => delUser(u)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Tickets Tab */}
                {tab === 'tickets' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center flex-wrap gap-4">
                            <h2 className="text-xl font-bold text-white">Bilete ({tickets.length})</h2>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input placeholder="Caută după nume/email..." value={ticketSearch} onChange={e => setTicketSearch(e.target.value)} className="pl-10 bg-[#12111a] border-white/10 w-64" />
                            </div>
                        </div>
                        <div className="bg-[#12111a] rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5">
                                    <tr className="text-left text-gray-400">
                                        <th className="p-3">Bilet</th>
                                        <th className="p-3">Competiție</th>
                                        <th className="p-3">Utilizator</th>
                                        <th className="p-3">Data</th>
                                    </tr>
                                </thead>
                                {loading ? <TableSkeleton cols={4} rows={8} /> : (
                                    <tbody>
                                        {filteredTickets.slice(0, 50).map(t => (
                                            <tr key={t.ticket_id} className="border-t border-white/5 hover:bg-white/5">
                                                <td className="p-3 font-mono text-violet-400">#{t.ticket_number}</td>
                                                <td className="p-3 text-white">{t.competition_title || t.competition_id}</td>
                                                <td className="p-3">
                                                    <div>
                                                        <p className="text-white">{t.user_first_name} {t.user_last_name}</p>
                                                        <p className="text-xs text-gray-500">{t.user_email}</p>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-gray-400 text-xs">{new Date(t.purchase_date).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Winners Tab */}
                {tab === 'winners' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Premianți ({winners.length})</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-[#12111a] rounded-xl p-4 border border-white/5">
                                    <Skeleton className="h-32 w-full rounded-lg mb-3" />
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            )) : winners.map(w => (
                                <div key={w.winner_id} className="bg-[#12111a] rounded-xl p-4 border border-white/5 hover:border-violet-500/20 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <Award className="w-6 h-6 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{w.username}</p>
                                            <p className="text-xs text-gray-500">Bilet #{w.winning_ticket}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-2">{w.competition_title}</p>
                                    <p className="text-xs text-gray-500">{new Date(w.won_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {tab === 'settings' && (
                    <div className="space-y-6">
                        {/* Live Status */}
                        <div className="bg-[#12111a] rounded-xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {liveStatus.isLive ? <Wifi className="w-6 h-6 text-red-500 animate-pulse" /> : <WifiOff className="w-6 h-6 text-gray-500" />}
                                    <div>
                                        <h3 className="font-bold text-white">TikTok LIVE</h3>
                                        <p className="text-xs text-gray-500">{liveStatus.isLive ? 'Ești LIVE acum!' : 'Nu ești live'}</p>
                                    </div>
                                </div>
                                <Button onClick={toggleLive} className={liveStatus.isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}>
                                    {liveStatus.isLive ? 'Oprește LIVE' : 'Pornește LIVE'}
                                </Button>
                            </div>
                            <div>
                                <Label className="text-gray-400">Mesaj LIVE</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input value={liveStatus.message} onChange={e => setLiveStatus(p => ({ ...p, message: e.target.value }))} className="bg-white/5 border-white/10" placeholder="Mesaj pentru utilizatori..." />
                                    <Button variant="outline" onClick={() => axios.put(`${API}/admin/live-status`, liveStatus, { headers: { Authorization: `Bearer ${token}` }}).then(() => toast.success('Salvat!'))}>Salvează</Button>
                                </div>
                            </div>
                        </div>

                        {/* Email Bot */}
                        <div className="bg-[#12111a] rounded-xl p-6 border border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <Mail className="w-6 h-6 text-violet-400" />
                                <h3 className="font-bold text-white">Bot Email Notificări</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                                    <h4 className="font-semibold text-violet-400 mb-2">📬 Digest Zilnic</h4>
                                    <p className="text-xs text-gray-400 mb-3">Trimite email cu competiții noi și aproape terminate.</p>
                                    <Button onClick={() => axios.post(`${API}/admin/send-daily-digest`, {}, { headers: { Authorization: `Bearer ${token}` }}).then(r => toast.success(r.data.message)).catch(() => toast.error('Eroare'))} className="w-full bg-violet-600 hover:bg-violet-700">
                                        Trimite Digest
                                    </Button>
                                </div>
                                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/20">
                                    <h4 className="font-semibold text-orange-400 mb-2">⚡ Notificare 75%+</h4>
                                    <p className="text-xs text-gray-400 mb-3">Trimite notificare pentru competiții 75%+ vândute.</p>
                                    <Select onValueChange={id => id && axios.post(`${API}/admin/notify-75-percent/${id}`, {}, { headers: { Authorization: `Bearer ${token}` }}).then(r => toast.success(r.data.message)).catch(() => toast.error('Eroare'))}>
                                        <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Alege competiția" /></SelectTrigger>
                                        <SelectContent>
                                            {comps.map(c => <SelectItem key={c.competition_id} value={c.competition_id}>{c.title} ({Math.round((c.sold_tickets/c.max_tickets)*100)}%)</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Tab */}
                {tab === 'chat' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white">Mesaje Chat ({chatMsgs.length})</h2>
                        <div className="bg-[#12111a] rounded-xl border border-white/5 p-4 max-h-[500px] overflow-y-auto">
                            {chatMsgs.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Niciun mesaj încă</p>
                            ) : chatMsgs.map((m, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 border-b border-white/5 last:border-0">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-sm font-medium text-white">{m.user_email || 'Anonim'}</p>
                                            <p className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-gray-300">{m.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Competition Modal */}
            <Dialog open={showCompModal} onOpenChange={setShowCompModal}>
                <DialogContent className="max-w-2xl bg-[#12111a] border-white/10 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingComp ? 'Editează Competiția' : 'Competiție Nouă'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={saveComp} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label>Titlu</Label>
                                <Input value={compForm.title} onChange={e => setCompForm(p => ({ ...p, title: e.target.value }))} className="bg-white/5 border-white/10" required />
                            </div>
                            <div>
                                <Label>Categorie</Label>
                                <Select value={compForm.category} onValueChange={v => setCompForm(p => ({ ...p, category: v }))}>
                                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="tech">Tech</SelectItem>
                                        <SelectItem value="auto">Auto</SelectItem>
                                        <SelectItem value="travel">Travel</SelectItem>
                                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <Label>Descriere</Label>
                                <Button type="button" variant="ghost" size="sm" onClick={generateAI} disabled={genAI} className="text-violet-400">
                                    {genAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Wand2 className="w-4 h-4 mr-1" /> Generează cu AI</>}
                                </Button>
                            </div>
                            <Textarea value={compForm.description} onChange={e => setCompForm(p => ({ ...p, description: e.target.value }))} className="bg-white/5 border-white/10" rows={3} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <Label>Preț Bilet (RON)</Label>
                                <Input type="number" step="0.01" value={compForm.ticket_price} onChange={e => setCompForm(p => ({ ...p, ticket_price: e.target.value }))} className="bg-white/5 border-white/10" required />
                            </div>
                            <div>
                                <Label>Nr. Max Bilete</Label>
                                <Input type="number" value={compForm.max_tickets} onChange={e => setCompForm(p => ({ ...p, max_tickets: e.target.value }))} className="bg-white/5 border-white/10" required />
                            </div>
                            <div>
                                <Label>Tip</Label>
                                <Select value={compForm.competition_type} onValueChange={v => setCompForm(p => ({ ...p, competition_type: v }))}>
                                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="instant_win">Instant</SelectItem>
                                        <SelectItem value="draw">Extragere</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <Label>URL Imagine</Label>
                            <Input value={compForm.image_url} onChange={e => setCompForm(p => ({ ...p, image_url: e.target.value }))} className="bg-white/5 border-white/10" placeholder="https://..." />
                        </div>
                        <div>
                            <Label>Descriere Premiu</Label>
                            <Input value={compForm.prize_description} onChange={e => setCompForm(p => ({ ...p, prize_description: e.target.value }))} className="bg-white/5 border-white/10" />
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <Label className="text-violet-400 mb-2 block">Întrebare Calificare</Label>
                            <Input value={compForm.qual_question} onChange={e => setCompForm(p => ({ ...p, qual_question: e.target.value }))} className="bg-white/5 border-white/10 mb-2" placeholder="Întrebarea..." />
                            <div className="grid grid-cols-2 gap-2">
                                <Input value={compForm.qual_option1} onChange={e => setCompForm(p => ({ ...p, qual_option1: e.target.value }))} className="bg-white/5 border-white/10" placeholder="Răspuns corect" />
                                <Input value={compForm.qual_option2} onChange={e => setCompForm(p => ({ ...p, qual_option2: e.target.value }))} className="bg-white/5 border-white/10" placeholder="Răspuns greșit" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCompModal(false)}>Anulează</Button>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">{editingComp ? 'Actualizează' : 'Creează'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* User Modal */}
            <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogContent className="max-w-md bg-[#12111a] border-white/10">
                    <DialogHeader>
                        <DialogTitle>Editează: {editingUser?.username}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={saveUser} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Prenume</Label><Input value={userForm.first_name} onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))} className="bg-white/5 border-white/10" /></div>
                            <div><Label>Nume</Label><Input value={userForm.last_name} onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))} className="bg-white/5 border-white/10" /></div>
                        </div>
                        <div><Label>Email</Label><Input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} className="bg-white/5 border-white/10" /></div>
                        <div><Label>Telefon</Label><Input value={userForm.phone} onChange={e => setUserForm(p => ({ ...p, phone: e.target.value }))} className="bg-white/5 border-white/10" /></div>
                        <div><Label>Sold (RON)</Label><Input type="number" step="0.01" value={userForm.balance} onChange={e => setUserForm(p => ({ ...p, balance: e.target.value }))} className="bg-white/5 border-white/10" /></div>
                        <div><Label>Parolă Nouă</Label><Input type="password" value={userForm.new_password} onChange={e => setUserForm(p => ({ ...p, new_password: e.target.value }))} className="bg-white/5 border-white/10" placeholder="Lasă gol pentru a păstra" /></div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>Anulează</Button>
                            <Button type="submit" className="bg-violet-600 hover:bg-violet-700">Actualizează</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPage;
