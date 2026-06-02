import { useEffect, useState, useContext } from "react";
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider'; 
import "../../styles/adminStock.css"

// Taux et symboles pour la conversion
const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        title: "Gestion du stock",
        addArticle: "Ajouter un article",
        image: "Image",
        name: "Nom",
        description: "Description",
        price: "Prix", // Retrait de la mention (EUR) fixe
        onSale: "En Promo",
        quantity: "Quantité",
        action: "Action",
        yesPromo: "Oui",
        noPromo: "Non",
        successDelete: "Suppression effectuée en BDD",
        errorDelete: "Erreur lors de la suppression de l'article :"
    },
    en: {
        title: "Stock Management",
        addArticle: "Add an item",
        image: "Image",
        name: "Name",
        description: "Description",
        price: "Price",
        onSale: "On Sale",
        quantity: "Quantity",
        action: "Action",
        yesPromo: "Yes",
        noPromo: "No",
        successDelete: "Deleted successfully from DB",
        errorDelete: "Error deleting item:"
    }
};

function AdminStock() {
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [itemsList, setItemsList] = useState([]);
    const history = useHistory();

    // Fonction de formatage de la devise
    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)}`;
    };

    useEffect(() => {
        fetch('http://localhost:3001/article/all')
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
        if (!window.confirm(language === 'fr' ? "Êtes-vous sûr de vouloir supprimer cet article ?" : "Are you sure you want to delete this item?")) {
            return;
        }

        fetch(`http://localhost:3001/article/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        .then(response => response.json())
        .then(data => {
            console.log(t.successDelete);
            setItemsList(itemsList.filter(item => item.idItem !== id));
        })
        .catch(error => {
            console.error(`${t.errorDelete} `, error);
        })
    }

    return (
        <div>
            <div className="admin-table-header">
                <h3>{t.title}</h3>
                <button className="admin-btn-add" onClick={() => navigateToAddArticle()}>
                    {t.addArticle}
                </button>
            </div>
            
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{t.image}</th>
                            <th>{t.name}</th>
                            <th>{t.description}</th>
                            {/* Affichage dynamique du symbole de la devise dans l'en-tête */}
                            <th>{t.price} ({symbols[currency]})</th>
                            <th>{t.onSale}</th> 
                            <th>{t.quantity}</th>
                            <th>{t.action}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsList.map((article) => (
                            <tr key={article.idItem}>
                                <td><img src={article.image} alt={article.name} className="admin-table-img" /></td>
                                <td className="admin-table-name">{article.name}</td>
                                <td className="admin-table-desc">{article.description}</td>
                                
                                {/* Application de la conversion ici avec le symbole */}
                                <td>{formatPrice(article.price)} {symbols[currency]}</td>
                                
                                <td style={{ textAlign: 'center' }}>
                                    {article.onSale === 1 || article.onSale === true ? (
                                        <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                            {t.yesPromo}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                            {t.noPromo}
                                        </span>
                                    )}
                                </td>

                                <td>
                                    <span className={`stock-badge ${article.amount > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {article.amount}
                                    </span>
                                </td>
                                <td>
                                    <button className="action-btn edit-btn" onClick={() => navigateToModifyArticle(article.idItem)} title="Modifier">✏️</button>
                                    <button className="action-btn delete-btn" onClick={() => deleteArticle(article.idItem)} title="Supprimer">🗑️</button>
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