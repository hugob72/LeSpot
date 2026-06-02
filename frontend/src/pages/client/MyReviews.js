import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

function MyReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    // États pour l'édition en ligne
    const [editingItemId, setEditingItemId] = useState(null); // On se base sur l'idItem
    const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

    const fetchUserReviews = () => {
        if (!userId) {
            history.push('/login');
            return;
        }
        fetch(`http://localhost:3001/reviews/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setReviews(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUserReviews();
    }, [userId]);

    const handleDeleteReview = (idItem) => {
        if (window.confirm("Supprimer définitivement cet avis ?")) {
            fetch(`http://localhost:3001/reviews/user/${userId}/item/${idItem}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => {
                    alert("Avis supprimé.");
                    setReviews(reviews.filter(r => r.idItem !== idItem));
                })
                .catch(err => console.error(err));
        }
    };

    const startEditing = (review) => {
        setEditingItemId(review.idItem);
        setEditForm({ rating: review.rating, comment: review.comment });
    };

    const handleUpdateReview = (e, idItem) => {
        e.preventDefault();
        
        if (!editForm.comment.trim()) {
            alert("Le commentaire ne peut pas être vide.");
            return;
        }

        fetch(`http://localhost:3001/reviews/user/${userId}/item/${idItem}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
        .then(async res => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            
            alert("Avis modifié !");
            setEditingItemId(null);
            fetchUserReviews(); 
        })
        .catch(err => alert(err.message));
    };

    if (loading) return <div className="home"><Header /><p style={{textAlign:'center', marginTop:'50px'}}>Chargement...</p></div>;

    return (
        <div className="home">
            <Header />
            <div className="container cart-summary-container" style={{ maxWidth: '900px' }}>
                <h1 className="cart-summary-title">Mes Avis Laissés 💬</h1>
                
                {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>Vous n'avez pas encore rédigé d'avis.</p>
                ) : (
                    <div>
                        {reviews.map((review) => (
                            <div key={review.idItem} className="cart-summary-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                    <strong style={{ color: '#48A3AE', fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => history.push(`/detail/${review.idItem}`)}>
                                        {review.articleName}
                                    </strong>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        Le {new Date(review.publishDate).toLocaleDateString()}
                                    </span>
                                </div>

                                {editingItemId === review.idItem ? (
                                    <form onSubmit={(e) => handleUpdateReview(e, review.idItem)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ fontWeight: 'bold' }}>Note :</label>
                                            <select 
                                                value={editForm.rating} 
                                                onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                                                style={{ padding: '5px', borderRadius: '4px' }}
                                            >
                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} étoiles</option>)}
                                            </select>
                                        </div>
                                        <textarea 
                                            value={editForm.comment} 
                                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                            rows="3"
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                            required
                                        />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>Enregistrer</button>
                                            <button type="button" onClick={() => setEditingItemId(null)} style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <div style={{ color: '#eab308', marginBottom: '8px' }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                        <p style={{ margin: 0, color: '#334155', fontStyle: 'italic' }}>"{review.comment}"</p>
                                        
                                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                            <button 
                                                onClick={() => startEditing(review)} 
                                                style={{ background: 'none', border: 'none', color: '#48A3AE', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteReview(review.idItem)} 
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                            >
                                                🗑️ Supprimer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default MyReviews;