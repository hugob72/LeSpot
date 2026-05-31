import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

function CartSummary() {
    const { cartItems, setCartItems } = useContext(CartContext);
    const history = useHistory();

    const updateQuantity = (idItem, value) => {
        if (value === '') {
            setCartItems(cartItems.map(item => 
                item.idItem === idItem ? { ...item, quantity: '' } : item
            ));
            return;
        }
        
        const newQuantity = parseInt(value, 10);
        if (!isNaN(newQuantity) && newQuantity >= 0) {
            setCartItems(cartItems.map(item => 
                item.idItem === idItem ? { ...item, quantity: newQuantity } : item
            ));
        }
    };

    const handleBlur = (idItem, quantity) => {
        if (quantity === '' || quantity <= 0) {
            removeItem(idItem);
        }
    };

    const removeItem = (idItem) => {
        setCartItems(cartItems.filter(item => item.idItem !== idItem));
    };

    const total = cartItems.reduce((acc, item) => acc + item.price * (parseInt(item.quantity) || 0), 0);

    return (
        <div className="home">
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">Récapitulatif de votre panier</h1>
                
                {cartItems.length === 0 ? (
                    <p>Votre panier est vide.</p>
                ) : (
                    <div>
                        {cartItems.map((item, index) => (
                            <div key={index} className="cart-summary-item">
                                <div className="cart-summary-item-info">
                                    <img src={item.image} alt={item.name} className="cart-summary-item-img" />
                                    <div>
                                        <h3>{item.name}</h3>
                                        <p>{item.price} €</p>
                                    </div>
                                </div>
                                <div className="cart-summary-item-controls">
                                    <div>
                                        <label className="cart-summary-label">Quantité: </label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={item.quantity} 
                                            onChange={(e) => updateQuantity(item.idItem, e.target.value)}
                                            onBlur={() => handleBlur(item.idItem, item.quantity)}
                                            className="cart-summary-input"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeItem(item.idItem)}
                                        className="cart-summary-delete-btn"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        <div className="cart-summary-total-section">
                            <h2>Total : {total.toFixed(2)} €</h2>
                            <button 
                                onClick={() => history.push('/checkout')}
                                className="cart-summary-pay-btn"
                            >
                                Payer
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