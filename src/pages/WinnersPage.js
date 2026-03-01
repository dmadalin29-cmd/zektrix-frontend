import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import axios from 'axios';
import { Trophy, Loader2, Zap, Clock, Star } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WinnersPage = () => {
    const { t } = useLanguage();
    const [winners, setWinners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        try {
            const response = await axios.get(`${API}/winners`);
            setWinners(response.data);
        } catch (error) {
            console.error('Failed to fetch winners:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
                            <Star className="w-3 h-3 mr-1" /> {t('verified_winners')}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {t('our_winners').split(' ')[0]} <span className="gradient-text">{t('our_winners').split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t('winners_subtitle')}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : winners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {winners.map((winner, index) => (
                                <Card 
                                    key={winner.winner_id} 
                                    className={`winner-card rounded-2xl overflow-hidden ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                                    data-testid={`winner-${winner.winner_id}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center">
                                                <Trophy className="w-7 h-7 text-white" />
                                            </div>
                                            <Badge className={winner.is_automatic ? 'badge-instant' : 'badge-classic'}>
                                                {winner.is_automatic ? (
                                                    <><Zap className="w-3 h-3 mr-1" /> {t('instant_win_badge')}</>
                                                ) : (
                                                    <><Clock className="w-3 h-3 mr-1" /> {t('live_draw_badge')}</>
                                                )}
                                            </Badge>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold mb-1">{winner.username}</h3>
                                        <p className="text-muted-foreground mb-4">{winner.competition_title}</p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('winning_ticket')}</p>
                                                <p className="text-lg font-bold text-primary">#{winner.ticket_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">{t('won_on')}</p>
                                                <p className="text-sm font-medium">
                                                    {new Date(winner.announced_at).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {winner.prize_description && (
                                            <div className="mt-4 p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                                                <p className="text-xs text-secondary mb-1">{t('prize_won')}</p>
                                                <p className="font-medium">{winner.prize_description}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold mb-2">{t('no_winners')}</h3>
                            <p className="text-muted-foreground">{t('no_winners_desc')}</p>
                        </div>
                    )}

                    {/* Trust Section */}
                    <div className="mt-16 text-center">
                        <div className="glass rounded-2xl p-8 max-w-2xl mx-auto">
                            <h3 className="text-xl font-bold mb-4">{t('verified_transparent')}</h3>
                            <p className="text-muted-foreground">
                                {t('verified_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default WinnersPage;
