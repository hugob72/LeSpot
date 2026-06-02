import { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css"

function AdminStock() {
    const [itemsList, setItemsList] = useState([]);
    const history = useHistory();

    useEffect(() => {
        fetch('http://localhost:3001/')
            .then(response => response.json())
            .then(data => {
                setItemsList(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des articles :', error);
            });
    }, [])

    function navigateToAddArticle() {
        history.push('/admin/stock/add-article');
    }

    function navigateToModifyArticle(id) {
        history.push('/admin/stock/add-article/' + id);
    }

    function deleteArticle(id) {
        fetch(`http://localhost:3001/article/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(data => {
            console.log("Suppression effectuée en BDD");
            console.log(itemsList);
            setItemsList(itemsList.filter(item => item.idItem !== id));
        })
        .catch(error => {
            console.error('Erreur lors de la suppression de l\'article : ', error);
        })
    }

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion du stock</h3>
                <button className="admin-btn-add" onClick={() => navigateToAddArticle()}>Ajouter un article</button>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Nom</th>
                            <th>Description</th>
                            <th>Prix</th>
                            <th>En Promo</th> {/* NOUVELLE COLONNE */}
                            <th>Quantité</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsList.map((article) => (
                            <tr key={article.idItem}>
                                <td><img src={article.image} alt={article.name} className="admin-table-img" /></td>
                                <td className="admin-table-name">{article.name}</td>
                                <td className="admin-table-desc">{article.description}</td>
                                <td>{article.price} €</td>
                                
                                {/* NOUVELLE CELLULE : Affichage conditionnel de la promotion */}
                                <td style={{ textAlign: 'center' }}>
                                    {article.onSale === 1 || article.onSale === true ? (
                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>🏷️ Oui</span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Non</span>
                                    )}
                                </td>

                                <td>
                                    <span className={`stock-badge ${article.amount > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {article.amount}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => navigateToModifyArticle(article.idItem)}>✏️</button>
                                    <button className="action-btn delete-btn" onClick={() => deleteArticle(article.idItem)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default AdminStock;