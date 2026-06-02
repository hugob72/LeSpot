import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

function MyFavorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, setCartItems } = useContext(CartContext);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    const fetchFavorites = () => {
        if (!userId) {
            history.push('/login');
            return;
        }
        fetch(`http://localhost:3001/favorites/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setFavorites(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchFavorites();
    }, [userId]);

    const handleRemoveFavorite = (fav) => {
        fetch('http://localhost:3001/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idUser: userId,
                idItem: fav.type === 'article' ? fav.id : null,
                idTypeService: fav.type === 'service' ? fav.id : null
            })
        })
        .then(() => {
            // Suppression en temps réel du state local
            setFavorites(favorites.filter(f => f.idFavorite !== fav.idFavorite));
        })
        .catch(err => console.error(err));
    };

    const handleAddToCart = (fav) => {
        if (fav.type === 'service') {
            // Un cours nécessite de choisir un créneau sur le calendrier
            history.push(`/service/${fav.id}`);
            return;
        }

        // Si c'est un produit physique
        const existingItem = cartItems.find(item => item.idItem === fav.id);
        if (existingItem) {
            setCartItems(cartItems.map(item => item.idItem === fav.id ? {...item, quantity: item.quantity + 1} : item));
        } else {
            const productStructure = { idItem: fav.id, name: fav.name, price: fav.price, image: fav.image, onSale: fav.onSale };
            setCartItems([...cartItems, { ...productStructure, quantity: 1 }]);
        }
        alert('Produit ajouté au panier !');
    };

    if (loading) return <div className="home"><Header /><p style={{textAlign:'center', marginTop:'50px'}}>Chargement de vos coups de cœur...</p></div>;

    return (
        <div className="home">
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">Mes Coups de Cœur ❤️</h1>
                
                {favorites.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>Votre liste de favoris est vide pour le moment. 🏄‍♂️</p>
                ) : (
                    <div>
                        {favorites.map((fav) => (
                            <div key={fav.idFavorite} className="cart-summary-item" style={{ borderLeft: fav.type === 'service' ? '5px solid #48A3AE' : '5px solid #f59e0b' }}>
                                <div className="cart-summary-item-info" style={{ cursor: 'pointer' }} onClick={() => history.push(fav.type === 'article' ? `/detail/${fav.id}` : `/service/${fav.id}`)}>
                                    <img src={fav.image} alt={fav.name} className="cart-summary-item-img" />
                                    <div>
                                        <h3>{fav.name}</h3>
                                        <p style={{ fontWeight: 'bold' }}>{Number(fav.price).toFixed(2)} €</p>
                                        <span style={{ fontSize: '0.8rem', backgroundColor: fav.type === 'service' ? '#e0f2f1' : '#fef3c7', padding: '3px 8px', borderRadius: '10px', color: fav.type === 'service' ? '#00796b' : '#d97706' }}>
                                            {fav.type === 'service' ? '🗓️ Prestation / Cours' : '🛒 Article Boutique'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="cart-summary-item-controls">
                                    <button 
                                        className="cart-summary-pay-btn" 
                                        style={{ backgroundColor: '#10b981', padding: '8px 15px', fontSize: '0.9rem' }}
                                        onClick={() => handleAddToCart(fav)}
                                    >
                                        {fav.type === 'service' ? 'Voir l\'agenda' : 'Acheter'}
                                    </button>
                                    <button 
                                        className="cart-summary-delete-btn"
                                        onClick={() => handleRemoveFavorite(fav)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default MyFavorites;