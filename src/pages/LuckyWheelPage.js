import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Gift, Loader2, Clock, Sparkles } from 'lucide-react';
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
        if (user && token) {
            checkSpinStatus();
        }
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
            
            // Calculate rotation to land on prize
            const segmentAngle = 360 / prizes.length;
            const targetAngle = segmentAngle * prize_index + segmentAngle / 2;
            const spins = 5; // Number of full rotations
            const finalRotation = rotation + (360 * spins) + (360 - targetAngle);
            
            setRotation(finalRotation);
            
            // Wait for animation to complete
            setTimeout(() => {
                setSpinning(false);
                setResult({ prize, message });
                setShowResult(true);
                setCanSpin(false);
                
                // Confetti for wins
                if (prize.type !== 'nothing') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                
                // Refresh user data to update balance
                if (refreshUser) refreshUser();
            }, 5000);
            
        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.detail || 'Eroare la învârtire');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="text-yellow-500 font-medium">{isRomanian ? 'O Învârtire Zilnic!' : 'One Spin Daily!'}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">
                        🎰 {isRomanian ? 'Roata Norocului' : 'Lucky Wheel'}
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        {isRomanian 
                            ? 'Învârte roata zilnic pentru șansa de a câștiga bani, bilete gratuite sau bonusuri!' 
                            : 'Spin the wheel daily for a chance to win cash, free tickets or bonuses!'}
                    </p>
                </div>

                {/* Wheel Container */}
                <div className="relative flex flex-col items-center">
                    {/* Pointer */}
                    <div className="absolute top-0 z-20 transform -translate-y-2">
                        <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-500 drop-shadow-lg"></div>
                    </div>

                    {/* Wheel */}
                    <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
                        <div 
                            ref={wheelRef}
                            className="w-full h-full rounded-full drop-shadow-2xl relative overflow-hidden"
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                                background: `conic-gradient(${prizes.map((p, i) => 
                                    `${p.color} ${(i/prizes.length)*100}% ${((i+1)/prizes.length)*100}%`
                                ).join(', ')})`
                            }}
                        >
                            {/* Prize Labels */}
                            {prizes.map((prize, index) => {
                                const angle = (360 / prizes.length) * index + (360 / prizes.length / 2);
                                return (
                                    <div
                                        key={index}
                                        className="absolute text-white text-xs font-bold whitespace-nowrap"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                            transform: `rotate(${angle}deg) translateX(60px)`,
                                            transformOrigin: 'left center',
                                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                                        }}
                                    >
                                        {prize.label}
                                    </div>
                                );
                            })}
                            {/* Center circle */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-[#1a1a2e] border-4 border-primary flex items-center justify-center">
                                <span className="text-white font-bold text-sm">SPIN</span>
                            </div>
                        </div>
                    </div>

                    {/* Spin Button */}
                    <Button
                        onClick={spinWheel}
                        disabled={!canSpin || spinning || !user}
                        className={`mt-8 px-12 py-6 text-xl font-bold rounded-full transition-all ${
                            canSpin && !spinning 
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 animate-pulse' 
                                : 'bg-muted'
                        }`}
                        data-testid="spin-btn"
                    >
                        {spinning ? (
                            <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> {isRomanian ? 'Se învârte...' : 'Spinning...'}</>
                        ) : !user ? (
                            <>{isRomanian ? 'Autentifică-te pentru a învârti' : 'Login to Spin'}</>
                        ) : canSpin ? (
                            <><Gift className="w-6 h-6 mr-2" /> {isRomanian ? 'ÎNVÂRTE ROATA!' : 'SPIN THE WHEEL!'}</>
                        ) : (
                            <><Clock className="w-6 h-6 mr-2" /> {isRomanian ? 'Revino mâine!' : 'Come back tomorrow!'}</>
                        )}
                    </Button>

                    {!canSpin && !spinning && (
                        <p className="mt-4 text-muted-foreground text-sm">
                            {isRomanian ? '⏰ Poți învârti din nou mâine la ora 00:00' : '⏰ You can spin again tomorrow at midnight'}
                        </p>
                    )}
                </div>

                {/* Prize Legend */}
                <Card className="mt-12 glass border-white/10">
                    <CardHeader>
                        <CardTitle>{isRomanian ? 'Premii Disponibile' : 'Available Prizes'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {prizes.map((prize, index) => (
                                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: prize.color }}></div>
                                    <span className="text-sm font-medium">{prize.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Result Modal */}
            <Dialog open={showResult} onOpenChange={setShowResult}>
                <DialogContent className="glass border-white/10 text-center">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {result?.prize?.type !== 'nothing' ? '🎉 Felicitări!' : '😔 Mai încearcă!'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-8">
                        <div 
                            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
                            style={{ backgroundColor: result?.prize?.color + '33', border: `3px solid ${result?.prize?.color}` }}
                        >
                            {result?.prize?.type === 'cash' && '💰'}
                            {result?.prize?.type === 'ticket' && '🎟️'}
                            {result?.prize?.type === 'bonus_percent' && '🎁'}
                            {result?.prize?.type === 'nothing' && '🍀'}
                        </div>
                        <p className="text-xl font-bold mb-2">{result?.prize?.label}</p>
                        <p className="text-muted-foreground">{result?.message}</p>
                    </div>
                    <Button onClick={() => setShowResult(false)} className="btn-primary">
                        {isRomanian ? 'Super!' : 'Awesome!'}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default LuckyWheelPage;
