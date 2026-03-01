import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Mail } from 'lucide-react';

const TermsPage = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-muted text-muted-foreground">
                            <FileText className="w-3 h-3 mr-1" /> {t('legal')}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {t('terms_title').split('&')[0]} <span className="gradient-text">&{t('terms_title').split('&')[1]}</span>
                        </h1>
                        <p className="text-muted-foreground">
                            {t('terms_updated')}: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    {/* Content */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-8 prose prose-invert max-w-none">
                            <div className="space-y-8 text-muted-foreground">
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_intro_title')}</h2>
                                    <p>{t('terms_intro')}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_eligibility_title')}</h2>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('terms_eligibility_1')}</li>
                                        <li>{t('terms_eligibility_2')}</li>
                                        <li>{t('terms_eligibility_3')}</li>
                                        <li>{t('terms_eligibility_4')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_rules_title')}</h2>
                                    <p className="mb-4">
                                        <strong className="text-white">{t('terms_entry_methods')}</strong> {t('terms_entry_methods_desc')}
                                    </p>
                                    <p className="mb-4">
                                        <strong className="text-white">{t('terms_ticket_numbers')}</strong> {t('terms_ticket_numbers_desc')}
                                    </p>
                                    <p className="mb-4">
                                        <strong className="text-white">{t('terms_winner_selection')}</strong>
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2 mb-4">
                                        <li>{t('terms_instant_win_rules')}</li>
                                        <li>{t('terms_classic_rules')}</li>
                                    </ul>
                                    <p>
                                        <strong className="text-white">{t('terms_notification')}</strong> {t('terms_notification_desc')}
                                    </p>
                                </section>

                                <section className="bg-secondary/10 border border-secondary/30 rounded-xl p-6">
                                    <h2 className="text-xl font-bold text-secondary mb-4">{t('terms_postal_title')}</h2>
                                    <p className="mb-4">{t('terms_postal_intro')}</p>
                                    <ol className="list-decimal pl-6 space-y-2 mb-4">
                                        <li>{t('terms_postal_1')}</li>
                                        <li>{t('terms_postal_2')}</li>
                                        <li>{t('terms_postal_3')}</li>
                                        <li>{t('terms_postal_4')}</li>
                                        <li>{t('terms_postal_5')}</li>
                                    </ol>
                                    <p className="text-sm">{t('terms_postal_note')}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_payments_title')}</h2>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('terms_payments_1')}</li>
                                        <li>{t('terms_payments_2')}</li>
                                        <li>{t('terms_payments_3')}</li>
                                        <li>{t('terms_payments_4')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_prizes_title')}</h2>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>{t('terms_prizes_1')}</li>
                                        <li>{t('terms_prizes_2')}</li>
                                        <li>{t('terms_prizes_3')}</li>
                                        <li>{t('terms_prizes_4')}</li>
                                    </ul>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_liability_title')}</h2>
                                    <p>{t('terms_liability')}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_privacy_title')}</h2>
                                    <p>{t('terms_privacy')}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_changes_title')}</h2>
                                    <p>{t('terms_changes')}</p>
                                </section>

                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4">{t('terms_contact_title')}</h2>
                                    <p className="mb-4">{t('terms_contact')}</p>
                                    <div className="bg-muted/30 rounded-xl p-4">
                                        <p className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-primary" />
                                            <a href="mailto:support@zektrix.uk" className="text-primary hover:underline">
                                                support@zektrix.uk
                                            </a>
                                        </p>
                                    </div>
                                </section>

                                <section className="border-t border-white/10 pt-8">
                                    <p className="text-sm italic">{t('terms_agreement')}</p>
                                </section>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TermsPage;
