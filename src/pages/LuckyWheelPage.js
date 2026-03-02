import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Gift, Loader2, Clock, ArrowLeft, Star, Trophy, Sparkles } from 'lucide-react';
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
            toast.error(isRomanian ? 'Trebuie să fii autentificat!' : 'You must be logged in!');
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
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#06b6d4', '#10b981'] });
                }
                
                if (refreshUser) refreshUser();
            }, 5000);
            
        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.detail || 'Eroare');
        }
    };

    // Elegant color palette - no casino colors
    const elegantColors = [
        '#8b5cf6', // violet
        '#06b6d4', // cyan
        '#10b981', // emerald
        '#6366f1', // indigo
        '#0ea5e9', // sky
        '#14b8a6', // teal
        '#7c3aed', // purple
        '#0891b2', // dark cyan
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#030014] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030014]" data-testid="lucky-wheel-page">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    {/* Back Button */}
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        <span>{isRomanian ? 'Înapoi' : 'Back'}</span>
                    </Link>

                    {/* Header - Clean & Professional */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                            <Sparkles className="w-4 h-4 text-violet-400" />
                            <span className="text-violet-400 text-sm font-medium">{isRomanian ? 'Bonus Zilnic' : 'Daily Bonus'}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                            {isRomanian ? 'Roata Bonusurilor' : 'Bonus Wheel'}
                        </h1>
                        <p className="text-gray-400 max-w-md mx-auto">
                            {isRomanian 
                                ? 'Învârte roata o dată pe zi pentru a primi bonusuri și reduceri exclusive.' 
                                : 'Spin the wheel once daily for exclusive bonuses and discounts.'}
                        </p>
                    </div>

                    {/* Wheel Container - Clean Design */}
                    <div className="relative flex flex-col items-center">
                        {/* Pointer - Minimal */}
                        <div className="absolute top-0 z-20 -mt-1">
                            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-violet-500" />
                        </div>

                        {/* Wheel - Professional Look */}
                        <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px]">
                            <div className="absolute inset-0 rounded-full p-1"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(6, 182, 212, 0.2))',
                                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)'
                                }}>
                                <div 
                                    ref={wheelRef}
                                    className="w-full h-full rounded-full relative overflow-hidden"
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                        background: `conic-gradient(${prizes.map((p, i) => 
                                            `${elegantColors[i % elegantColors.length]} ${(i/prizes.length)*100}% ${((i+1)/prizes.length)*100}%`
                                        ).join(', ')})`
                                    }}
                                >
                                    {/* Prize Labels */}
                                    {prizes.map((prize, index) => {
                                        const angle = (360 / prizes.length) * index + (360 / prizes.length / 2);
                                        return (
                                            <div
                                                key={index}
                                                className="absolute text-white text-[9px] md:text-[11px] font-semibold whitespace-nowrap"
                                                style={{
                                                    left: '50%',
                                                    top: '50%',
                                                    transform: `rotate(${angle}deg) translateX(55px) md:translateX(70px)`,
                                                    transformOrigin: 'left center',
                                                    textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
                                                }}
                                            >
                                                {prize.label}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Center - Clean */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-[#0a0614] border-2 border-violet-500/50">
                                        <Gift className="w-6 h-6 md:w-8 md:h-8 text-violet-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Spin Button - Clean */}
                        <Button
                            onClick={spinWheel}
                            disabled={!canSpin || spinning || !user}
                            className="mt-8 px-10 py-6 text-lg font-semibold rounded-xl transition-all"
                            style={{
                                background: canSpin && !spinning && user
                                    ? 'linear-gradient(135deg, #8b5cf6, #06b6d4)'
                                    : 'rgba(255,255,255,0.1)',
                                boxShadow: canSpin && !spinning && user
                                    ? '0 0 30px rgba(139, 92, 246, 0.4)'
                                    : 'none'
                            }}
                            data-testid="spin-btn"
                        >
                            {spinning ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {isRomanian ? 'Se învârte...' : 'Spinning...'}</>
                            ) : !user ? (
                                <>{isRomanian ? 'Autentifică-te' : 'Login to Spin'}</>
                            ) : canSpin ? (
                                <><Gift className="w-5 h-5 mr-2" /> {isRomanian ? 'Învârte Roata' : 'Spin the Wheel'}</>
                            ) : (
                                <><Clock className="w-5 h-5 mr-2" /> {isRomanian ? 'Revino mâine' : 'Come back tomorrow'}</>
                            )}
                        </Button>

                        {!canSpin && !spinning && (
                            <p className="mt-4 text-gray-500 text-sm">
                                {isRomanian ? 'Poți învârti din nou mâine la 00:00' : 'Next spin available at midnight'}
                            </p>
                        )}
                    </div>

                    {/* Prize Legend - Clean Cards */}
                    <div className="mt-12 rounded-2xl p-5"
                        style={{
                            background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(10, 6, 20, 0.95) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}>
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-violet-400" />
                            {isRomanian ? 'Bonusuri Disponibile' : 'Available Bonuses'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {prizes.map((prize, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                                    <div className="w-3 h-3 rounded-full flex-shrink-0" 
                                        style={{ backgroundColor: elegantColors[index % elegantColors.length] }} />
                                    <span className="text-xs font-medium text-gray-300">{prize.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info - Clean */}
                    <div className="grid md:grid-cols-3 gap-3 mt-4">
                        {[
                            { icon: Star, title: isRomanian ? 'Zilnic' : 'Daily', desc: isRomanian ? 'O învârtire gratuită' : 'One free spin' },
                            { icon: Gift, title: isRomanian ? 'Instant' : 'Instant', desc: isRomanian ? 'Bonusuri creditate instant' : 'Instantly credited' },
                            { icon: Trophy, title: isRomanian ? 'Exclusiv' : 'Exclusive', desc: isRomanian ? 'Doar pentru utilizatori' : 'Members only' }
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-4 bg-white/5 border border-white/5 text-center">
                                <item.icon className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                                <h4 className="font-medium text-white text-sm">{item.title}</h4>
                                <p className="text-xs text-gray-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Result Modal - Clean */}
            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(10, 6, 20, 0.98) 0%, rgba(5, 3, 15, 0.99) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl text-white">
                            {result?.prize?.type !== 'nothing' ? (isRomanian ? 'Felicitări!' : 'Congratulations!') : (isRomanian ? 'Mai încearcă!' : 'Try again!')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-6">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                            {result?.prize?.type !== 'nothing' ? (
                                <Trophy className="w-10 h-10 text-white" />
                            ) : (
                                <Star className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <p className="text-xl font-bold text-white mb-2">{result?.prize?.label}</p>
                        <p className="text-gray-400 text-sm">{result?.message}</p>
                    </div>
                    <Button onClick={() => setShowResult(false)} className="w-full py-5 bg-violet-600 hover:bg-violet-500">
                        {isRomanian ? 'Închide' : 'Close'}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LuckyWheelPage;
