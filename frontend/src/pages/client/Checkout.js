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

    const [formData, setFormData] = useState({
        address: '',
        postalCode: '',
        city: '',
        country: '',
        paymentPreference: 'Carte bancaire'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            // User is not logged in, just stop loading and let them fill the form
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
                console.error('Erreur lors de la récupération des informations utilisateur', err);
                setLoading(false);
            });
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePayment = (e) => {
        e.preventDefault();
        
        if (!userId) {
            alert('Vous devez être connecté pour passer une commande.');
            history.push('/login');
            return;
        }

        const orderData = {
            idUser: userId,
            cartItems: cartItems
        };

        fetch('http://localhost:3001/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        })
        .then(res => {
            if (!res.ok) {
                throw new Error('Erreur lors de la création de la commande');
            }
            return res.json();
        })
        .then(data => {
            alert('Paiement validé avec succès ! Merci pour votre achat.');
            setCartItems([]); // Empty the cart
            history.push('/orders'); // Redirect to My Orders
        })
        .catch(err => {
            console.error(err);
            alert('Une erreur est survenue lors de la validation de la commande.');
        });
    };

    const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (loading) {
        return <div className="checkout-loading">Chargement de vos informations...</div>;
    }

    return (
        <div className="home">
            <Header />
            <div className="container checkout-container">
                <h1 className="checkout-title">Paiement</h1>
                
                <div className="checkout-summary">
                    <h3>Résumé de la commande</h3>
                    <p>Nombre d'articles : {cartItems.length}</p>
                    <p className="checkout-total">Total à payer : {total.toFixed(2)} €</p>
                </div>

                <form onSubmit={handlePayment} className="checkout-form">
                    <div className="checkout-form-group">
                        <label className="checkout-label">Adresse de livraison :</label>
                        <input 
                            type="text" 
                            name="address" 
                            value={formData.address} 
                            onChange={handleInputChange} 
                            required 
                            className="checkout-input"
                        />
                    </div>
                    
                    <div className="checkout-form-row">
                        <div className="checkout-form-col">
                            <label className="checkout-label">Code postal :</label>
                            <input 
                                type="text" 
                                name="postalCode" 
                                value={formData.postalCode} 
                                onChange={handleInputChange} 
                                required 
                                className="checkout-input"
                            />
                        </div>
                        <div className="checkout-form-col">
                            <label className="checkout-label">Ville :</label>
                            <input 
                                type="text" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                                required 
                                className="checkout-input"
                            />
                        </div>
                    </div>

                    <div className="checkout-form-group">
                        <label className="checkout-label">Pays :</label>
                        <input 
                            type="text" 
                            name="country" 
                            value={formData.country} 
                            onChange={handleInputChange} 
                            required 
                            className="checkout-input"
                        />
                    </div>

                    <div className="checkout-form-group">
                        <label className="checkout-label">Méthode de paiement :</label>
                        <select 
                            name="paymentPreference" 
                            value={formData.paymentPreference} 
                            onChange={handleInputChange} 
                            required
                            className="checkout-input"
                        >
                            <option value="Carte bancaire">Carte bancaire</option>
                            <option value="Paypal">Paypal</option>
                            <option value="Virement">Virement</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        className="checkout-submit-btn"
                    >
                        Valider et Payer
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
}

export default Checkout;