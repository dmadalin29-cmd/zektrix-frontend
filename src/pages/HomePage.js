import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import CookieConsent from '../components/CookieConsent';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import axios from 'axios';
import { Zap, Trophy, Users, ArrowRight, Sparkles, Clock, Ticket, Star, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
    const { isAuthenticated } = useAuth();
    const { t, isRomanian } = useLanguage();
    const [competitions, setCompetitions] = useState([]);
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveStatus, setLiveStatus] = useState({ isLive: false, message: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [compsRes, winnersRes, liveRes] = await Promise.all([
                    axios.get(`${API}/competitions?status=active`),
                    axios.get(`${API}/winners`),
                    axios.get(`${API}/settings/live-status`).catch(() => ({ data: { isLive: false } }))
                ]);
                setCompetitions(compsRes.data.slice(0, 6));
                setWinners(winnersRes.data.slice(0, 4));
                setLiveStatus(liveRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getProgress = (sold, max) => (sold / max) * 100;

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative hero-bg pt-32 pb-24 overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-accent/15 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <Badge className="badge-instant mb-6 animate-pulse-glow">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {t('hero_badge')}
                        </Badge>
                        
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
                            {t('hero_title_1')} <span className="gradient-text">{t('hero_title_2')}</span><br />
                            {t('hero_title_3')}
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            {t('hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/competitions">
                                <Button className="btn-primary text-lg px-10 py-6" data-testid="hero-cta-btn">
                                    <Zap className="w-5 h-5 mr-2" />
                                    {t('hero_enter_now')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/winners">
                                <Button variant="outline" className="border-white/20 hover:bg-white/5 text-lg px-10 py-6" data-testid="view-winners-btn">
                                    <Trophy className="w-5 h-5 mr-2" />
                                    {t('hero_view_winners')}
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black gradient-text">250K+</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('stat_prizes')}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black gradient-text">1K+</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('stat_winners')}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl md:text-4xl font-black gradient-text">24/7</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('stat_draws')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* LIVE Section - TikTok - Dynamic */}
            <section className={`py-12 border-y ${liveStatus.isLive ? 'bg-gradient-to-r from-red-500/20 via-primary/10 to-red-500/20 border-red-500/30' : 'bg-gradient-to-r from-primary/5 via-muted/10 to-primary/5 border-white/10'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${liveStatus.isLive ? 'bg-gradient-to-br from-red-500 to-primary animate-pulse-glow' : 'bg-muted/50'}`}>
                                    <svg className={`w-8 h-8 ${liveStatus.isLive ? 'text-white' : 'text-muted-foreground'}`} viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                </div>
                                {liveStatus.isLive && (
                                    <>
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full" />
                                    </>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {liveStatus.isLive ? (
                                        <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full uppercase animate-pulse">
                                            🔴 LIVE
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs font-bold rounded-full uppercase">
                                            OFFLINE
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white">
                                    {liveStatus.isLive 
                                        ? (isRomanian ? 'Suntem LIVE!' : "We're LIVE!") 
                                        : (isRomanian ? 'Offline - Revenim în curând!' : 'Offline - Back soon!')}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {liveStatus.message || (liveStatus.isLive 
                                        ? (isRomanian ? 'Urmărește-ne pe TikTok pentru extrageri și surprize' : 'Watch us on TikTok for draws and surprises')
                                        : (isRomanian ? 'Urmărește-ne pe TikTok să fii notificat când revenim' : 'Follow us on TikTok to be notified when we return'))}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.tiktok.com/@x67digital.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-sm px-6 py-3 rounded-full font-bold transition-all ${liveStatus.isLive ? 'btn-secondary text-black' : 'btn-outline'}`}
                                data-testid="watch-live-btn"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                                {liveStatus.isLive 
                                    ? (isRomanian ? 'Urmărește LIVE' : 'Watch LIVE') 
                                    : (isRomanian ? 'Urmărește pe TikTok' : 'Follow on TikTok')}
                            </a>
                            <span className="text-white/70 text-sm font-medium">@x67digital.com</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Competitions */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('section_live_competitions')}</h2>
                            <p className="text-muted-foreground mt-2">{t('section_live_subtitle')}</p>
                        </div>
                        <Link to="/competitions">
                            <Button variant="outline" className="border-white/20 hover:bg-white/5" data-testid="view-all-comps-btn">
                                {t('view_all')}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i} className="glass border-white/10">
                                    <div className="aspect-[4/3] skeleton" />
                                    <CardContent className="p-6">
                                        <div className="skeleton h-6 w-3/4 mb-4" />
                                        <div className="skeleton h-4 w-full mb-2" />
                                        <div className="skeleton h-4 w-1/2" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : competitions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {competitions.map((comp) => (
                                <Link key={comp.competition_id} to={`/competitions/${comp.competition_id}`}>
                                    <Card className="glass border-white/10 card-hover overflow-hidden group" data-testid={`competition-card-${comp.competition_id}`}>
                                        <div className="relative aspect-[4/3] overflow-hidden">
                                            <img
                                                src={comp.image_url || 'https://images.unsplash.com/photo-1669606072600-1a62d7f24873?q=80&w=800'}
                                                alt={comp.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <Badge className={`absolute top-4 left-4 ${comp.competition_type === 'instant_win' ? 'badge-instant' : 'badge-classic'}`}>
                                                {comp.competition_type === 'instant_win' ? (
                                                    <><Zap className="w-3 h-3 mr-1" /> {t('badge_instant_win')}</>
                                                ) : (
                                                    <><Clock className="w-3 h-3 mr-1" /> {t('badge_classic')}</>
                                                )}
                                            </Badge>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h3 className="text-xl font-bold mb-1">{comp.title}</h3>
                                                <p className="text-sm text-white/70 line-clamp-1">{comp.description}</p>
                                            </div>
                                        </div>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">{t('ticket_price')}</p>
                                                    <p className="text-2xl font-bold text-primary">RON {comp.ticket_price.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">{t('tickets_left')}</p>
                                                    <p className="text-lg font-bold">{comp.max_tickets - comp.sold_tickets}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>{comp.sold_tickets} {t('tickets_sold')}</span>
                                                    <span>{comp.max_tickets} {t('tickets_total')}</span>
                                                </div>
                                                <Progress value={getProgress(comp.sold_tickets, comp.max_tickets)} className="h-2" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Ticket className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">{t('no_competitions')}</h3>
                            <p className="text-muted-foreground">{t('no_competitions_subtitle')}</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Recent Winners */}
            {winners.length > 0 && (
                <section className="py-24 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
                                <Trophy className="w-3 h-3 mr-1" /> {t('verified_winners')}
                            </Badge>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('recent_winners')}</h2>
                            <p className="text-muted-foreground mt-2">{t('recent_winners_subtitle')}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {winners.map((winner) => (
                                <Card key={winner.winner_id} className="winner-card rounded-2xl overflow-hidden" data-testid={`winner-card-${winner.winner_id}`}>
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center mx-auto mb-4">
                                            <Trophy className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="font-bold text-lg mb-1">{winner.username}</h4>
                                        <p className="text-sm text-muted-foreground mb-3">{winner.competition_title}</p>
                                        <Badge className="badge-instant">
                                            {t('ticket')} #{winner.ticket_number}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="text-center mt-8">
                            <Link to="/winners">
                                <Button variant="outline" className="border-secondary/30 text-secondary hover:bg-secondary/10" data-testid="see-all-winners-btn">
                                    {t('see_all_winners')}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* How It Works */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('how_it_works')}</h2>
                        <p className="text-muted-foreground mt-2">{t('how_it_works_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { icon: Users, title: t('step_1_title'), desc: t('step_1_desc') },
                            { icon: Ticket, title: t('step_2_title'), desc: t('step_2_desc') },
                            { icon: Clock, title: t('step_3_title'), desc: t('step_3_desc') },
                            { icon: Trophy, title: t('step_4_title'), desc: t('step_4_desc') }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                                    <step.icon className="w-8 h-8 text-primary" />
                                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { icon: Shield, text: t('trust_secure') },
                            { icon: Star, text: t('trust_verified') },
                            { icon: Users, text: t('trust_uk') },
                            { icon: Zap, text: t('trust_instant') }
                        ].map((badge, i) => (
                            <div key={i} className="flex items-center justify-center gap-3">
                                <badge.icon className="w-6 h-6 text-accent" />
                                <span className="text-sm font-medium text-muted-foreground">{badge.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            {t('cta_ready')} <span className="gradient-text">{t('cta_win_big')}</span>?
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t('cta_join')}
                        </p>
                        <Link to="/login">
                            <Button className="btn-primary text-lg px-12 py-6" data-testid="cta-join-btn">
                                {t('cta_start')}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </section>
            )}

            <Footer />
        </div>
    );
};

export default HomePage;
