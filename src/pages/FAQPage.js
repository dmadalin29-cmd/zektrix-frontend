import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';
import { HelpCircle, Mail } from 'lucide-react';

const FAQPage = () => {
    const { t } = useLanguage();

    const faqs = [
        { q: t('faq_1_q'), a: t('faq_1_a') },
        { q: t('faq_2_q'), a: t('faq_2_a') },
        { q: t('faq_3_q'), a: t('faq_3_a') },
        { q: t('faq_4_q'), a: t('faq_4_a') },
        { q: t('faq_5_q'), a: t('faq_5_a') },
        { q: t('faq_6_q'), a: t('faq_6_a') },
        { q: t('faq_7_q'), a: t('faq_7_a') },
        { q: t('faq_8_q'), a: t('faq_8_a') },
        { q: t('faq_9_q'), a: t('faq_9_a') },
        { q: t('faq_10_q'), a: t('faq_10_a') }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                            <HelpCircle className="w-3 h-3 mr-1" /> {t('help_center')}
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                            {t('faq_title').split(' ').slice(0, -1).join(' ')} <span className="gradient-text">{t('faq_title').split(' ').slice(-1)}</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            {t('faq_subtitle')}
                        </p>
                    </div>

                    {/* FAQ Accordion */}
                    <Card className="glass border-white/10">
                        <CardContent className="p-6">
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`} className="border-white/10" data-testid={`faq-item-${index}`}>
                                        <AccordionTrigger className="text-left hover:text-primary py-4">
                                            {faq.q}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground pb-4">
                                            {faq.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>

                    {/* Contact Section */}
                    <Card className="glass border-white/10 mt-8">
                        <CardContent className="p-8 text-center">
                            <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
                            <h3 className="text-xl font-bold mb-2">{t('still_questions')}</h3>
                            <p className="text-muted-foreground mb-4">
                                {t('support_here')}
                            </p>
                            <a 
                                href="mailto:support@zektrix.uk" 
                                className="text-primary hover:underline font-medium"
                            >
                                support@zektrix.uk
                            </a>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FAQPage;
