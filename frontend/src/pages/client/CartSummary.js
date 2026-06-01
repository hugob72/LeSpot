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

    const handleBlur = (itemIndex, quantity) => {
        if (quantity === '' || quantity <= 0) {
            removeItem(itemIndex);
        }
    };

    // Suppression basée sur l'index (plus sûr pour mélanger idItem et idService)
    const removeItem = (indexToRemove) => {
        setCartItems(cartItems.filter((_, index) => index !== indexToRemove));
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
                                        {/* Petit badge visuel pour différencier */}
                                        {item.isService && <span style={{fontSize:'0.8rem', backgroundColor:'#e0f2f1', padding:'3px 8px', borderRadius:'10px', color:'#00796b'}}>🗓️ Réservation</span>}
                                    </div>
                                </div>
                                <div className="cart-summary-item-controls">
                                    <div>
                                        <label className="cart-summary-label">Quantité: </label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            value={item.quantity} 
                                            onChange={(e) => updateQuantity(index, e.target.value)}
                                            onBlur={() => handleBlur(index, item.quantity)}
                                            className="cart-summary-input"
                                            disabled={item.isService} // On bloque la quantité pour les services
                                            title={item.isService ? "La quantité d'une réservation est fixe" : ""}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeItem(index)}
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