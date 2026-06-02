import React, { useState, useEffect, useContext } from 'react';
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
        loading: "Chargement de vos coups de cœur...", title: "Mes Coups de Cœur ❤️",
        empty: "Votre liste de favoris est vide pour le moment.",
        service: "🗓️ Prestation / Cours", article: "🛒 Article Boutique",
        seeAgenda: "Voir l'agenda", buy: "Acheter", delete: "Supprimer",
        addedCart: "Produit ajouté au panier !", loginReq: "Vous devez être connecté pour gérer vos favoris !"
    },
    en: {
        loading: "Loading your favorites...", title: "My Favorites ❤️",
        empty: "Your favorites list is empty for now.",
        service: "🗓️ Service / Class", article: "🛒 Shop Item",
        seeAgenda: "See availability", buy: "Buy", delete: "Remove",
        addedCart: "Item added to cart!", loginReq: "You must be logged in to manage your favorites!"
    }
};

function MyFavorites() {
    const { language, currency, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, setCartItems } = useContext(CartContext);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

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
            setFavorites(favorites.filter(f => f.idFavorite !== fav.idFavorite));
        })
        .catch(err => console.error(err));
    };

    const handleAddToCart = (fav) => {
        if (fav.type === 'service') {
            history.push(`/service/${fav.id}`);
            return;
        }

        const existingItem = cartItems.find(item => item.idItem === fav.id);
        if (existingItem) {
            setCartItems(cartItems.map(item => item.idItem === fav.id ? {...item, quantity: item.quantity + 1} : item));
        } else {
            const productStructure = { idItem: fav.id, name: fav.name, price: fav.price, image: fav.image, onSale: fav.onSale };
            setCartItems([...cartItems, { ...productStructure, quantity: 1 }]);
        }
        alert(t.addedCart);
    };

    if (loading) return <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}><Header /><p style={{textAlign:'center', marginTop:'50px'}}>{t.loading}</p></div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">{t.title}</h1>
                
                {favorites.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>{t.empty}</p>
                ) : (
                    <div>
                        {favorites.map((fav) => (
                            <div key={fav.idFavorite} className="cart-summary-item" style={{ borderLeft: fav.type === 'service' ? '5px solid #48A3AE' : '5px solid #f59e0b', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div className="cart-summary-item-info" style={{ cursor: 'pointer' }} onClick={() => history.push(fav.type === 'article' ? `/detail/${fav.id}` : `/service/${fav.id}`)}>
                                    <img src={fav.image} alt={fav.name} className="cart-summary-item-img" />
                                    <div>
                                        <h3 style={{color: 'var(--text-color)'}}>{fav.name}</h3>
                                        <p style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{formatPrice(fav.price)}</p>
                                        <span style={{ fontSize: '0.8rem', backgroundColor: fav.type === 'service' ? '#e0f2f1' : '#fef3c7', padding: '3px 8px', borderRadius: '10px', color: fav.type === 'service' ? '#00796b' : '#d97706' }}>
                                            {fav.type === 'service' ? t.service : t.article}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="cart-summary-item-controls">
                                    <button className="cart-summary-pay-btn" style={{ backgroundColor: '#10b981', padding: '8px 15px', fontSize: '0.9rem' }} onClick={() => handleAddToCart(fav)}>
                                        {fav.type === 'service' ? t.seeAgenda : t.buy}
                                    </button>
                                    <button className="cart-summary-delete-btn" onClick={() => handleRemoveFavorite(fav)}>
                                        {t.delete}
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