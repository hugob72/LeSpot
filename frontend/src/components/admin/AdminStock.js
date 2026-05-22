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