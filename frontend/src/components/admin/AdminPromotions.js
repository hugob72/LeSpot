import { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css";

function AdminPromotions() {
    const [promotionsList, setPromotionsList] = useState([]);
    const history = useHistory();

    const fetchPromotions = () => {
        fetch('http://localhost:3001/promotions')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) setPromotionsList(data);
            })
            .catch(error => console.error('Erreur récupération des promotions :', error));
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    function navigateToAddPromotion() {
        history.push('/admin/add-promotion');
    }

    function navigateToModifyPromotion(id) {
        history.push('/admin/add-promotion/' + id);
    }

    // Activer / Désactiver la mise en avant en un clic
    function toggleFeatured(id, currentStatus) {
        const newStatus = !currentStatus;
        fetch(`http://localhost:3001/promotions/${id}/featured`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured: newStatus })
        })
        .then(response => {
            if (response.ok) {
                // Mise à jour immédiate de l'état local
                setPromotionsList(promotionsList.map(promo => 
                    promo.idSale === id ? { ...promo, isFeatured: newStatus ? 1 : 0 } : promo
                ));
            }
        })
        .catch(error => console.error('Erreur mise en avant :', error));
    }

    function deletePromotion(id) {
        if (window.confirm("Supprimer définitivement cette promotion ?")) {
            fetch(`http://localhost:3001/promotions/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(() => {
                alert("Promotion supprimée avec succès.");
                setPromotionsList(promotionsList.filter(promo => promo.idSale !== id));
            })
            .catch(error => console.error('Erreur lors de la suppression : ', error));
        }
    }

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion des Promotions & Codes Réduction</h3>
                <button className="admin-btn-add" onClick={navigateToAddPromotion}>Créer une promotion</button>
            </div>
            
            <div className="table-responsive">
                {promotionsList.length === 0 ? (
                    <div className="admin-no-results">
                        <p>Aucune promotion créée pour le moment.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Réduction</th>
                                <th>Description / Conditions</th>
                                <th>Validité</th>
                                <th>Mise en avant</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotionsList.map((promo) => {
                                const isActive = new Date() >= new Date(promo.dateDebut) && new Date() <= new Date(promo.dateFin);
                                return (
                                    <tr key={promo.idSale}>
                                        <td className="admin-table-name" style={{ color: '#ef4444', letterSpacing: '1px' }}>
                                            {promo.code}
                                        </td>
                                        <td style={{ fontWeight: 'bold' }}>-{Number(promo.rate).toFixed(0)}%</td>
                                        <td>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{promo.description || '-'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>{promo.conditions ? `Conditions : ${promo.conditions}` : ''}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>Du {formatDate(promo.dateDebut)}</div>
                                            <div style={{ fontSize: '0.85rem' }}>Au {formatDate(promo.dateFin)}</div>
                                            <span className={`stock-badge ${isActive ? 'in-stock' : 'out-of-stock'}`} style={{ fontSize: '0.75rem', marginTop: '5px', display: 'inline-block' }}>
                                                {isActive ? 'Active' : 'Inactive / Expirée'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => toggleFeatured(promo.idSale, promo.isFeatured === 1)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
                                                title={promo.isFeatured === 1 ? "Retirer de la page d'accueil" : "Mettre en avant sur le site"}
                                            >
                                                {promo.isFeatured === 1 ? "⭐" : "☆"}
                                            </button>
                                        </td>
                                        <td>
                                            <button className="action-btn edit-btn" onClick={() => navigateToModifyPromotion(promo.idSale)}>✏️</button>
                                            <button className="action-btn delete-btn" onClick={() => deletePromotion(promo.idSale)}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminPromotions;