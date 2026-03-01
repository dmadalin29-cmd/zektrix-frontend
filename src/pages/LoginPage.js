import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, Zap, Trophy, Wallet } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, loginWithGoogle } = useAuth();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');

    // Login form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register form
    const [regUsername, setRegUsername] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regConfirmPassword, setRegConfirmPassword] = useState('');

    const from = location.state?.from?.pathname || '/dashboard';

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(loginEmail, loginPassword);
            toast.success(t('welcome') + '!');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (regPassword !== regConfirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (regPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(regUsername, regEmail, regPassword);
            toast.success(t('success') + '!');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen hero-bg flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link to="/" className="block text-center mb-8">
                    <h1 className="text-3xl font-black tracking-tighter">
                        <span className="gradient-text">ZEKTRIX</span>
                        <span className="text-white">.UK</span>
                    </h1>
                </Link>

                <Card className="glass border-white/10">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">{t('welcome_login')}</CardTitle>
                        <CardDescription>{t('login_subtitle')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
                                <TabsTrigger value="login" data-testid="login-tab">{t('tab_signin')}</TabsTrigger>
                                <TabsTrigger value="register" data-testid="register-tab">{t('tab_signup')}</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">{t('email')}</Label>
                                        <div className="relative">
                                            <Mail className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="login-email-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">{t('password')}</Label>
                                        <div className="relative">
                                            <Lock className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="login-password-input"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full btn-primary"
                                        disabled={loading}
                                        data-testid="login-submit-btn"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {t('tab_signin')}
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="register">
                                <form onSubmit={handleRegister} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username">{t('username')}</Label>
                                        <div className="relative">
                                            <User className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="reg-username"
                                                type="text"
                                                placeholder="johndoe"
                                                value={regUsername}
                                                onChange={(e) => setRegUsername(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="register-username-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">{t('email')}</Label>
                                        <div className="relative">
                                            <Mail className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="reg-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={regEmail}
                                                onChange={(e) => setRegEmail(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="register-email-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">{t('password')}</Label>
                                        <div className="relative">
                                            <Lock className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="reg-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="register-password-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-confirm">{t('confirm_password')}</Label>
                                        <div className="relative">
                                            <Lock className="input-icon w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="reg-confirm"
                                                type="password"
                                                placeholder="••••••••"
                                                value={regConfirmPassword}
                                                onChange={(e) => setRegConfirmPassword(e.target.value)}
                                                className="input-modern input-with-icon"
                                                required
                                                data-testid="register-confirm-input"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full btn-primary"
                                        disabled={loading}
                                        data-testid="register-submit-btn"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {t('tab_signup')}
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">{t('or_continue')}</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-white/20 hover:bg-white/5"
                            onClick={loginWithGoogle}
                            data-testid="google-login-btn"
                        >
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            {t('continue_google')}
                        </Button>

                        {/* Features */}
                        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-1">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <p className="text-xs text-muted-foreground">{t('instant_wins')}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                                    <Trophy className="w-5 h-5 text-secondary" />
                                </div>
                                <p className="text-xs text-muted-foreground">{t('big_prizes')}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                                    <Wallet className="w-5 h-5 text-accent" />
                                </div>
                                <p className="text-xs text-muted-foreground">{t('easy_deposits')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-4">
                    {t('by_signing')}{' '}
                    <Link to="/terms" className="text-primary hover:underline">{t('footer_terms')}</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
