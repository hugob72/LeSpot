import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        title: "Récapitulatif de votre panier",
        empty: "Votre panier est vide.",
        reservation: "🗓️ Réservation",
        qty: "Quantité : ",
        fixedQty: "La quantité d'une réservation est fixe",
        delete: "Supprimer",
        total: "Total :",
        pay: "Payer"
    },
    en: {
        title: "Your Cart Summary",
        empty: "Your cart is empty.",
        reservation: "🗓️ Booking",
        qty: "Quantity: ",
        fixedQty: "Booking quantity is fixed",
        delete: "Remove",
        total: "Total:",
        pay: "Checkout"
    }
};

function CartSummary() {
    const { cartItems, setCartItems } = useContext(CartContext);
    const { language, currency, theme } = useContext(PreferencesContext);
    const history = useHistory();
    const t = translations[language] || translations.fr;
    const userId = localStorage.getItem('userId');

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

    const updateQuantity = (itemIndex, value) => {
        if (value === '') {
            const newItems = [...cartItems];
            newItems[itemIndex].quantity = '';
            setCartItems(newItems);
            return;
        }
        
        const newQuantity = parseInt(value, 10);
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            const newItems = [...cartItems];
            newItems[itemIndex].quantity = newQuantity;
            setCartItems(newItems);
        }
    };

    const handleAutoDelete = (itemIndex, quantity) => {
        if (quantity === '' || quantity <= 0) {
            removeItem(itemIndex);
        }
    };

    const removeItem = (indexToRemove) => {
        setCartItems(cartItems.filter((index) => index !== indexToRemove));
    };

    const totalInEuros = cartItems.reduce((acc, item) => acc + item.price * (parseInt(item.quantity) || 0), 0);

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">{t.title}</h1>
                
                {cartItems.length === 0 ? (
                    <p>{t.empty}</p>
                ) : (
                    <div>
                        {cartItems.map((item, index) => (
                            <div key={index} className="cart-summary-item">
                                <div className="cart-summary-item-info">
                                    <img src={item.image} alt={item.name} className="cart-summary-item-img" />
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>{formatPrice(item.price)}</p>
                                        {item.isService && <span style={{fontSize:'0.8rem', backgroundColor:'#e0f2f1', padding:'3px 8px', borderRadius:'10px', color:'#00796b'}}>{t.reservation}</span>}
                                    </div>
                                </div>
                                <div className="cart-summary-item-controls">
                                    <div>
                                        <label className="cart-summary-label">{t.qty}</label>
                                        <input type="number" min="0" value={item.quantity} onChange={(e) => updateQuantity(index, e.target.value)} onBlur={() => handleAutoDelete(index, item.quantity)} className="cart-summary-input" disabled={item.isService} title={item.isService ? t.fixedQty : ""}/>
                                    </div>
                                    <button onClick={() => removeItem(index)} className="cart-summary-delete-btn">
                                        {t.delete}
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="cart-summary-total-section">
                            <h2>{t.total} {formatPrice(totalInEuros)}</h2>
                            <button 
                                onClick={() => {
                                    if (userId !== null && userId !== undefined) {
                                        history.push('/checkout')
                                    } else {
                                        alert("Vous devez être connecté pour passer une commande.");
                                    }
                                } }
                                className="cart-summary-pay-btn"
                            >
                                {t.pay}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
export default CartSummary;