import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Gift, Loader2, Clock, Sparkles, ArrowLeft, Star, Zap, Crown, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import confetti from 'canvas-confetti';

const API = process.env.REACT_APP_BACKEND_URL;

const LuckyWheelPage = () => {
    const { user, token, refreshUser } = useAuth();
    const { isRomanian } = useLanguage();
    const [prizes, setPrizes] = useState([]);
    const [canSpin, setCanSpin] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const wheelRef = useRef(null);

    useEffect(() => {
        fetchPrizes();
        if (user && token) checkSpinStatus();
    }, [user, token]);

    const fetchPrizes = async () => {
        try {
            const response = await axios.get(`${API}/api/lucky-wheel/prizes`);
            setPrizes(response.data);
        } catch (error) {
            console.error('Failed to fetch prizes');
        } finally {
            setLoading(false);
        }
    };

    const checkSpinStatus = async () => {
        try {
            const response = await axios.get(`${API}/api/lucky-wheel/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanSpin(response.data.can_spin);
        } catch (error) {
            console.error('Failed to check spin status');
        }
    };

    const spinWheel = async () => {
        if (!user) {
            toast.error(isRomanian ? 'Trebuie să fii autentificat pentru a învârti roata!' : 'You must be logged in to spin!');
            return;
        }
        if (!canSpin || spinning) return;

        setSpinning(true);
        
        try {
            const response = await axios.post(`${API}/api/lucky-wheel/spin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { prize_index, prize, message } = response.data;
            
            const segmentAngle = 360 / prizes.length;
            const targetAngle = segmentAngle * prize_index + segmentAngle / 2;
            const spins = 6;
            const finalRotation = rotation + (360 * spins) + (360 - targetAngle);
            
            setRotation(finalRotation);
            
            setTimeout(() => {
                setSpinning(false);
                setResult({ prize, message });
                setShowResult(true);
                setCanSpin(false);
                
                if (prize.type !== 'nothing') {
                    confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#8b5cf6', '#f97316', '#fbbf24', '#10b981'] });
                }
                
                if (refreshUser) refreshUser();
            }, 5000);
            
        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.detail || 'Eroare la învârtire');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030014]" data-testid="lucky-wheel-page">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-5xl mx-auto px-4">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>{isRomanian ? 'Înapoi la Pagina Principală' : 'Back to Home'}</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-6"
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
                                border: '1px solid rgba(251, 191, 36, 0.4)',
                                boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)'
                            }}>
                            <Sparkles className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 font-bold">{isRomanian ? 'O Învârtire Zilnic!' : 'One Spin Daily!'}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4">
                            <span className="text-white">🎰 </span>
                            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                                {isRomanian ? 'Roata Norocului' : 'Lucky Wheel'}
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            {isRomanian 
                                ? 'Învârte roata zilnic pentru șansa de a primi premii, bilete gratuite sau bonusuri!' 
                                : 'Spin the wheel daily for a chance to win cash, free tickets or bonuses!'}
                        </p>
                    </div>

                    {/* Wheel Container */}
                    <div className="relative flex flex-col items-center">
                        {/* Glow Background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-[500px] h-[500px] rounded-full opacity-30"
                                style={{
                                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(249, 115, 22, 0.2) 50%, transparent 70%)',
                                    filter: 'blur(60px)'
                                }} />
                        </div>

                        {/* Pointer */}
                        <div className="absolute top-0 z-30 transform -translate-y-2">
                            <div className="relative">
                                <div className="w-0 h-0 border-l-[25px] border-r-[25px] border-t-[50px] border-l-transparent border-r-transparent"
                                    style={{
                                        borderTopColor: '#fbbf24',
                                        filter: 'drop-shadow(0 4px 10px rgba(251, 191, 36, 0.5))'
                                    }} />
                            </div>
                        </div>

                        {/* Wheel */}
                        <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px]">
                            {/* Outer Ring */}
                            <div className="absolute inset-0 rounded-full"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(249, 115, 22, 0.3))',
                                    padding: '8px',
                                    boxShadow: '0 0 60px rgba(139, 92, 246, 0.4), inset 0 0 40px rgba(0,0,0,0.5)'
                                }}>
                                <div 
                                    ref={wheelRef}
                                    className="w-full h-full rounded-full relative overflow-hidden"
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                        background: `conic-gradient(${prizes.map((p, i) => 
                                            `${p.color} ${(i/prizes.length)*100}% ${((i+1)/prizes.length)*100}%`
                                        ).join(', ')})`,
                                        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)'
                                    }}
                                >
                                    {/* Prize Labels */}
                                    {prizes.map((prize, index) => {
                                        const angle = (360 / prizes.length) * index + (360 / prizes.length / 2);
                                        return (
                                            <div
                                                key={index}
                                                className="absolute text-white text-[10px] md:text-xs font-bold whitespace-nowrap"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: `rotate(${angle}deg) translateX(70px) md:translateX(90px)`,
                                                    transformOrigin: 'left center',
                                                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                                                }}
                                            >
                                                {prize.label}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Center Button */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center"
                                        style={{
                                            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
                                            border: '4px solid #8b5cf6',
                                            boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.2)'
                                        }}>
                                        <span className="text-white font-black text-lg md:text-xl tracking-wider">SPIN</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spin Button */}
                        <Button
                            onClick={spinWheel}
                            disabled={!canSpin || spinning || !user}
                            className={`mt-10 px-12 py-7 text-xl font-black rounded-2xl transition-all duration-300 ${
                                canSpin && !spinning && user
                                    ? 'animate-pulse' 
                                    : ''
                            }`}
                            style={{
                                background: canSpin && !spinning && user
                                    ? 'linear-gradient(135deg, #fbbf24, #f97316, #ef4444)'
                                    : 'rgba(255,255,255,0.1)',
                                boxShadow: canSpin && !spinning && user
                                    ? '0 0 40px rgba(251, 191, 36, 0.5), 0 10px 30px rgba(0,0,0,0.3)'
                                    : 'none',
                                color: canSpin && !spinning && user ? '#000' : '#666'
                            }}
                            data-testid="spin-btn"
                        >
                            {spinning ? (
                                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> {isRomanian ? 'Se învârte...' : 'Spinning...'}</>
                            ) : !user ? (
                                <>{isRomanian ? 'Autentifică-te' : 'Login to Spin'}</>
                            ) : canSpin ? (
                                <><Gift className="w-6 h-6 mr-3" /> {isRomanian ? 'ÎNVÂRTE ROATA!' : 'SPIN THE WHEEL!'}</>
                            ) : (
                                <><Clock className="w-6 h-6 mr-3" /> {isRomanian ? 'Revino mâine!' : 'Come back tomorrow!'}</>
                            )}
                        </Button>

                        {!canSpin && !spinning && (
                            <p className="mt-6 text-gray-500 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                {isRomanian ? 'Poți învârti din nou mâine la ora 00:00' : 'You can spin again tomorrow at midnight'}
                            </p>
                        )}
                    </div>

                    {/* Prize Legend */}
                    <div className="mt-16 rounded-2xl p-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-violet-400" />
                            </div>
                            <h3 className="font-bold text-white text-lg">{isRomanian ? 'Premii Disponibile' : 'Available Prizes'}</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {prizes.map((prize, index) => (
                                <div key={index} 
                                    className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                                    style={{ background: `${prize.color}15`, border: `1px solid ${prize.color}40` }}>
                                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: prize.color, boxShadow: `0 0 10px ${prize.color}80` }} />
                                    <span className="text-sm font-medium text-white">{prize.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="rounded-2xl p-5 text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                                border: '1px solid rgba(139, 92, 246, 0.2)'
                            }}>
                            <Star className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white mb-1">{isRomanian ? 'Zilnic' : 'Daily'}</h4>
                            <p className="text-xs text-gray-500">{isRomanian ? 'O învârtire gratuită în fiecare zi' : 'One free spin every day'}</p>
                        </div>
                        <div className="rounded-2xl p-5 text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                                border: '1px solid rgba(249, 115, 22, 0.2)'
                            }}>
                            <Zap className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white mb-1">{isRomanian ? 'Instant' : 'Instant'}</h4>
                            <p className="text-xs text-gray-500">{isRomanian ? 'Premiile sunt creditate instant' : 'Prizes credited instantly'}</p>
                        </div>
                        <div className="rounded-2xl p-5 text-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                border: '1px solid rgba(251, 191, 36, 0.2)'
                            }}>
                            <Crown className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                            <h4 className="font-bold text-white mb-1">{isRomanian ? 'Premii' : 'Prizes'}</h4>
                            <p className="text-xs text-gray-500">{isRomanian ? 'Cash, bilete sau bonusuri' : 'Cash, tickets or bonuses'}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Result Modal */}
            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(10, 6, 20, 0.98) 0%, rgba(5, 3, 15, 0.99) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <DialogHeader>
                        <DialogTitle className="text-3xl">
                            {result?.prize?.type !== 'nothing' ? '🎉 Felicitări!' : '😔 Mai încearcă!'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8">
                        <div 
                            className="w-28 h-28 rounded-2xl mx-auto mb-6 flex items-center justify-center text-5xl"
                            style={{ 
                                backgroundColor: result?.prize?.color + '20', 
                                border: `3px solid ${result?.prize?.color}`,
                                boxShadow: `0 0 40px ${result?.prize?.color}40`
                            }}
                        >
                            {result?.prize?.type === 'cash' && '💰'}
                            {result?.prize?.type === 'ticket' && '🎟️'}
                            {result?.prize?.type === 'bonus_percent' && '🎁'}
                            {result?.prize?.type === 'nothing' && '🍀'}
                        </div>
                        <p className="text-2xl font-bold text-white mb-3">{result?.prize?.label}</p>
                        <p className="text-gray-400">{result?.message}</p>
                    </div>
                    <Button onClick={() => setShowResult(false)} className="w-full py-6 text-lg font-bold"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #f97316)' }}>
                        {isRomanian ? 'Super!' : 'Awesome!'}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LuckyWheelPage;
