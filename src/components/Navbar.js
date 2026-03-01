import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Menu, User, LogOut, LayoutDashboard, Wallet, Ticket, Shield, Globe, ShoppingCart } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const { totalItems } = useCart();
    const location = useLocation();

    const navLinks = [
        { href: '/competitions', label: t('nav_competitions') },
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
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
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
                            <Button variant="ghost" size="icon" data-testid="mobile-menu-btn">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] bg-background border-white/10">
                            <div className="flex flex-col gap-6 mt-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className={`text-lg font-medium transition-colors ${
                                            isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-white'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link to="/cart" className="text-lg font-medium text-muted-foreground hover:text-white flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    {t('nav_cart') || 'Coș'}
                                    {totalItems > 0 && <span className="text-secondary">({totalItems})</span>}
                                </Link>
                                {isAuthenticated && (
                                    <>
                                        <hr className="border-white/10" />
                                        <Link to="/dashboard" className="text-lg font-medium text-muted-foreground hover:text-white">
                                            {t('nav_dashboard')}
                                        </Link>
                                        {isAdmin && (
                                            <Link to="/admin" className="text-lg font-medium text-primary">
                                                {t('nav_admin')}
                                            </Link>
                                        )}
                                    </>
                                )}
                                <hr className="border-white/10" />
                                <Button
                                    variant="outline"
                                    onClick={toggleLanguage}
                                    className="w-full justify-start"
                                >
                                    <Globe className="w-4 h-4 mr-2" />
                                    {language === 'ro' ? 'Switch to English' : 'Schimbă în Română'}
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
