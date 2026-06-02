import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

const translations = {
    fr: {
        loading: "Chargement...", title: "Mes Avis Laissés", empty: "Vous n'avez pas encore rédigé d'avis.",
        onDate: "Le", rating: "Note :", stars: "étoiles", save: "Enregistrer", cancel: "Annuler",
        edit: "Modifier", delete: "Supprimer",
        confirmDelete: "Supprimer définitivement cet avis ?", deleted: "Avis supprimé.",
        emptyComment: "Le commentaire ne peut pas être vide.", updated: "Avis modifié !"
    },
    en: {
        loading: "Loading...", title: "My Reviews", empty: "You haven't written any reviews yet.",
        onDate: "On", rating: "Rating:", stars: "stars", save: "Save", cancel: "Cancel",
        edit: "Edit", delete: "Remove",
        confirmDelete: "Permanently delete this review?", deleted: "Review deleted.",
        emptyComment: "Comment cannot be empty.", updated: "Review updated!"
    }
};

function MyReviews() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const userId = localStorage.getItem('userId');
    const [editingItemId, setEditingItemId] = useState(null); 
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
            .catch(error => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUserReviews();
    }, [userId]);

    const handleDeleteReview = (idItem) => {
        if (window.confirm(t.confirmDelete)) {
            fetch(`http://localhost:3001/reviews/user/${userId}/item/${idItem}`, { method: 'DELETE' })
                .then(res => res.json())
                .then(() => {
                    alert(t.deleted);
                    setReviews(reviews.filter(r => r.idItem !== idItem));
                })
                .catch(error => console.error(error));
        }
    };

    const startEditing = (review) => {
        setEditingItemId(review.idItem);
        setEditForm({ rating: review.rating, comment: review.comment });
    };

    const handleUpdateReview = (e, idItem) => {
        e.preventDefault();
        
        if (!editForm.comment.trim()) {
            alert(t.emptyComment);
            return;
        }

        fetch(`http://localhost:3001/reviews/user/${userId}/item/${idItem}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
        .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { 
                        throw new Error(data.error || 'Erreur serveur'); 
                    });
                }
                return response.json();
            })
        .then(data => {  
            alert(t.updated);
            setEditingItemId(null);
            fetchUserReviews(); 
        })
        .catch(error => alert(error.message));
    };

    if (loading) return <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}><Header /><p style={{textAlign:'center', marginTop:'50px'}}>{t.loading}</p></div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container cart-summary-container" style={{ maxWidth: '900px' }}>
                <h1 className="cart-summary-title">{t.title}</h1>
                
                {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-color)' }}>{t.empty}</p>
                ) : (
                    <div>
                        {reviews.map((review) => (
                            <div key={review.idItem} className="cart-summary-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '15px', padding: '20px', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                                    <strong style={{ color: '#48A3AE', fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => history.push(`/detail/${review.idItem}`)}>
                                        {review.articleName}
                                    </strong>
                                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                        {t.onDate} {new Date(review.publishDate).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                    </span>
                                </div>

                                {editingItemId === review.idItem ? (
                                    <form onSubmit={(e) => handleUpdateReview(e, review.idItem)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <label style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>{t.rating}</label>
                                            <select 
                                                value={editForm.rating} 
                                                onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                                                style={{ padding: '5px', borderRadius: '4px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                                            >
                                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} {t.stars}</option>)}
                                            </select>
                                        </div>
                                        <textarea 
                                            value={editForm.comment} 
                                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                            rows="3"
                                            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
                                            required
                                        />
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>{t.save}</button>
                                            <button type="button" onClick={() => setEditingItemId(null)} style={{ backgroundColor: '#94a3b8', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer' }}>{t.cancel}</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <div style={{ color: '#eab308', marginBottom: '8px' }}>
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                        <p style={{ margin: 0, color: 'var(--text-color)', fontStyle: 'italic' }}>"{review.comment}"</p>
                                        
                                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                            <button 
                                                onClick={() => startEditing(review)} 
                                                style={{ background: 'none', border: 'none', color: '#48A3AE', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                            >
                                                {t.edit}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteReview(review.idItem)} 
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
                                            >
                                                {t.delete}
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