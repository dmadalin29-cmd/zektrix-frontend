import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import CookieConsent from '../components/CookieConsent';
import axios from 'axios';
import { ArrowRight, Zap, ChevronRight, MessageCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Competition Card - Dark theme, brand colors
const CompCard = ({ c }) => {
    const progress = (c.sold_tickets / c.max_tickets) * 100;
    const remaining = c.max_tickets - c.sold_tickets;
    
    return (
        <Link to={`/competitions/${c.competition_id}`} className="group block bg-[#12111a] rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/30 transition-all">
            <div className="relative aspect-[4/3]">
                <img src={c.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'} alt={c.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-violet-600 text-white text-[10px] font-bold rounded">AUTODRAW</span>
                    {c.is_flash_sale && <span className="px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">FLASH</span>}
                </div>
                <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 bg-violet-600 text-white text-xs font-bold rounded">DE LA RON {c.ticket_price?.toFixed(2)}</span>
                </div>
            </div>
            <div className="p-3">
                <h3 className="font-bold text-white text-sm mb-1 truncate">{c.title}</h3>
                <p className="text-[11px] text-gray-500 mb-2">Vândute: {c.sold_tickets} • {progress.toFixed(0)}% • Libere: {remaining}</p>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-orange-500 rounded-full" style={{width: `${progress}%`}} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 capitalize">{c.category || 'General'}</span>
                    <span className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                        Participă <ArrowRight className="w-3 h-3" />
                    </span>
                </div>
            </div>
        </Link>
    );
};

// Featured Card - Right side
const FeaturedCard = ({ c }) => {
    if (!c) return null;
    const progress = (c.sold_tickets / c.max_tickets) * 100;
    
    return (
        <div className="bg-[#12111a] rounded-xl overflow-hidden border border-white/10">
            <div className="px-3 py-2 border-b border-white/5">
                <span className="text-xs text-gray-500">Ofertă recomandată</span>
            </div>
            <div className="relative aspect-[4/3]">
                <img src={c.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-white text-lg mb-1">{c.title}</h3>
                <p className="text-violet-400 font-semibold text-sm mb-3">Loc de la RON {c.ticket_price?.toFixed(2)}</p>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div><p className="text-[10px] text-gray-500">VÂNDUTE</p><p className="text-white font-bold text-sm">{c.sold_tickets}/{c.max_tickets}</p></div>
                    <div><p className="text-[10px] text-gray-500">OCUPAT</p><p className="text-violet-400 font-bold text-sm flex items-center justify-center gap-1"><Zap className="w-3 h-3"/>{progress.toFixed(0)}%</p></div>
                    <div><p className="text-[10px] text-gray-500">LIBERE</p><p className="text-white font-bold text-sm">{c.max_tickets - c.sold_tickets}</p></div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 rounded-full" style={{width: `${progress}%`}} />
                </div>
                <Link to={`/competitions/${c.competition_id}`} className="block w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-center font-bold rounded-lg transition-colors">
                    Participă Acum
                </Link>
            </div>
        </div>
    );
};

const HomePage = () => {
    const { isRomanian } = useLanguage();
    const [comps, setComps] = useState([]);

    useEffect(() => {
        axios.get(`${API}/competitions?status=active`).then(r => setComps(r.data)).catch(() => {});
    }, []);

    const featured = comps[0];
    const categories = [...new Set(comps.map(c => c.category || 'general'))];

    return (
        <div className="min-h-screen bg-[#0a0614]">
            <Navbar />
            <main className="pt-20 pb-8">
                {/* Hero */}
                <section className="py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-6 items-start">
                            {/* Left */}
                            <div className="space-y-4">
                                {featured ? (
                                    <>
                                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
                                            {featured.title} – <span className="text-gray-400">totul pentru doar</span>{' '}
                                            <span className="text-violet-400">RON {featured.ticket_price?.toFixed(2)}</span>
                                        </h1>
                                        <p className="text-gray-400 text-sm flex items-center gap-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                            Intră în competiție cu doar RON {featured.ticket_price?.toFixed(2)}. Extragere LIVE, locuri limitate.
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <Link to="/competitions" className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2">
                                                Vezi ofertele <ArrowRight className="w-4 h-4" />
                                            </Link>
                                            <Link to="/faq" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg border border-white/10 transition-colors">
                                                Cum funcționează
                                            </Link>
                                        </div>
                                        <div className="pt-4">
                                            <p className="text-[10px] text-gray-600 uppercase mb-2">Comunitățile Noastre</p>
                                            <div className="flex gap-2">
                                                <a href="https://wa.me/40730268067" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[#12111a] rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-white"/></div>
                                                    <div><p className="text-[9px] text-gray-500">COMUNITATE</p><p className="text-white text-xs font-semibold">WhatsApp</p></div>
                                                </a>
                                                <a href="https://www.tiktok.com/@x67digital.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-[#12111a] rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center"><svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg></div>
                                                    <div><p className="text-[9px] text-gray-500">URMĂREȘTE</p><p className="text-white text-xs font-semibold">TikTok</p></div>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <h1 className="text-3xl font-bold text-white mb-2">Competiții în curând!</h1>
                                        <p className="text-gray-400">Revino pentru oferte extraordinare.</p>
                                    </div>
                                )}
                            </div>
                            {/* Right - Featured */}
                            <div><FeaturedCard c={featured} /></div>
                        </div>
                    </div>
                </section>

                {/* Competitions by Category */}
                {categories.map(cat => {
                    const items = comps.filter(c => (c.category || 'general') === cat);
                    if (!items.length) return null;
                    return (
                        <section key={cat} className="py-6">
                            <div className="max-w-7xl mx-auto px-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white capitalize">{cat}</h2>
                                    <Link to={`/competitions?category=${cat}`} className="text-violet-400 text-sm font-medium flex items-center gap-1 hover:underline">
                                        Vezi tot <ChevronRight className="w-4 h-4"/>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {items.slice(0, 4).map(c => <CompCard key={c.competition_id} c={c} />)}
                                </div>
                            </div>
                        </section>
                    );
                })}

                {/* No competitions message */}
                {comps.length === 0 && (
                    <section className="py-16 text-center">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-8 h-8 text-violet-500"/>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Competiții Noi în Curând!</h2>
                            <p className="text-gray-400">Revino pentru oferte extraordinare.</p>
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
