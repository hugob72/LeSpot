import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/checkout.css';

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        loading: "Chargement de vos informations...",
        title: "Paiement",
        deliveryAddress: "Adresse de livraison :",
        paymentMethod: "Méthode de paiement :",
        card: "Carte bancaire",
        paypal: "Paypal",
        cardNumber: "Numéro de carte",
        cardExpiry: "Date d'expiration (MM/AA)",
        cardCvv: "Code de sécurité (CVV)",
        payBtn: "Valider et Payer",
        summaryTitle: "Résumé de la commande",
        itemCount: "Nombre d'articles :",
        subtotal: "Sous-total :",
        promoQuestion: "Un code promo ?",
        apply: "Appliquer",
        remove: "[Retirer]",
        totalPay: "Total à payer :",
        youSave: "Vous économisez",
        loginRequired: "Vous devez être connecté pour passer une commande.",
        successOrder: "Paiement validé avec succès ! Merci pour votre achat.",
        errorOrder: "Une erreur est survenue lors de la validation.",
        promoNoEligible: "Ce code est valide, mais votre panier ne contient aucun article en promotion éligible.",
        promoApplied1: "Code appliqué ! Vous bénéficiez de -",
        promoApplied2: "% sur les articles en promotion."
    },
    en: {
        loading: "Loading your information...",
        title: "Checkout",
        deliveryAddress: "Delivery Address:",
        paymentMethod: "Payment Method:",
        card: "Credit Card",
        paypal: "Paypal",
        cardNumber: "Card number",
        cardExpiry: "Expiration date (MM/YY)",
        cardCvv: "Security code (CVV)",
        payBtn: "Confirm and Pay",
        summaryTitle: "Order Summary",
        itemCount: "Number of items:",
        subtotal: "Subtotal:",
        promoQuestion: "Have a promo code?",
        apply: "Apply",
        remove: "[Remove]",
        totalPay: "Total to pay:",
        youSave: "You save",
        loginRequired: "You must be logged in to place an order.",
        successOrder: "Payment successfully validated! Thank you for your purchase.",
        errorOrder: "An error occurred during checkout.",
        promoNoEligible: "This code is valid, but your cart contains no eligible sale items.",
        promoApplied1: "Code applied! You get -",
        promoApplied2: "% off sale items."
    }
};

function Checkout() {
    const { language, currency, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const { cartItems, setCartItems } = useContext(CartContext);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    // NOUVEAU : Ajout des champs de carte bancaire dans le state initial
    const [formData, setFormData] = useState({
        address: '', postalCode: '', city: '', country: '', paymentPreference: 'Carte bancaire',
        cardNumber: '', cardExpiry: '', cardCvv: ''
    });
    const [loading, setLoading] = useState(true);

    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [promoError, setPromoError] = useState(null);
    const [promoSuccess, setPromoSuccess] = useState(null);

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }
        fetch(`http://localhost:3001/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                // On s'assure que la valeur est valide. Si ce n'est pas strictement 'Paypal', 
                // on force 'Carte bancaire' par défaut, même si la BDD renvoie "Aucun" ou null.
                const validPaymentPref = data.paymentPreference === 'Paypal' ? 'Paypal' : 'Carte bancaire';

                setFormData(prev => ({
                    ...prev,
                    address: data.address || '', 
                    postalCode: data.postalCode || '',
                    city: data.city || '', 
                    country: data.country || '',
                    paymentPreference: validPaymentPref
                }));
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const applyPromoCode = () => {
        setPromoError(null);
        setPromoSuccess(null);
        setAppliedPromotion(null);

        if (!promoCodeInput) return;

        const hasEligibleItems = cartItems.some(item => item.onSale);
        if (!hasEligibleItems) {
            setPromoError(t.promoNoEligible);
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
            
            setAppliedPromotion(data.promotion);
            setPromoSuccess(`${t.promoApplied1}${data.promotion.rate}${t.promoApplied2}`);
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

    const initialTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const eligibleTotal = cartItems.filter(item => item.onSale).reduce((acc, item) => acc + item.price * item.quantity, 0);
    const discountAmount = appliedPromotion ? (eligibleTotal * (appliedPromotion.rate / 100)) : 0;
    const finalTotal = initialTotal - discountAmount;

    const handlePayment = (e) => {
        e.preventDefault();
        if (!userId) {
            alert(t.loginRequired);
            history.push('/login');
            return;
        }

        const orderData = {
            idUser: userId,
            cartItems: cartItems,
            finalTotal: parseFloat(finalTotal.toFixed(2)) 
            // Note : En situation réelle, n'envoyez pas cardNumber, cardExpiry et cardCvv à votre propre backend pour des raisons de sécurité.
        };

        fetch('http://localhost:3001/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erreur');
            return res.json();
        })
        .then(() => {
            alert(t.successOrder);
            setCartItems([]);
            history.push('/orders');
        })
        .catch(err => {
            console.error(err);
            alert(t.errorOrder);
        });
    };

    if (loading) return <div className="checkout-loading">{t.loading}</div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container checkout-container">
                <h1 className="checkout-title">{t.title}</h1>
                
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <form onSubmit={handlePayment} className="checkout-form" style={{ flex: '1 1 500px', backgroundColor: 'var(--card-bg, #fbfbfb)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-color, #eee)' }}>
                        <div className="checkout-form-group">
                            <label className="checkout-label">{t.deliveryAddress}</label>
                            <input type="text" name="address" value={formData.address} onChange={handleInputChange} required className="checkout-input" />
                        </div>
                        <div className="checkout-form-group">
                            <label className="checkout-label">{t.paymentMethod}</label>
                            <select name="paymentPreference" value={formData.paymentPreference} onChange={handleInputChange} required className="checkout-input">
                                <option value="Carte bancaire">{t.card}</option>
                                <option value="Paypal">{t.paypal}</option>
                            </select>
                        </div>

                        {/* NOUVEAU : Affichage conditionnel des champs de carte bancaire */}
                        {formData.paymentPreference === 'Carte bancaire' && (
                            <div style={{ marginTop: '15px', marginBottom: '20px', padding: '15px', backgroundColor: 'var(--bg-color, #f8fafc)', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                <div className="checkout-form-group" style={{ marginBottom: '15px' }}>
                                    <label className="checkout-label">{t.cardNumber}</label>
                                    <input 
                                        type="text" 
                                        name="cardNumber" 
                                        value={formData.cardNumber} 
                                        onChange={handleInputChange} 
                                        required 
                                        maxLength="19" 
                                        placeholder="0000 0000 0000 0000" 
                                        className="checkout-input" 
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="checkout-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label className="checkout-label">{t.cardExpiry}</label>
                                        <input 
                                            type="text" 
                                            name="cardExpiry" 
                                            value={formData.cardExpiry} 
                                            onChange={handleInputChange} 
                                            required 
                                            maxLength="5" 
                                            placeholder="MM/AA" 
                                            className="checkout-input" 
                                        />
                                    </div>
                                    <div className="checkout-form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label className="checkout-label">{t.cardCvv}</label>
                                        <input 
                                            type="text" 
                                            name="cardCvv" 
                                            value={formData.cardCvv} 
                                            onChange={handleInputChange} 
                                            required 
                                            maxLength="3" 
                                            placeholder="123" 
                                            className="checkout-input" 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="checkout-submit-btn">
                            {t.payBtn} {formatPrice(finalTotal)}
                        </button>
                    </form>

                    <div className="checkout-summary" style={{ flex: '1 1 300px', backgroundColor: 'var(--card-bg, #fff)', padding: '30px', borderRadius: '8px', border: '1px solid var(--border-color, #ccc)', alignSelf: 'flex-start' }}>
                        <h3 style={{ marginTop: 0 }}>{t.summaryTitle}</h3>
                        <p style={{ color: 'var(--text-color, #666)' }}>{t.itemCount} {cartItems.length}</p>
                        
                        <div style={{ fontSize: '1.2rem', margin: '15px 0', borderTop: '1px solid var(--border-color, #eee)', paddingTop: '15px' }}>
                            {t.subtotal} {formatPrice(initialTotal)}
                        </div>

                        <div style={{ marginTop: '25px', backgroundColor: 'var(--bg-color, #f8fafc)', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.promoQuestion}</label>
                            
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
                                        {t.apply}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2f1', padding: '10px', borderRadius: '6px' }}>
                                    <div>
                                        <strong style={{ letterSpacing: '1px', color: '#00796b' }}>{appliedPromotion.code}</strong>
                                        <span style={{ fontSize: '0.85rem', color: '#00796b', marginLeft: '10px' }}>(-{appliedPromotion.rate}%)</span>
                                    </div>
                                    <button onClick={removePromoCode} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>{t.remove}</button>
                                </div>
                            )}

                            {promoError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', margin: '8px 0 0 0' }}>❌ {promoError}</p>}
                            {promoSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem', marginTop: '8px', margin: '8px 0 0 0' }}>✅ {promoSuccess}</p>}
                        </div>

                        <div style={{ marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {t.totalPay} {formatPrice(finalTotal)}
                        </div>
                        {appliedPromotion && (
                            <div style={{ fontSize: '0.9rem', color: '#10b981', fontStyle: 'italic' }}>
                                ({t.youSave} {formatPrice(discountAmount)})
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