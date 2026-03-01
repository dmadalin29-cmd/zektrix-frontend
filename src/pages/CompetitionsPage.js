import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompetitionCard from '../components/CompetitionCard';
import { Badge } from '../components/ui/badge';
import { Loader2, Zap, Monitor, Banknote, Car, Sparkles, Filter } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CompetitionsPage = () => {
    const { isRomanian } = useLanguage();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchCompetitions();
    }, []);

    const fetchCompetitions = async () => {
        try {
            const response = await axios.get(`${API}/competitions`);
            setCompetitions(response.data);
        } catch (error) {
            console.error('Failed to fetch competitions:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: isRomanian ? 'Toate' : 'All', icon: Sparkles },
        { id: 'instant_wins', label: isRomanian ? 'Premiu Instant' : 'Instant Wins', icon: Zap },
        { id: 'tech', label: isRomanian ? 'Tehnologie' : 'Tech', icon: Monitor },
        { id: 'cash', label: isRomanian ? 'Bani' : 'Cash', icon: Banknote },
        { id: 'cars', label: isRomanian ? 'Mașini' : 'Cars', icon: Car },
    ];

    const filteredCompetitions = useMemo(() => {
        if (activeFilter === 'all') return competitions;
        if (activeFilter === 'instant_wins') {
            return competitions.filter(c => c.competition_type === 'instant_win');
        }
        return competitions.filter(c => c.category === activeFilter);
    }, [competitions, activeFilter]);

    // Split competitions into featured and regular
    const featuredCompetition = filteredCompetitions[0];
    const regularCompetitions = filteredCompetitions.slice(1);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
            </div>

            <main className="relative pt-28 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {isRomanian ? 'Competiții Active' : 'Live Competitions'}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                            {isRomanian ? 'Descoperă ' : 'Discover '}
                            <span className="gradient-text">{isRomanian ? 'Premii Incredibile' : 'Amazing Prizes'}</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {isRomanian 
                                ? 'Alege competiția ta și intră în cursa pentru premii extraordinare. Fiecare bilet este o participare!'
                                : 'Choose your competition and enter the race for extraordinary prizes. Every ticket is a chance!'
                            }
                        </p>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3 justify-center mb-12">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveFilter(cat.id)}
                                className={`badge-category ${activeFilter === cat.id ? 'active' : ''}`}
                                data-testid={`filter-${cat.id}`}
                            >
                                <cat.icon className="w-4 h-4 mr-2 inline" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredCompetitions.length === 0 ? (
                        <div className="text-center py-20">
                            <Filter className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">
                                {isRomanian ? 'Nicio competiție găsită' : 'No competitions found'}
                            </h3>
                            <p className="text-muted-foreground">
                                {isRomanian ? 'Încearcă alt filtru' : 'Try another filter'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Bento Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                                {/* Featured Competition - Large */}
                                {featuredCompetition && (
                                    <div className="md:col-span-2 md:row-span-2">
                                        <CompetitionCard competition={featuredCompetition} featured />
                                    </div>
                                )}
                                
                                {/* Regular Competitions */}
                                {regularCompetitions.map((comp) => (
                                    <CompetitionCard key={comp.competition_id} competition={comp} />
                                ))}
                            </div>

                            {/* Stats Bar */}
                            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="glass rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black gradient-text font-mono">
                                        {competitions.filter(c => c.status === 'active').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isRomanian ? 'Competiții Active' : 'Active Competitions'}
                                    </p>
                                </div>
                                <div className="glass rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-secondary font-mono">
                                        {competitions.reduce((sum, c) => sum + c.sold_tickets, 0)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isRomanian ? 'Bilete Vândute' : 'Tickets Sold'}
                                    </p>
                                </div>
                                <div className="glass rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-accent font-mono">
                                        RON {Math.min(...competitions.filter(c => c.status === 'active').map(c => c.ticket_price) || [0]).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isRomanian ? 'Preț Minim' : 'From'}
                                    </p>
                                </div>
                                <div className="glass rounded-2xl p-6 text-center">
                                    <p className="text-3xl font-black text-primary font-mono">
                                        {competitions.filter(c => c.competition_type === 'instant_win').length}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {isRomanian ? 'Premiu Instant' : 'Instant Wins'}
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompetitionsPage;
