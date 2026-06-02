import React, { useState, useEffect, useContext } from 'react';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/home.css';

const translations = {
    fr: {
        title: "Nos Offres du Moment",
        loading: "Chargement des bons plans...",
        noOffers: "Aucune offre spéciale pour le moment.",
        comeBack: "Revenez bientôt pour découvrir nos prochains bons plans !",
        featured: "À LA UNE",
        codeToUse: "Code à utiliser dans le panier :",
        validUntil: "Valable jusqu'au"
    },
    en: {
        title: "Current Offers",
        loading: "Loading great deals...",
        noOffers: "No special offers at the moment.",
        comeBack: "Check back soon to discover our next great deals!",
        featured: "FEATURED",
        codeToUse: "Code to use in cart:",
        validUntil: "Valid until"
    }
};

function Promotions() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/promotions/active')
            .then(res => res.json())
            .then(data => {
                setPromotions(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des promos :", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            
            <div className="container" style={{ minHeight: '60vh', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#48A3AE', marginBottom: '40px', fontSize: '2.5rem' }}>
                    {t.title}
                </h1>
                
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-color)' }}>{t.loading}</p>
                ) : promotions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>{t.noOffers}</p>
                        <p style={{ color: '#94a3b8' }}>{t.comeBack}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', marginLeft: '200px' }}>
                        {promotions.map(promo => (
                            <div key={promo.idSale} style={{
                                border: promo.isFeatured ? '2px solid #ef4444' : '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '25px',
                                width: '320px',
                                backgroundColor: promo.isFeatured ? (theme === 'dark' ? '#451a1a' : '#fff5f5') : 'var(--card-bg)',
                                boxShadow: promo.isFeatured ? '0 8px 15px rgba(239, 68, 68, 0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {promo.isFeatured && (
                                    <span style={{ 
                                        position: 'absolute', top: '-15px', left: '20px', 
                                        backgroundColor: '#ef4444', color: 'white', 
                                        padding: '5px 15px', borderRadius: '20px', 
                                        fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' 
                                    }}>
                                        {t.featured}
                                    </span>
                                )}
                                
                                <h2 style={{ color: '#ef4444', fontSize: '2.5rem', margin: '10px 0 5px 0', textAlign: 'center' }}>
                                    -{Number(promo.rate).toFixed(0)}%
                                </h2>
                                
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{t.codeToUse}</span><br/>
                                    <span style={{ 
                                        display: 'inline-block', backgroundColor: 'var(--bg-color)', 
                                        padding: '8px 20px', borderRadius: '8px', 
                                        fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', 
                                        marginTop: '5px', border: '1px dashed #cbd5e1', color: 'var(--text-color)'
                                    }}>
                                        {promo.code}
                                    </span>
                                </div>
                                
                                <div style={{ flexGrow: 1 }}>
                                    <p style={{ fontWeight: 'bold', color: 'var(--text-color)', fontSize: '1.1rem', marginBottom: '10px' }}>{promo.description}</p>
                                    {promo.conditions && (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', backgroundColor: 'var(--bg-color)', padding: '10px', borderRadius: '6px' }}>{promo.conditions}</p>
                                    )}
                                </div>
                                
                                <p style={{ fontSize: '0.8rem', marginTop: '20px', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                    {t.validUntil} {new Date(promo.dateFin).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
}
export default Promotions;