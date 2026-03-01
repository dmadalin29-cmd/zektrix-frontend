import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Mail, FileText, HelpCircle } from 'lucide-react';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-muted/30 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-2xl font-black tracking-tighter">
                                <span className="gradient-text">ZEKTRIX</span>
                                <span className="text-white">.UK</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {t('footer_desc')}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-4">{t('footer_quick_links')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/competitions" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                    {t('footer_all_competitions')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/winners" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                    {t('footer_recent_winners')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/search" className="text-sm text-muted-foreground hover:text-white transition-colors">
                                    {t('footer_find_tickets')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-4">{t('footer_legal')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    {t('footer_terms')}
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4" />
                                    {t('footer_faq')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold mb-4">{t('footer_contact')}</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:support@zektrix.uk" className="text-sm text-muted-foreground hover:text-white transition-colors flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    support@zektrix.uk
                                </a>
                            </li>
                        </ul>
                        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                            <Shield className="w-4 h-4 text-secondary" />
                            <span>{t('footer_secure')}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Zektrix UK. {t('footer_rights')}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                        {t('footer_responsible')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
