import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import CookieConsent from '../components/CookieConsent';
import axios from 'axios';
import { ArrowRight, Clock, Zap, ChevronRight, ExternalLink, MessageCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Competition Card Component - Exact EuroGiveaway style
const CompetitionCard = ({ competition, isRomanian }) => {
    const progress = (competition.sold_tickets / competition.max_tickets) * 100;
    const remaining = competition.max_tickets - competition.sold_tickets;
    
    return (
        <Link 
            to={`/competitions/${competition.competition_id}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid={`competition-card-${competition.competition_id}`}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                <img 
                    src={competition.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'} 
                    alt={competition.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Badges Top */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                        ACCES INSTANT
                    </span>
                    {competition.is_flash_sale && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded">
                            FLASH SALE
                        </span>
                    )}
                </div>
                
                {/* Price Badge Bottom Left */}
                <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-2 bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-lg">
                        DE LA RON {competition.ticket_price?.toFixed(2)}
                    </span>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4 bg-white">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                    {competition.title}
                </h3>
                
                {/* Stats Line */}
                <p className="text-sm text-gray-500 mb-1">
                    Vândute: {competition.sold_tickets?.toLocaleString()} • Ocupare: {progress.toFixed(0)}% • Libere: {remaining?.toLocaleString()}
                </p>
                
                {/* Status */}
                <p className="text-xs text-gray-400 mb-3">
                    {progress >= 90 ? 'Aproape complet!' : 'Deschis acum'}
                </p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                        <span>Ocupare: {progress.toFixed(0)}%</span>
                        <span>Libere: {remaining?.toLocaleString()}</span>
                    </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-500 capitalize">
                        {competition.category || 'General'}
                    </span>
                    <span className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg group-hover:bg-emerald-600 transition-colors">
                        Participă <ArrowRight className="w-4 h-4" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

// Featured Card - Right side
const FeaturedCard = ({ competition, isRomanian }) => {
    if (!competition) return null;
    
    const progress = (competition.sold_tickets / competition.max_tickets) * 100;
    const remaining = competition.max_tickets - competition.sold_tickets;
    
    return (
        <div className="bg-[#1a1a2e] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10">
                <span className="text-sm text-gray-400">Ofertă recomandată</span>
            </div>
            
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                    src={competition.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600'} 
                    alt={competition.title}
                    className="w-full h-full object-cover"
                />
            </div>
            
            {/* Content */}
            <div className="p-5">
                <h3 className="font-bold text-white text-xl mb-2">{competition.title}</h3>
                <p className="text-emerald-400 font-semibold mb-4">
                    Loc de la RON {competition.ticket_price?.toFixed(2)}
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Vândute</p>
                        <p className="text-white font-bold">{competition.sold_tickets?.toLocaleString()} / {competition.max_tickets?.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Ocupat</p>
                        <p className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                            <Zap className="w-4 h-4" /> {progress.toFixed(0)}%
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Libere</p>
                        <p className="text-white font-bold">{remaining?.toLocaleString()}</p>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-4">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-400 via-emerald-400 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                
                {/* Button */}
                <Link 
                    to={`/competitions/${competition.competition_id}`}
                    className="block w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-center font-bold rounded-xl transition-colors"
                >
                    Participă
                </Link>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const { t, isRomanian } = useLanguage();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const compsRes = await axios.get(`${API}/competitions?status=active`);
                setCompetitions(compsRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Get featured competition (first one or highest value)
    const featured = competitions[0];
    
    // Get rest of competitions for grid
    const restCompetitions = competitions.slice(1);
    
    // Group by category
    const categories = [...new Set(competitions.map(c => c.category || 'general'))];

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <Navbar />
            
            {/* Main Content */}
            <main className="pt-20 pb-12">
                {/* Hero Section - Featured Competition */}
                <section className="py-12 bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            {/* Left - Text Content */}
                            <div className="space-y-6">
                                {featured && (
                                    <>
                                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                                            {featured.title} – <br/>
                                            <span className="text-gray-300">totul poate fi al tău pentru doar</span>{' '}
                                            <span className="text-emerald-400">RON {featured.ticket_price?.toFixed(2)}</span>
                                        </h1>
                                        
                                        <p className="text-gray-400 text-lg flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            Intră în competiție cu doar RON {featured.ticket_price?.toFixed(2)}. Transparență, extragere LIVE, locuri limitate.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4">
                                            <Link 
                                                to="/competitions"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
                                            >
                                                Vezi ofertele <ArrowRight className="w-5 h-5" />
                                            </Link>
                                            <Link 
                                                to="/faq"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
                                            >
                                                Cum funcționează
                                            </Link>
                                        </div>
                                        
                                        {/* Community Links */}
                                        <div className="pt-6">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Comunitățile Noastre</p>
                                            <div className="flex flex-wrap gap-3">
                                                <a 
                                                    href="https://wa.me/40730268067" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] rounded-xl border border-white/10 hover:border-emerald-500/50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                                        <MessageCircle className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">INTRĂ ÎN COMUNITATE</p>
                                                        <p className="text-white font-semibold">Grup WhatsApp</p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                                </a>
                                                <a 
                                                    href="https://www.tiktok.com/@x67digital.com" 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] rounded-xl border border-white/10 hover:border-emerald-500/50 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-[#00f2ea] flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">URMĂREȘTE-NE</p>
                                                        <p className="text-white font-semibold">TikTok</p>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {/* Right - Featured Card */}
                            <div>
                                <FeaturedCard competition={featured} isRomanian={isRomanian} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Competitions Grid by Category */}
                {categories.map((category) => {
                    const categoryComps = competitions.filter(c => (c.category || 'general') === category);
                    if (categoryComps.length === 0) return null;
                    
                    return (
                        <section key={category} className="py-8">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                                {/* Category Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white capitalize">{category}</h2>
                                    <Link 
                                        to={`/competitions?category=${category}`}
                                        className="text-emerald-400 text-sm font-medium flex items-center gap-1 hover:underline"
                                    >
                                        Vezi tot <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                
                                {/* Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryComps.slice(0, 3).map((comp) => (
                                        <CompetitionCard key={comp.competition_id} competition={comp} isRomanian={isRomanian} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* If no competitions */}
                {!loading && competitions.length === 0 && (
                    <section className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
                            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <Zap className="w-12 h-12 text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-4">
                                {isRomanian ? 'Competiții Noi în Curând!' : 'New Competitions Coming Soon!'}
                            </h2>
                            <p className="text-gray-400 text-lg">
                                {isRomanian ? 'Revino mai târziu pentru oferte extraordinare.' : 'Check back later for amazing offers.'}
                            </p>
                        </div>
                    </section>
                )}

                {/* Loading */}
                {loading && (
                    <section className="py-12">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                        <div className="aspect-[4/3] bg-gray-200" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-5 bg-gray-200 rounded w-3/4" />
                                            <div className="h-4 bg-gray-200 rounded w-full" />
                                            <div className="h-2 bg-gray-200 rounded w-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <Footer />
            <InstallPrompt />
            <CookieConsent />
        </div>
    );
};

export default HomePage;
