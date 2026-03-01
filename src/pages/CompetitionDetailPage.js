import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShareButton from '../components/ShareButton';
import CountdownTimer from '../components/CountdownTimer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { 
    Zap, Clock, Ticket, Minus, Plus, Loader2, Trophy, ArrowLeft, Wallet, 
    PartyPopper, CreditCard, Mail, HelpCircle, CheckCircle, XCircle, 
    ShoppingCart, Users, Calendar
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CompetitionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token, isAuthenticated, refreshUser } = useAuth();
    const { t, isRomanian } = useLanguage();
    const { addToCart } = useCart();
    const [competition, setCompetition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [purchasedTickets, setPurchasedTickets] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    
    // Qualification question state
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerError, setAnswerError] = useState(false);
    const [answerVerified, setAnswerVerified] = useState(false);

    useEffect(() => {
        fetchCompetition();
    }, [id]);

    const fetchCompetition = async () => {
        try {
            const response = await axios.get(`${API}/competitions/${id}`);
            setCompetition(response.data);
        } catch (error) {
            console.error('Failed to fetch competition:', error);
            toast.error('Competition not found');
            navigate('/competitions');
        } finally {
            setLoading(false);
        }
    };

    const verifyAnswer = () => {
        if (selectedAnswer === null) {
            toast.error(isRomanian ? 'Selectează un răspuns' : 'Select an answer');
            return;
        }
        
        const isCorrect = selectedAnswer === competition.qualification_question?.correct_answer;
        if (isCorrect) {
            setAnswerVerified(true);
            setAnswerError(false);
            toast.success(isRomanian ? 'Răspuns corect!' : 'Correct answer!');
        } else {
            setAnswerError(true);
            toast.error(isRomanian ? 'Răspuns incorect. Încearcă din nou!' : 'Incorrect answer. Try again!');
        }
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/competitions/${id}` } } });
            return;
        }

        if (competition.qualification_question && !answerVerified) {
            toast.error(isRomanian ? 'Răspunde corect la întrebare' : 'Answer the question correctly first');
            return;
        }

        const totalCost = competition.ticket_price * quantity;

        if (paymentMethod === 'wallet') {
            if (user.balance < totalCost) {
                toast.error(t('insufficient_balance'));
                return;
            }

            setPurchasing(true);
            try {
                const response = await axios.post(
                    `${API}/tickets/purchase`,
                    { 
                        competition_id: id, 
                        quantity,
                        qualification_answer: selectedAnswer
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setPurchasedTickets(response.data);
                setPurchaseSuccess(true);
                refreshUser();
                toast.success(t('purchase_success'));
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Purchase failed');
            } finally {
                setPurchasing(false);
            }
        } else {
            setPurchasing(true);
            try {
                const response = await axios.post(
                    `${API}/tickets/purchase-viva`,
                    { 
                        competition_id: id, 
                        quantity,
                        qualification_answer: selectedAnswer
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (response.data.checkout_url) {
                    window.location.href = response.data.checkout_url;
                }
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Payment initiation failed');
                setPurchasing(false);
            }
        }
    };

    const handleAddToCart = () => {
        if (competition.qualification_question && !answerVerified) {
            toast.error(isRomanian ? 'Răspunde corect la întrebare' : 'Answer the question correctly first');
            return;
        }
        addToCart(competition, quantity, selectedAnswer);
        toast.success(isRomanian ? 'Adăugat în coș!' : 'Added to cart!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="pt-28 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </main>
            </div>
        );
    }

    if (!competition) return null;

    const soldPercentage = (competition.sold_tickets / competition.max_tickets) * 100;
    const available = competition.max_tickets - competition.sold_tickets;
    const totalCost = competition.ticket_price * quantity;
    const qualQuestion = competition.qualification_question;
    const postalEntry = competition.postal_entry;

    // Get urgency class
    const getUrgencyClass = () => {
        if (soldPercentage >= 80) return 'progress-urgency-high';
        if (soldPercentage >= 50) return 'progress-urgency-medium';
        return 'progress-urgency-low';
    };

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
                    {/* Back Button */}
                    <Link to="/competitions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        {isRomanian ? 'Înapoi la Competiții' : 'Back to Competitions'}
                    </Link>

                    {/* Success Dialog */}
                    <Dialog open={purchaseSuccess} onOpenChange={setPurchaseSuccess}>
                        <DialogContent className="sm:max-w-md" aria-describedby="success-description">
                            <DialogHeader>
                                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4 neon-secondary">
                                    <PartyPopper className="w-10 h-10 text-secondary" />
                                </div>
                                <DialogTitle className="text-center text-2xl">{t('congratulations')}</DialogTitle>
                            </DialogHeader>
                            <div id="success-description" className="text-center space-y-4">
                                <p className="text-muted-foreground">
                                    {t('purchase_successful')} {purchasedTickets.length} {purchasedTickets.length === 1 ? t('ticket') : t('tickets')}!
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {purchasedTickets.map((ticket) => (
                                        <span key={ticket.ticket_id} className="ticket-badge">
                                            #{ticket.ticket_number}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-col gap-2">
                                <Button className="w-full btn-secondary text-black" onClick={() => navigate('/dashboard/tickets')}>
                                    {t('view_my_tickets')}
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => { setPurchaseSuccess(false); fetchCompetition(); }}>
                                    {t('buy_more')}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Image Card */}
                            <Card className="glass border-white/10 overflow-hidden">
                                <div className="relative aspect-video">
                                    <img 
                                        src={competition.image_url || 'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=1200'} 
                                        alt={competition.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                                    
                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {competition.competition_type === 'instant_win' ? (
                                            <Badge className="badge-instant">
                                                <Zap className="w-3 h-3 mr-1" /> {isRomanian ? 'Câștig Instant' : 'Instant Win'}
                                            </Badge>
                                        ) : (
                                            <Badge className="badge-classic">
                                                <Clock className="w-3 h-3 mr-1" /> {isRomanian ? 'Extragere Clasică' : 'Classic Draw'}
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <div className="absolute top-4 right-4">
                                        <ShareButton competitionId={competition.competition_id} competitionTitle={competition.title} />
                                    </div>

                                    {/* Sold Percentage */}
                                    {soldPercentage >= 50 && (
                                        <div className="absolute bottom-4 right-4">
                                            <Badge className={soldPercentage >= 80 ? 'status-ending' : 'badge-secondary'}>
                                                {Math.round(soldPercentage)}% {isRomanian ? 'Vândut' : 'Sold'}
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                <div className={`h-2 ${getUrgencyClass()}`}>
                                    <div className="progress-bar h-full">
                                        <div className="progress-fill" style={{ width: `${soldPercentage}%` }} />
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <h1 className="text-3xl md:text-4xl font-black mb-4" data-testid="comp-title">
                                        {competition.title}
                                    </h1>
                                    <p className="text-muted-foreground text-lg mb-6">{competition.description}</p>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white/5 rounded-xl p-4 text-center">
                                            <Ticket className="w-5 h-5 mx-auto mb-2 text-primary" />
                                            <p className="text-2xl font-black font-mono">{available}</p>
                                            <p className="text-xs text-muted-foreground">{isRomanian ? 'Rămase' : 'Remaining'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center">
                                            <Users className="w-5 h-5 mx-auto mb-2 text-secondary" />
                                            <p className="text-2xl font-black font-mono">{competition.sold_tickets}</p>
                                            <p className="text-xs text-muted-foreground">{isRomanian ? 'Vândute' : 'Sold'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center">
                                            <Trophy className="w-5 h-5 mx-auto mb-2 text-accent" />
                                            <p className="text-2xl font-black font-mono">{competition.max_tickets}</p>
                                            <p className="text-xs text-muted-foreground">{isRomanian ? 'Total' : 'Total'}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-4 text-center">
                                            <Calendar className="w-5 h-5 mx-auto mb-2 text-primary" />
                                            <p className="text-xl font-black">{Math.round(soldPercentage)}%</p>
                                            <p className="text-xs text-muted-foreground">{isRomanian ? 'Completat' : 'Complete'}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Countdown Timer */}
                            {competition.draw_date && (
                                <Card className="glass border-primary/30">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg">{isRomanian ? 'Extragerea În' : 'Draw In'}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(competition.draw_date).toLocaleDateString('ro-RO', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <Clock className="w-8 h-8 text-primary" />
                                        </div>
                                        <CountdownTimer targetDate={competition.draw_date} />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Qualification Question */}
                            {qualQuestion && (
                                <Card className="qualification-section">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                <HelpCircle className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{isRomanian ? 'Întrebare de Calificare' : 'Qualification Question'}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {isRomanian ? 'Răspunde corect pentru a putea cumpăra' : 'Answer correctly to be able to purchase'}
                                                </p>
                                            </div>
                                            {answerVerified && (
                                                <Badge className="badge-secondary ml-auto">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> {isRomanian ? 'Verificat' : 'Verified'}
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="font-medium text-lg mb-4">{qualQuestion.question}</p>

                                        <RadioGroup 
                                            value={selectedAnswer?.toString()} 
                                            onValueChange={(v) => { 
                                                setSelectedAnswer(parseInt(v)); 
                                                setAnswerError(false);
                                                setAnswerVerified(false);
                                            }}
                                            disabled={answerVerified}
                                        >
                                            {qualQuestion.options.map((option, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                                        selectedAnswer === idx 
                                                            ? answerError 
                                                                ? 'border-destructive bg-destructive/10' 
                                                                : answerVerified
                                                                    ? 'border-secondary bg-secondary/10'
                                                                    : 'border-yellow-500 bg-yellow-500/10' 
                                                            : 'border-white/10 hover:border-white/20'
                                                    } ${answerVerified ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                >
                                                    <RadioGroupItem value={idx.toString()} id={`answer-${idx}`} data-testid={`answer-${idx}`} />
                                                    <Label htmlFor={`answer-${idx}`} className="cursor-pointer flex-1 flex items-center justify-between">
                                                        <span>{option}</span>
                                                        {selectedAnswer === idx && answerError && (
                                                            <XCircle className="w-5 h-5 text-destructive" />
                                                        )}
                                                        {selectedAnswer === idx && answerVerified && (
                                                            <CheckCircle className="w-5 h-5 text-secondary" />
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>

                                        {!answerVerified && (
                                            <Button 
                                                className="w-full mt-4 btn-outline"
                                                onClick={verifyAnswer}
                                                disabled={selectedAnswer === null}
                                            >
                                                {isRomanian ? 'Verifică Răspunsul' : 'Verify Answer'}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Postal Entry */}
                            {postalEntry && (
                                <Card className="postal-entry-section">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                                <Mail className="w-5 h-5 text-cyan-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{isRomanian ? 'Intrare Poștală Gratuită' : 'Free Postal Entry'}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {isRomanian ? 'Alternativă fără cost' : 'No purchase necessary'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <p className="text-sm text-muted-foreground">
                                                {isRomanian 
                                                    ? 'Pentru a participa gratuit, trimiteți o carte poștală sau scrisoare la adresa de mai jos. Fiecare scrisoare = 1 bilet. Limită: 5 intrări per persoană.'
                                                    : 'To enter for free, send a postcard or letter to the address below. Each letter = 1 ticket. Limit: 5 entries per person.'
                                                }
                                            </p>
                                            
                                            <div className="bg-black/20 rounded-xl p-4">
                                                <p className="text-sm font-bold mb-2">{isRomanian ? 'Includeți:' : 'Include:'}</p>
                                                <ul className="text-sm text-muted-foreground space-y-1">
                                                    {Array.isArray(postalEntry.instructions) ? (
                                                        postalEntry.instructions.map((inst, idx) => (
                                                            <li key={idx} className="flex items-center gap-2">
                                                                <CheckCircle className="w-4 h-4 text-cyan-500" />
                                                                {inst}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <>
                                                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-500" /> {isRomanian ? 'Nume complet' : 'Full name'}</li>
                                                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-500" /> {isRomanian ? 'Adresă poștală' : 'Postal address'}</li>
                                                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-500" /> {isRomanian ? 'Email și telefon' : 'Email & phone'}</li>
                                                            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-500" /> {isRomanian ? 'Numele competiției' : 'Competition name'}</li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>
                                            
                                            <div className="bg-black/30 rounded-xl p-4 border border-cyan-500/20">
                                                <p className="text-xs text-muted-foreground mb-2">{isRomanian ? 'Trimiteți la:' : 'Send to:'}</p>
                                                <p className="font-mono text-sm">
                                                    {postalEntry.company_name || 'Zektrix UK Ltd'}<br/>
                                                    {postalEntry.address_line1 || 'c/o Bartle House'}<br/>
                                                    {postalEntry.address_line2 || 'Oxford Court, Manchester'}<br/>
                                                    {postalEntry.postcode || 'M23 WQ'}<br/>
                                                    {postalEntry.country || 'United Kingdom'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Purchase Card */}
                        <div className="space-y-6">
                            <Card className="glass border-primary/30 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{isRomanian ? 'Cumpără Bilete' : 'Buy Tickets'}</span>
                                        <span className="price-display">RON {competition.ticket_price.toFixed(2)}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {competition.status === 'completed' ? (
                                        <div className="text-center py-8">
                                            <Trophy className="w-12 h-12 mx-auto text-secondary mb-4" />
                                            <p className="font-bold text-lg">{isRomanian ? 'Competiție Încheiată' : 'Competition Ended'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {isRomanian ? 'Această competiție și-a găsit câștigătorul!' : 'This competition has found its winner!'}
                                            </p>
                                        </div>
                                    ) : available === 0 ? (
                                        <div className="text-center py-8">
                                            <Ticket className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="font-bold text-lg">{isRomanian ? 'Sold Out' : 'Sold Out'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {isRomanian ? 'Toate biletele au fost vândute' : 'All tickets have been sold'}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Quantity Selector */}
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {isRomanian ? 'Selectează Cantitatea' : 'Select Quantity'}
                                                </p>
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                        disabled={quantity <= 1}
                                                        className="h-12 w-12"
                                                        data-testid="qty-minus-btn"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Math.min(available, Math.max(1, parseInt(e.target.value) || 1)))}
                                                        className="w-20 text-center input-modern h-12 text-xl font-mono font-bold"
                                                        min={1}
                                                        max={available}
                                                        data-testid="qty-input"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => setQuantity(Math.min(available, quantity + 1))}
                                                        disabled={quantity >= available}
                                                        className="h-12 w-12"
                                                        data-testid="qty-plus-btn"
                                                    >
                                                        <Plus className="w-5 h-5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Total */}
                                            <div className="flex justify-between items-center py-4 border-y border-white/10">
                                                <span className="text-muted-foreground">{isRomanian ? 'Total' : 'Total'}</span>
                                                <span className="text-3xl font-black gradient-text font-mono">RON {totalCost.toFixed(2)}</span>
                                            </div>

                                            {/* Payment Methods */}
                                            {isAuthenticated && (
                                                <div className="space-y-3">
                                                    <p className="text-sm text-muted-foreground">
                                                        {isRomanian ? 'Metodă de Plată' : 'Payment Method'}
                                                    </p>
                                                    <button
                                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                                            paymentMethod === 'wallet'
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                        onClick={() => setPaymentMethod('wallet')}
                                                    >
                                                        <Wallet className="w-5 h-5 text-secondary" />
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium">{isRomanian ? 'Portofel' : 'Wallet'}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                RON {(user?.balance || 0).toFixed(2)} {isRomanian ? 'disponibil' : 'available'}
                                                            </p>
                                                        </div>
                                                    </button>
                                                    <button
                                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                                                            paymentMethod === 'viva'
                                                                ? 'border-primary bg-primary/10'
                                                                : 'border-white/10 hover:border-white/20'
                                                        }`}
                                                        onClick={() => setPaymentMethod('viva')}
                                                    >
                                                        <CreditCard className="w-5 h-5 text-primary" />
                                                        <div className="flex-1 text-left">
                                                            <p className="font-medium">{isRomanian ? 'Card Bancar' : 'Bank Card'}</p>
                                                            <p className="text-xs text-muted-foreground">Visa, Mastercard, Apple Pay, Google Pay</p>
                                                        </div>
                                                    </button>
                                                    
                                                    {/* Payment logos */}
                                                    {paymentMethod === 'viva' && (
                                                        <div className="flex items-center justify-center gap-4 py-3 bg-white/5 rounded-xl">
                                                            <img src="https://cdn.jsdelivr.net/gh/nicoverbruggen/payment-icons@master/svg/visa.svg" alt="Visa" className="h-6" />
                                                            <img src="https://cdn.jsdelivr.net/gh/nicoverbruggen/payment-icons@master/svg/mastercard.svg" alt="Mastercard" className="h-6" />
                                                            <img src="https://cdn.jsdelivr.net/gh/nicoverbruggen/payment-icons@master/svg/applepay.svg" alt="Apple Pay" className="h-6 bg-white rounded px-1" />
                                                            <img src="https://cdn.jsdelivr.net/gh/nicoverbruggen/payment-icons@master/svg/googlepay.svg" alt="Google Pay" className="h-6 bg-white rounded px-1" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Warning for insufficient balance */}
                                            {isAuthenticated && paymentMethod === 'wallet' && (user?.balance || 0) < totalCost && (
                                                <p className="text-sm text-destructive">
                                                    {isRomanian 
                                                        ? `Sold insuficient. Adaugă RON ${(totalCost - (user?.balance || 0)).toFixed(2)}`
                                                        : `Insufficient balance. Add RON ${(totalCost - (user?.balance || 0)).toFixed(2)}`
                                                    }
                                                </p>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="space-y-3">
                                                <Button
                                                    className="w-full btn-secondary text-black py-6 text-lg"
                                                    onClick={handlePurchase}
                                                    disabled={
                                                        purchasing || 
                                                        (qualQuestion && !answerVerified) ||
                                                        (paymentMethod === 'wallet' && isAuthenticated && (user?.balance || 0) < totalCost)
                                                    }
                                                    data-testid="buy-now-btn"
                                                >
                                                    {purchasing ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : !isAuthenticated ? (
                                                        <>{isRomanian ? 'Autentifică-te pentru a Cumpăra' : 'Log In to Purchase'}</>
                                                    ) : (
                                                        <>{isRomanian ? 'Cumpără Acum' : 'Buy Now'}</>
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    className="w-full btn-outline py-5"
                                                    onClick={handleAddToCart}
                                                    disabled={qualQuestion && !answerVerified}
                                                    data-testid="add-to-cart-btn"
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    {isRomanian ? 'Adaugă în Coș' : 'Add to Cart'}
                                                </Button>
                                            </div>

                                            {qualQuestion && !answerVerified && (
                                                <p className="text-sm text-center text-muted-foreground">
                                                    {isRomanian 
                                                        ? '⚠️ Răspunde la întrebarea de calificare pentru a continua'
                                                        : '⚠️ Answer the qualification question to continue'
                                                    }
                                                </p>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompetitionDetailPage;
