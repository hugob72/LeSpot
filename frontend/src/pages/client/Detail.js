import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import '../../styles/Detail.css';
import '../../styles/home.css';

function Detail() {
    const { idArticle } = useParams();
    const { cartItems, setCartItems } = useContext(CartContext);
    const [article, setArticle] = useState({});
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        onSale: false
    });
    
    // Nouveaux states pour les avis
    const [reviews, setReviews] = useState([]);
    const [userId, setUserId] = useState(null);
    const [hasBought, setHasBought] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [isFavorite, setIsFavorite] = useState(false);

    const unite = {
        price: '€',
        weight: 'kg',
        maxSupportedWeight: 'kg',
        volume: 'L',
        tempMin: '°C',
        tempMax: '°C'
    }
    const mapping = {
        price: 'Prix',
        stability: 'Stabilité',
        maneuverabilité: 'Maniabilité',
        volume: 'Volume',
        weight: 'Poids',
        maxSupportedWeight: 'Poids maximum supporté',
        withLeash: 'Leash',
        size: 'Taille',
        material: 'Matière principale',
        tempMin: 'Température minimale',
        tempMax: 'Température maximale',
        isAntiUV: 'Anti UV'
    }

    useEffect(() => {
            fetch(`http://localhost:3001/article/${idArticle}`)
                .then(response => response.json())
                .then(data => {
                    setArticle(data);
                    setUpdatedItem(data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de l\'article :', error);
                });

            // Fetch reviews
            fetch(`http://localhost:3001/article/${idArticle}/reviews`)
                .then(res => res.json())
                .then(data => setReviews(data))
                .catch(err => console.error('Erreur récupération avis:', err));

            // Check if user is connected and has bought
            const storedUserId = localStorage.getItem('userId');
            if (storedUserId) {
                setUserId(storedUserId);
                fetch(`http://localhost:3001/user/${storedUserId}/hasBought/${idArticle}`)
                    .then(res => res.json())
                    .then(data => setHasBought(data.hasBought))
                    .catch(err => console.error('Erreur vérification achat:', err));
                fetch(`http://localhost:3001/favorites/check?idUser=${storedUserId}&idItem=${idArticle}`)
                .then(res => res.json())
                .then(data => setIsFavorite(data.isFavorite))
                .catch(err => console.error(err));
            }
    }, [isEditing, idArticle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedItem(prevState => ({
            ...prevState,
            [name]: value 
        }));
    };

    // NOUVEAU : Fonction pour ajouter/retirer des favoris
    const handleToggleFavorite = () => {
        if (!userId) {
            alert("Vous devez être connecté pour gérer vos favoris !");
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
            alert(data.message); // Confirmation visuelle via boîte de dialogue
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
        alert('Article ajouté au panier !');
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpdateItem = async () => {
        let finalImageUrl = updatedItem.image;

        // 1. If a new image was selected, upload it first
        if (image) {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('articleId', idArticle);

            try {
                const uploadResponse = await fetch('http://localhost:3001/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadResponse.json();
                // Assume server returns { imageUrl: "path/to/img.jpg" }
                finalImageUrl = uploadData.imageUrl || uploadData.image; 
            } catch (error) {
                console.error('Erreur upload image:', error);
            }
        }

        // 2. Update the product with the new data and the (possibly new) image URL
        const itemToSave = { ...updatedItem, image: finalImageUrl };

        fetch(`http://localhost:3001/article/${idArticle}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemToSave)
        })
            .then(response => response.json())
            .then(data => {
                setArticle(data);
                setIsEditing(false);
                setImage(null); // Clear the file selection state
            })
            .catch(error => {
                console.error('Erreur mise à jour article:', error);
            });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('articleId', idArticle);
        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                const imageUrl = data.image;
                setUpdatedItem(prevState => ({
                    ...prevState,
                    image: data.image
                }));
            })
            .catch(error => {
                console.error('Erreur lors du téléchargement de l\'image :', error);
            });
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
            if (data.error) {
                alert(data.error);
            } else {
                alert('Avis ajouté avec succès');
                setNewReview({ rating: 5, comment: '' });
                // Re-fetch reviews
                fetch(`http://localhost:3001/article/${idArticle}/reviews`)
                    .then(res => res.json())
                    .then(data => setReviews(data));
            }
        })
        .catch(err => console.error('Erreur lors de l\'ajout de l\'avis:', err));
    };

    return (
    <div className="home">
        <Header />
        <main className="main-section">
            <div className="product-card">
                <div className="product-image-section">
                    <img src={article.image} alt={article.name} className="detail-image"/>
                </div>

                <div className="product-info-section">
                        
                    <h1 className="product-title">{article.name}</h1>

                    <p className="product-description">{article.description}</p>

                    <div className='price'>
                        <p className="product-price">{article.price}€</p>
                        <div className='product-button-action'>
                            <button onClick={handleAddToCart}>Ajouter au panier</button>
                            <button onClick={handleToggleFavorite}style={{ backgroundColor: isFavorite ? '#ef4444' : '#94a3b8', color: 'white' }}>
                                {isFavorite ? '❤️ En favori' : '🤍 Favori'}
                            </button>
                        </div>
                    </div>

                    <div className='product-specifications table-responsive'>
                        <table className="admin-table">

                            <tbody>
                                {Object.entries(article).map(([key, value]) => (
                                    (mapping[key] && value !== null && value !== undefined) && (
                                        <tr key={key}>
                                            <td>{mapping[key]}</td>
                                            <td>{value} {unite[key]}</td>
                                        </tr>
                                    )
                                ))}
                            </tbody>

                        </table>
                    </div>
         
                </div>
            </div>

            <div className="reviews-section">
                <h2>Avis des clients</h2>
                
                {hasBought && (
                    <form className="add-review-form" onSubmit={handleAddReview}>
                        <h3>Ajouter un avis</h3>
                        <div className="form-group">
                            <label>Note :</label>
                            <select 
                                value={newReview.rating} 
                                onChange={(e) => setNewReview({...newReview, rating: parseInt(e.target.value)})}
                            >
                                {[5, 4, 3, 2, 1].map(num => (
                                    <option key={num} value={num}>{num} étoiles</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Commentaire :</label>
                            <textarea 
                                value={newReview.comment} 
                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})} 
                                required 
                                rows="4"
                            />
                        </div>
                        <button type="submit" className="button btn-save">Publier l'avis</button>
                    </form>
                )}
                
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="review-item">
                                <div className="review-header">
                                    <span className="review-author">{review.firstName} {review.lastName}</span>
                                    <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <span className="review-date">{new Date(review.publishDate).toLocaleDateString()}</span>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">Aucun avis pour cet article pour le moment.</p>
                    )}
                </div>
            </div>
        </main>
        <Footer />
    </div>
        
    );
}
export default Detail;