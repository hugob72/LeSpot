import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/Detail.css';
import '../../styles/home.css';

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        addCart: "Ajouter au panier",
        favAdded: "❤️ En favori",
        favAdd: "🤍 Favori",
        reviewsTitle: "Avis des clients",
        addReviewTitle: "Ajouter un avis",
        ratingLabel: "Note :",
        stars: "étoiles",
        commentLabel: "Commentaire :",
        submitReview: "Publier l'avis",
        noReviews: "Aucun avis pour cet article pour le moment.",
        cartAlert: "Article ajouté au panier !",
        favAlertReq: "Vous devez être connecté pour gérer vos favoris !",
        reviewSuccess: "Avis ajouté avec succès",
        mapping: {
            price: 'Prix', stability: 'Stabilité', maneuverabilité: 'Maniabilité',
            volume: 'Volume', weight: 'Poids', maxSupportedWeight: 'Poids maximum supporté',
            withLeash: 'Leash', size: 'Taille', material: 'Matière principale',
            tempMin: 'Température minimale', tempMax: 'Température maximale', isAntiUV: 'Anti UV'
        }
    },
    en: {
        addCart: "Add to cart",
        favAdded: "❤️ In favorites",
        favAdd: "🤍 Favorite",
        reviewsTitle: "Customer Reviews",
        addReviewTitle: "Add a review",
        ratingLabel: "Rating:",
        stars: "stars",
        commentLabel: "Comment:",
        submitReview: "Submit review",
        noReviews: "No reviews for this item yet.",
        cartAlert: "Item added to cart!",
        favAlertReq: "You must be logged in to manage your favorites!",
        reviewSuccess: "Review successfully added",
        mapping: {
            price: 'Price', stability: 'Stability', maneuverabilité: 'Maneuverability',
            volume: 'Volume', weight: 'Weight', maxSupportedWeight: 'Max supported weight',
            withLeash: 'Leash', size: 'Size', material: 'Main material',
            tempMin: 'Minimum temperature', tempMax: 'Maximum temperature', isAntiUV: 'Anti-UV'
        }
    }
};

function Detail() {
    const { language, currency, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const { idArticle } = useParams();
    const { cartItems, setCartItems } = useContext(CartContext);
    const [article, setArticle] = useState({});
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({
        name: '', price: 0, description: '', image: '', onSale: false
    });
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null);
    const [hasBought, setHasBought] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isFavorite, setIsFavorite] = useState(false);

    const unite = {
        weight: 'kg', maxSupportedWeight: 'kg', volume: 'L', tempMin: '°C', tempMax: '°C'
    };

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

    useEffect(() => {
        fetch(`http://localhost:3001/article/${idArticle}`)
            .then(response => response.json())
            .then(data => {
                setArticle(data);
                setUpdatedItem(data);
            })
            .catch(error => alert('Erreur lors de la récupération de l\'article :', error));

        fetch(`http://localhost:3001/article/${idArticle}/reviews`)
            .then(res => res.json())
            .then(data => setReviews(data))
            .catch(error => alert('Erreur récupération avis:', error));

        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId);
            fetch(`http://localhost:3001/user/${storedUserId}/hasBought/${idArticle}`)
                .then(res => res.json())
                .then(data => setHasBought(data.hasBought))
                .catch(error => alert('Erreur vérification achat:', error));
                
            fetch(`http://localhost:3001/favorites/check?idUser=${storedUserId}&idItem=${idArticle}`)
                .then(res => res.json())
                .then(data => setIsFavorite(data.isFavorite))
                .catch(error => console.error(error));
        }
    }, [isEditing, idArticle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedItem(prevState => ({ ...prevState, [name]: value }));
    };

    const handleToggleFavorite = () => {
        if (!userId) {
            alert(t.favAlertReq);
            return;
        }

        fetch('http://localhost:3001/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: userId, idItem: article.idItem })
        })
        .then(res => res.json())
        .then(data => {
            setIsFavorite(data.action === 'added');
        })
        .catch(err => console.error(err));
    };

    const handleAddToCart = () => {
        const existingItem = cartItems.find(item => item.idItem === article.idItem);
        if (existingItem) {
            setCartItems(cartItems.map(item => item.idItem === article.idItem ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCartItems([...cartItems, {...article, quantity: 1}]);
        }
        alert(t.cartAlert);
    };

    const handleAddReview = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3001/article/${idArticle}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: userId, rating: newReview.rating, comment: newReview.comment })
        })
        .then(res => res.json())
        .then(data => {
            alert(t.reviewSuccess);
            setNewReview({ rating: 5, comment: '' });
            fetch(`http://localhost:3001/article/${idArticle}/reviews`)
                .then(res => res.json())
                .then(data => setReviews(data));
        })
        .catch(error => console.error('Erreur lors de l\'ajout de l\'avis:', error));
    };

    return (
    <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <Header />
        <main className="main-section">
            <div className="product-card" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                <div className="product-image-section">
                    <img src={article.image} alt={article.name} className="detail-image"/>
                </div>

                <div className="product-info-section">
                    <h1 className="product-title" style={{color: 'var(--text-color)'}}>{article.name}</h1>
                    <p className="product-description" style={{color: 'var(--text-color)'}}>{article.description}</p>

                    <div className='price'>
                        <p className="product-price">{article.price ? formatPrice(article.price) : ''}</p>
                        <div className='product-button-action'>
                            <button onClick={handleAddToCart}>{t.addCart}</button>
                            <button onClick={handleToggleFavorite} style={{ backgroundColor: isFavorite ? '#ef4444' : '#94a3b8', color: 'white' }}>
                                {isFavorite ? t.favAdded : t.favAdd}
                            </button>
                        </div>
                    </div>

                    <div className='product-specifications table-responsive'>
                        <table className="admin-table">
                            <tbody>
                                {Object.entries(article).map(([key, value]) => (
                                    (t.mapping[key] && value !== null && value !== undefined) && (
                                        <tr key={key}>
                                            <td style={{color: 'var(--text-color)'}}>{t.mapping[key]}</td>
                                            <td style={{color: 'var(--text-color)'}}>
                                                {key === 'price' ? formatPrice(value) : `${value} ${unite[key] || ''}`}
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="reviews-section" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                <h2 style={{color: 'var(--text-color)'}}>{t.reviewsTitle}</h2>
                
                {hasBought && (
                    <form className="add-review-form" onSubmit={handleAddReview}>
                        <h3 style={{color: 'var(--text-color)'}}>{t.addReviewTitle}</h3>
                        <div className="form-group">
                            <label style={{color: 'var(--text-color)'}}>{t.ratingLabel}</label>
                            <select value={newReview.rating} onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})} style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}>
                                {[5, 4, 3, 2, 1].map(num => (
                                    <option key={num} value={num}>{num} {t.stars}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label style={{color: 'var(--text-color)'}}>{t.commentLabel}</label>
                            <textarea value={newReview.comment} onChange={(e) => setNewReview({...newReview, comment: e.target.value})} required rows="4" style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}/>
                        </div>
                        <button type="submit" className="button btn-save">{t.submitReview}</button>
                    </form>
                )}
                
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="review-item" style={{borderColor: 'var(--border-color)'}}>
                                <div className="review-header">
                                    <span className="review-author" style={{color: 'var(--text-color)'}}>{review.firstName} {review.lastName}</span>
                                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                                </div>
                                <p className="review-comment" style={{color: 'var(--text-color)'}}>{review.comment}</p>
                                <span className="review-date" style={{color: 'var(--text-color)'}}>{new Date(review.publishDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews" style={{color: 'var(--text-color)'}}>{t.noReviews}</p>
                    )}
                </div>
            </div>
        </main>
        <Footer />
    </div>
    );
}
export default Detail;