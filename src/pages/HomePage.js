import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import CookieConsent from '../components/CookieConsent';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import { ArrowRight, Clock, Ticket, Zap, Search, ChevronRight, Trophy, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Competition Card Component - Clean style like EuroGiveaway
const CompetitionCard = ({ competition, isRomanian }) => {
    const progress = (competition.sold_tickets / competition.max_tickets) * 100;
    const remaining = competition.max_tickets - competition.sold_tickets;
    
    return (
        <Link 
            to={`/competitions/${competition.competition_id}`}
            className="group block bg-[#0d1117] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
            data-testid={`competition-card-${competition.competition_id}`}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                    src={competition.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'} 
                    alt={competition.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {competition.is_flash_sale && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-md flex items-center gap-1">
                            <Zap className="w-3 h-3" /> FLASH
                        </span>
                    )}
                    {competition.competition_type === 'instant' && (
                        <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-md">
                            ACCES INSTANT
                        </span>
                    )}
                    <span className="px-2 py-1 bg-primary/90 text-white text-xs font-bold rounded-md">
                        AUTODRAW
                    </span>
                </div>
                
                {/* Price Badge */}
                <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white text-sm font-bold rounded-lg">
                        DE LA RON {competition.ticket_price?.toFixed(2)}
                    </span>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {competition.title}
                </h3>
                
                {/* Stats */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span>Vândute: {competition.sold_tickets?.toLocaleString()}</span>
                    <span>•</span>
                    <span>Ocupare: {progress.toFixed(0)}%</span>
                    <span>•</span>
                    <span className="text-emerald-400">Libere: {remaining?.toLocaleString()}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1.5 text-xs">
                        <span className="text-gray-500">Ocupare: {progress.toFixed(0)}%</span>
                        <span className="text-gray-500">Libere: {remaining?.toLocaleString()}</span>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs text-gray-400 capitalize">
                        {competition.category || 'General'}
                    </span>
                    <button className="flex items-center gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">
                        {isRomanian ? 'Participă' : 'Enter'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
};

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const { t, isRomanian } = useLanguage();
    const [competitions, setCompetitions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const compsRes = await axios.get(`${API}/competitions?status=active`);
                setCompetitions(compsRes.data);
                
                // Extract unique categories
                const cats = [...new Set(compsRes.data.map(c => c.category || 'other'))];
                setCategories(cats);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter competitions by search
    const filteredCompetitions = competitions.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get flash sales
    const flashSales = competitions.filter(c => c.is_flash_sale);
    
    // Group by category
    const getByCategory = (cat) => competitions.filter(c => (c.category || 'other') === cat);

    return (
        <div className="min-h-screen bg-[#030014]">
            <Navbar />
            
            {/* Main Content - Starts right after navbar */}
            <main className="pt-20">
                {/* Category Header Bar */}
                <div className="sticky top-16 z-40 bg-[#030014]/95 backdrop-blur-md border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between py-3">
                            {/* Categories */}
                            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg whitespace-nowrap">
                                    {isRomanian ? 'Toate' : 'All'}
                                </button>
                                {categories.slice(0, 5).map((cat) => (
                                    <button 
                                        key={cat}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg whitespace-nowrap transition-colors capitalize"
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Search */}
                            <div className="hidden sm:flex items-center gap-2 ml-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder={isRomanian ? 'Caută competiție...' : 'Search...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 w-48"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Sales Section (if any) */}
                {flashSales.length > 0 && (
                    <section className="py-8 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-500/20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">⚡ Flash Sales</h2>
                                        <p className="text-sm text-gray-400">{isRomanian ? 'Oferte limitate!' : 'Limited offers!'}</p>
                                    </div>
                                </div>
                                <Link to="/competitions?flash=true" className="text-orange-500 text-sm font-medium flex items-center gap-1 hover:underline">
                                    {isRomanian ? 'Vezi toate' : 'View all'} <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {flashSales.slice(0, 4).map((comp) => (
                                    <CompetitionCard key={comp.competition_id} competition={comp} isRomanian={isRomanian} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Main Competitions Grid */}
                <section className="py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        {isRomanian ? 'Competiții Active' : 'Active Competitions'}
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        {filteredCompetitions.length} {isRomanian ? 'disponibile' : 'available'}
                                    </p>
                                </div>
                            </div>
                            <Link to="/competitions" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                {isRomanian ? 'Vezi toate' : 'View all'} <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="bg-[#0d1117] rounded-2xl overflow-hidden animate-pulse">
                                        <div className="aspect-[4/3] bg-white/5" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-5 bg-white/5 rounded w-3/4" />
                                            <div className="h-4 bg-white/5 rounded w-full" />
                                            <div className="h-2 bg-white/5 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredCompetitions.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {isRomanian ? 'Nicio competiție găsită' : 'No competitions found'}
                                </h3>
                                <p className="text-gray-400">
                                    {isRomanian ? 'Revino mai târziu pentru competiții noi!' : 'Check back later for new competitions!'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredCompetitions.map((comp) => (
                                    <CompetitionCard key={comp.competition_id} competition={comp} isRomanian={isRomanian} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Stats Bar */}
                <section className="py-8 bg-gradient-to-r from-primary/5 to-emerald-500/5 border-t border-b border-white/5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-black text-primary">250K+</p>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Premii Oferite' : 'Prizes Given'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-emerald-400">1K+</p>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Premianți' : 'Winners'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-orange-400">24/7</p>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Extrageri Live' : 'Live Draws'}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-cyan-400">100%</p>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Transparent' : 'Transparent'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works - Minimal */}
                <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">
                            {isRomanian ? 'Cum Funcționează?' : 'How It Works?'}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-white/5 rounded-2xl">
                                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">1️⃣</span>
                                </div>
                                <h3 className="font-bold text-white mb-2">{isRomanian ? 'Alege Competiția' : 'Choose Competition'}</h3>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Răsfoiește competițiile și alege premiul dorit' : 'Browse competitions and choose your prize'}</p>
                            </div>
                            <div className="text-center p-6 bg-white/5 rounded-2xl">
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">2️⃣</span>
                                </div>
                                <h3 className="font-bold text-white mb-2">{isRomanian ? 'Rezervă Bilete' : 'Get Tickets'}</h3>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Cumpără bilete și răspunde la întrebarea de calificare' : 'Buy tickets and answer the qualifying question'}</p>
                            </div>
                            <div className="text-center p-6 bg-white/5 rounded-2xl">
                                <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl">3️⃣</span>
                                </div>
                                <h3 className="font-bold text-white mb-2">{isRomanian ? 'Primește Premiul' : 'Win Prize'}</h3>
                                <p className="text-sm text-gray-400">{isRomanian ? 'Extragere live și premiu livrat gratuit!' : 'Live draw and free prize delivery!'}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <InstallPrompt />
            <CookieConsent />
        </div>
    );
};

export default HomePage;
