import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/checkout.css';

function Checkout() {
    const { cartItems, setCartItems } = useContext(CartContext);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    // États pour les données utilisateur
    const [formData, setFormData] = useState({
        address: '', postalCode: '', city: '', country: '', paymentPreference: 'Carte bancaire'
    });
    const [loading, setLoading] = useState(true);

    // États pour le Code Promo
    const [promoCodeInput, setPromoCodeInput] = useState(''); // Ce que l'utilisateur tape
    const [appliedPromotion, setAppliedPromotion] = useState(null); // La promo validée
    const [promoError, setPromoError] = useState(null); // Message d'erreur
    const [promoSuccess, setPromoSuccess] = useState(null); // Message de succès

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        
        fetch(`http://localhost:3001/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setFormData({
                    address: data.address || '',
                    postalCode: data.postalCode || '',
                    city: data.city || '',
                    country: data.country || '',
                    paymentPreference: data.paymentPreference || 'Carte bancaire'
                });
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur récupération infos utilisateur', err);
                setLoading(false);
            });
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- LOGIQUE CODE PROMO ---
    const applyPromoCode = () => {
        setPromoError(null);
        setPromoSuccess(null);
        setAppliedPromotion(null);

        if (!promoCodeInput) return;

        // 1. Vérifier si le panier contient au moins un article éligible (onSale)
        // (Assure-toi que la propriété s'appelle bien onSale, ou onSale === 1 selon ta BDD)
        const hasEligibleItems = cartItems.some(item => item.onSale);
        
        if (!hasEligibleItems) {
            setPromoError("Ce code est valide, mais votre panier ne contient aucun article en promotion éligible.");
            setPromoCodeInput('');
            return;
        }

        fetch('http://localhost:3001/promotions/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: promoCodeInput.toUpperCase().trim() })
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            // Le code est valide et on a des articles éligibles !
            setAppliedPromotion(data.promotion);
            setPromoSuccess(`Code appliqué ! Vous bénéficiez de -${data.promotion.rate}% sur les articles en promotion.`);
        })
        .catch(err => {
            setPromoError(err.message); 
            setPromoCodeInput('');
        });
    };

    const removePromoCode = () => {
        setAppliedPromotion(null);
        setPromoCodeInput('');
        setPromoSuccess(null);
    };

    // --- CALCUL DES TOTAUX ---
    // 1. Total global (tout le panier)
    const initialTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // 2. Sous-total des articles UNIQUEMENT en promotion (onSale)
    const eligibleTotal = cartItems
        .filter(item => item.onSale) // Filtre pour ne garder que les articles onSale
        .reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // 3. Calcul de la réduction (appliquée uniquement sur le sous-total éligible)
    const discountAmount = appliedPromotion ? (eligibleTotal * (appliedPromotion.rate / 100)) : 0;
    
    // 4. Total final à payer
    const finalTotal = initialTotal - discountAmount;

    const handlePayment = (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert('Vous devez être connecté pour passer une commande.');
            history.push('/login');
            return;
        }

        const orderData = {
            idUser: userId,
            cartItems: cartItems,
            // On peut ajouter l'ID de la promo à la commande si tu veux le tracer en BDD (Optionnel)
            // idSale: appliedPromotion ? appliedPromotion.idSale : null, 
            finalTotal: finalTotal // On envoie le montant recalculé
        };

        fetch('http://localhost:3001/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erreur création de la commande');
            return res.json();
        })
        .then(() => {
            alert('Paiement validé avec succès ! Merci pour votre achat.');
            setCartItems([]); // Empty the cart
            history.push('/orders'); // Redirect to My Orders
        })
        .catch(err => {
            console.error(err);
            alert('Une erreur est survenue lors de la validation.');
        });
    };

    if (loading) return <div className="checkout-loading">Chargement de vos informations...</div>;

    return (
        <div className="home">
            <Header />
            <div className="container checkout-container">
                <h1 className="checkout-title">Paiement</h1>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    
                    {/* Colonne de gauche : Le Formulaire de livraison */}
                    <form onSubmit={handlePayment} className="checkout-form" style={{ flex: '1 1 500px', backgroundColor: '#fbfbfb', padding: '30px', borderRadius: '8px', border: '1px solid #eee' }}>
                        
                        {/* (Garde tes champs d'adresse et de paiement identiques, j'abrège pour lisibilité) */}
                        <div className="checkout-form-group">
                            <label className="checkout-label">Adresse de livraison :</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="checkout-input" />
                        </div>
                        {/* ... (Code Postal / Ville / Pays) ... */}
                        <div className="checkout-form-group">
                            <label className="checkout-label">Méthode de paiement :</label>
                            <select name="paymentPreference" value={formData.paymentPreference} onChange={handleInputChange} required className="checkout-input">
                                <option value="Carte bancaire">Carte bancaire</option>
                                <option value="Paypal">Paypal</option>
                            </select>
                        </div>

                        <button type="submit" className="checkout-submit-btn">
                            Valider et Payer {finalTotal.toFixed(2)} €
                        </button>
                    </form>

                    {/* Colonne de droite : Résumé + Code Promo */}
                    <div className="checkout-summary" style={{ flex: '1 1 300px', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', border: '1px solid #ccc', alignSelf: 'flex-start' }}>
                        <h3 style={{ marginTop: 0 }}>Résumé de la commande</h3>
                        <p style={{ color: '#666' }}>Nombre d'articles : {cartItems.length}</p>
                        
                        <div style={{ fontSize: '1.2rem', margin: '15px 0', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            Sous-total : {initialTotal.toFixed(2)} €
                        </div>

                        {/* --- ZONE CODE PROMO --- */}
                        <div style={{ marginTop: '25px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#475569' }}>Un code promo ?</label>
                            
                            {!appliedPromotion ? (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                    <input 
                                        type="text" 
                                        value={promoCodeInput} 
                                        onChange={(e) => setPromoCodeInput(e.target.value)} 
                                        placeholder="SURF20"
                                        style={{ flexGrow: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', textTransform: 'uppercase' }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={applyPromoCode}
                                        style={{ backgroundColor: '#475569', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Appliquer
                                    </button>
                                </div>
                            ) : (
                                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2f1', padding: '10px', borderRadius: '6px' }}>
                                    <div>
                                        <strong style={{ letterSpacing: '1px', color: '#00796b' }}>{appliedPromotion.code}</strong>
                                        <span style={{ fontSize: '0.85rem', color: '#00796b', marginLeft: '10px' }}>(-{appliedPromotion.rate}%)</span>
                                    </div>
                                    <button onClick={removePromoCode} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>[Retirer]</button>
                                </div>
                            )}

                            {/* Messages d'erreur ou de succès */}
                            {promoError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', margin: '8px 0 0 0' }}>❌ {promoError}</p>}
                            {promoSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '8px', margin: '8px 0 0 0' }}>✅ {promoSuccess}</p>}
                        </div>

                        {/* --- TOTAL FINAL AFFICHÉ --- */}
                        <div style={{ marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                            Total à payer : {finalTotal.toFixed(2)} €
                        </div>
                        {appliedPromotion && (
                            <div style={{ fontSize: '0.9rem', color: '#10b981', fontStyle: 'italic' }}>
                                (Vous économisez {discountAmount.toFixed(2)} €)
                            </div>
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Checkout;