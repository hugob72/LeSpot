import { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css";

function AdminPromotions() {
    const [promotionsList, setPromotionsList] = useState([]);
    const history = useHistory();

    useEffect(() => {
        fetch('http://localhost:3001/promotions')
            .then(response => response.json())
            .then(data => {setPromotionsList(data);})
            .catch(error => alert('Erreur récupération des promotions :', error));
    }, []);

    function navigateToAddPromotion() {
        history.push('/admin/add-promotion');
    }

    function navigateToModifyPromotion(id) {
        history.push('/admin/add-promotion/' + id);
    }

    function toggleFeatured(id, currentStatus) {
        const newStatus = !currentStatus;
        fetch(`http://localhost:3001/promotions/${id}/featured`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isFeatured: newStatus })
        })
        .then(response => {
            if (response.ok) {
                setPromotionsList(promotionsList.map(promo => promo.idSale === id ? { ...promo, isFeatured: newStatus ? 1 : 0 } : promo));
            }
        })
        .catch(error => console.error('Erreur mise en avant :', error));
    }

    function deletePromotion(id) {
        if (window.confirm("Supprimer définitivement cette promotion ?")) {
            fetch(`http://localhost:3001/promotions/${id}`, {
                method: 'DELETE',
                headers: {'Content-Type' : 'application/json'},
            })
            .then(response => response.json())
            .then(() => {
                alert("Promotion supprimée avec succès.");
                setPromotionsList(promotionsList.filter(promo => promo.idSale !== id));
            })
            .catch(error => alert('Erreur lors de la suppression : ', error));
        }
    }

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion des Promotions</h3>
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
                                <th>Description</th>
                                <th>Validité</th>
                                <th>État</th>
                                <th>Mise en avant</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promotionsList.map((promo) => {
                                const isActive = new Date() >= new Date(promo.dateDebut) && new Date() <= new Date(promo.dateFin);
                                return (
                                    <tr key={promo.idSale}>
                                        <td className="admin-table-name">
                                            {promo.code}
                                        </td>
                                        <td>-{promo.rate}%</td>
                                        <td>
                                            <div>{promo.description || '-'}</div>
                                        </td>
                                        <td>
                                            <div>Du {formatDate(promo.dateDebut)}</div>
                                            <div>Au {formatDate(promo.dateFin)}</div>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${isActive ? 'in-stock' : 'out-of-stock'}`} style={{ fontSize: '0.75rem', marginTop: '5px'}}>
                                                {isActive ? 'Active' : 'Expirée'}
                                            </span>
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={promo.isFeatured === 1} onChange={() => toggleFeatured(promo.idSale, promo.isFeatured === 1)} style={{ width: '18px', height: '18px', cursor: 'pointer' }}/>
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