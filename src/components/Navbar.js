import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Menu, User, LogOut, LayoutDashboard, Wallet, Ticket, Shield, Globe, ShoppingCart } from 'lucide-react';
import NotificationBell from './NotificationBell';

// TikTok Icon Component
const TikTokIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const { totalItems } = useCart();
    const location = useLocation();

    const navLinks = [
        { href: '/competitions', label: t('nav_competitions') },
        { href: '/lucky-wheel', label: '🎰 Roata' },
        { href: '/winners', label: t('nav_winners') },
        { href: '/search', label: t('nav_find_tickets') },
        { href: '/faq', label: t('nav_faq') },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="nav-floating">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2" data-testid="navbar-logo">
                    <span className="text-xl font-black tracking-tighter">
                        <span className="gradient-text">ZEKTRIX</span>
                        <span className="text-white">.UK</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            to={link.href}
                            className={`text-sm font-medium transition-colors hover:text-primary ${
                                isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
                            }`}
                            data-testid={`nav-link-${link.href.replace('/', '')}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    
                    {/* TikTok Link */}
                    <a
                        href="https://www.tiktok.com/@x67digital.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        data-testid="tiktok-link"
                    >
                        <TikTokIcon className="w-4 h-4" />
                        <span>@x67digital.com</span>
                    </a>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    {/* TikTok Link Mobile */}
                    <a
                        href="https://www.tiktok.com/@x67digital.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="md:hidden"
                        data-testid="tiktok-link-mobile"
                    >
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                            <TikTokIcon className="w-5 h-5" />
                        </Button>
                    </a>
                    
                    {/* Language Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLanguage}
                        className="flex items-center gap-1.5 text-muted-foreground hover:text-white px-2"
                        data-testid="language-toggle"
                    >
                        <Globe className="w-4 h-4" />
                        <span className="text-xs font-bold">{language === 'ro' ? 'RO' : 'EN'}</span>
                    </Button>

                    {/* Cart Button */}
                    <Link to="/cart" className="relative" data-testid="cart-btn">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="cart-badge">{totalItems}</span>
                            )}
                        </Button>
                    </Link>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {isAuthenticated ? (
                        <>
                            {/* Wallet Balance */}
                            <Link to="/dashboard" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/30 hover:bg-secondary/20 transition-colors" data-testid="wallet-balance-btn">
                                <Wallet className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-bold font-mono text-secondary">RON {(user?.balance || 0).toFixed(2)}</span>
                            </Link>

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-white/10" data-testid="user-menu-btn">
                                        {user?.picture ? (
                                            <img src={user.picture} alt={user.username} className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            <User className="h-4 w-4" />
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <div className="px-2 py-1.5">
                                        <p className="text-sm font-medium">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard" className="flex items-center cursor-pointer" data-testid="menu-dashboard">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            {t('nav_dashboard')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard/tickets" className="flex items-center cursor-pointer" data-testid="menu-tickets">
                                            <Ticket className="mr-2 h-4 w-4" />
                                            {t('nav_my_tickets')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to="/dashboard/wallet" className="flex items-center cursor-pointer" data-testid="menu-wallet">
                                            <Wallet className="mr-2 h-4 w-4" />
                                            {t('nav_wallet')}
                                        </Link>
                                    </DropdownMenuItem>
                                    {isAdmin && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin" className="flex items-center cursor-pointer text-primary" data-testid="menu-admin">
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    {t('nav_admin')}
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive" data-testid="menu-logout">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        {t('nav_logout')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hidden sm:block">
                                <Button variant="ghost" className="text-muted-foreground hover:text-white text-sm" data-testid="nav-login-btn">
                                    {t('nav_signin')}
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button className="btn-primary px-5 py-2 text-sm" data-testid="nav-signup-btn">
                                    {t('nav_get_started')}
                                </Button>
                            </Link>
                        </>
                    )}

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="relative" data-testid="mobile-menu-btn">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-l border-primary/20 bg-gradient-to-b from-background via-background to-primary/5">
                            {/* Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="text-2xl font-black tracking-tighter">
                                    <span className="gradient-text">ZEKTRIX</span>
                                    <span className="text-white">.UK</span>
                                </div>
                            </div>
                            
                            {/* Navigation Links */}
                            <div className="p-6 space-y-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                                            isActive(link.href) 
                                                ? 'bg-gradient-to-r from-primary/20 to-secondary/10 text-white border border-primary/30' 
                                                : 'text-white/70 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-lg font-semibold">{link.label}</span>
                                        {isActive(link.href) && <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse" />}
                                    </Link>
                                ))}
                                
                                {/* TikTok Link */}
                                <a
                                    href="https://www.tiktok.com/@x67digital.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 rounded-2xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300"
                                >
                                    <TikTokIcon className="w-5 h-5" />
                                    <span className="text-lg font-semibold">@x67digital.com</span>
                                    <span className="ml-auto px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full">TikTok</span>
                                </a>
                                
                                {/* Cart */}
                                <Link to="/cart" className="flex items-center gap-4 p-4 rounded-2xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300">
                                    <ShoppingCart className="w-5 h-5" />
                                    <span className="text-lg font-semibold">{t('nav_cart') || 'Coș'}</span>
                                    {totalItems > 0 && (
                                        <span className="ml-auto px-3 py-1 text-sm font-bold bg-gradient-to-r from-primary to-secondary rounded-full text-white">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            </div>
                            
                            {/* User Section */}
                            {isAuthenticated && (
                                <div className="p-6 border-t border-white/10">
                                    <p className="text-xs text-white/40 uppercase tracking-wider mb-4">Contul meu</p>
                                    <Link to="/dashboard" className="flex items-center gap-4 p-4 rounded-2xl text-white/70 hover:bg-white/5 hover:text-white transition-all duration-300">
                                        <LayoutDashboard className="w-5 h-5" />
                                        <span className="text-lg font-semibold">{t('nav_dashboard')}</span>
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="flex items-center gap-4 p-4 rounded-2xl text-primary hover:bg-primary/10 transition-all duration-300">
                                            <Shield className="w-5 h-5" />
                                            <span className="text-lg font-semibold">{t('nav_admin')}</span>
                                            <span className="ml-auto px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">Admin</span>
                                        </Link>
                                    )}
                                </div>
                            )}
                            
                            {/* Footer */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10 bg-background/80 backdrop-blur-xl">
                                <Button
                                    variant="outline"
                                    onClick={toggleLanguage}
                                    className="w-full h-14 justify-center gap-3 rounded-2xl border-white/20 hover:bg-white/5 text-base font-semibold"
                                >
                                    <Globe className="w-5 h-5" />
                                    {language === 'ro' ? '🇬🇧 English' : '🇷🇴 Română'}
                                </Button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
