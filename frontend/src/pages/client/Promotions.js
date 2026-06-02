import React, { useState, useEffect } from 'react';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';

function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/promotions/active')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setPromotions(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des promos :", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="home">
            <Header />
            
            <div className="container" style={{ minHeight: '60vh', padding: '40px 20px' }}>
                <h1 style={{ textAlign: 'center', color: '#48A3AE', marginBottom: '40px', fontSize: '2.5rem' }}>
                    Nos Offres du Moment 🏷️
                </h1>
                
                {loading ? (
                    <p style={{ textAlign: 'center' }}>Chargement des bons plans...</p>
                ) : promotions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                        <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Aucune offre spéciale pour le moment.</p>
                        <p style={{ color: '#94a3b8' }}>Revenez bientôt pour découvrir nos prochains bons plans !</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center' }}>
                        {promotions.map(promo => (
                            <div key={promo.idSale} style={{
                                border: promo.isFeatured ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '25px',
                                width: '320px',
                                backgroundColor: promo.isFeatured ? '#fff5f5' : '#ffffff',
                                boxShadow: promo.isFeatured ? '0 8px 15px rgba(239, 68, 68, 0.15)' : '0 4px 6px rgba(0,0,0,0.05)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Badge de mise en avant */}
                                {promo.isFeatured && (
                                    <span style={{ 
                                        position: 'absolute', top: '-15px', left: '20px', 
                                        backgroundColor: '#ef4444', color: 'white', 
                                        padding: '5px 15px', borderRadius: '20px', 
                                        fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '1px' 
                                    }}>
                                        ⭐ À LA UNE
                                    </span>
                                )}
                                
                                <h2 style={{ color: '#ef4444', fontSize: '2.5rem', margin: '10px 0 5px 0', textAlign: 'center' }}>
                                    -{Number(promo.rate).toFixed(0)}%
                                </h2>
                                
                                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Code à utiliser dans le panier :</span><br/>
                                    <span style={{ 
                                        display: 'inline-block', backgroundColor: '#f1f5f9', 
                                        padding: '8px 20px', borderRadius: '8px', 
                                        fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', 
                                        marginTop: '5px', border: '1px dashed #cbd5e1'
                                    }}>
                                        {promo.code}
                                    </span>
                                </div>
                                
                                <div style={{ flexGrow: 1 }}>
                                    <p style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1rem', marginBottom: '10px' }}>
                                        {promo.description}
                                    </p>
                                    {promo.conditions && (
                                        <p style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                                            ⚠️ {promo.conditions}
                                        </p>
                                    )}
                                </div>
                                
                                <p style={{ fontSize: '0.8rem', marginTop: '20px', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                    Valable jusqu'au {new Date(promo.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
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