import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { Search, Ticket, Loader2, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SearchTicketsPage = () => {
    const { t } = useLanguage();
    const [username, setUsername] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.error(t('enter_username'));
            return;
        }

        setSearching(true);
        setSearched(true);
        try {
            const response = await axios.get(`${API}/tickets/search?username=${encodeURIComponent(username)}`);
            setResult(response.data);
        } catch (error) {
            if (error.response?.status === 404) {
                setResult(null);
                toast.error(t('user_not_found'));
            } else {
                toast.error('Search failed. Please try again.');
            }
        } finally {
            setSearching(false);
        }
    };

    // Group tickets by competition
    const groupedTickets = result?.tickets?.reduce((acc, ticket) => {
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
    }, {}) || {};

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                            <Search className="w-3 h-3 mr-1" /> {t('public_search')}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {t('find_tickets').split(' ')[0]} <span className="gradient-text">{t('find_tickets').split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            {t('search_subtitle')}
                        </p>
                    </div>

                    {/* Search Form */}
                    <Card className="glass border-white/10 mb-8">
                        <CardContent className="p-6">
                            <form onSubmit={handleSearch} className="flex gap-4">
                                <div className="relative flex-1">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder={t('enter_username')}
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="pl-12 input-modern h-14 text-lg"
                                        data-testid="search-username-input"
                                    />
                                </div>
                                <Button 
                                    type="submit" 
                                    className="btn-primary h-14 px-8"
                                    disabled={searching}
                                    data-testid="search-btn"
                                >
                                    {searching ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <><Search className="w-5 h-5 mr-2" /> {t('search')}</>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    {searching ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : result ? (
                        <div className="space-y-6">
                            {/* User Info */}
                            <Card className="glass border-secondary/30">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center">
                                        <User className="w-7 h-7 text-secondary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">{result.username}</h2>
                                        <p className="text-muted-foreground">
                                            {result.tickets.length} {result.tickets.length !== 1 ? t('tickets') : t('ticket')} {t('in_competitions')} {Object.keys(groupedTickets).length} {Object.keys(groupedTickets).length !== 1 ? t('competitions_entered') : t('competitions_entered')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tickets by Competition */}
                            {Object.keys(groupedTickets).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {Object.values(groupedTickets).map((group) => (
                                        <Card key={group.competition_id} className="glass border-white/10" data-testid={`search-result-${group.competition_id}`}>
                                            <CardHeader>
                                                <CardTitle className="text-lg flex items-center justify-between">
                                                    <span>{group.competition_title || 'Competition'}</span>
                                                    <Badge className="badge-instant">{group.tickets.length} {t('tickets')}</Badge>
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
                                                        {t('view_competition')} <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className="glass border-white/10">
                                    <CardContent className="p-8 text-center">
                                        <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">{t('no_tickets_purchased')}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    ) : searched ? (
                        <Card className="glass border-white/10">
                            <CardContent className="p-8 text-center">
                                <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-xl font-bold mb-2">{t('user_not_found')}</h3>
                                <p className="text-muted-foreground">
                                    {t('user_not_found_desc')}
                                </p>
                            </CardContent>
                        </Card>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SearchTicketsPage;
