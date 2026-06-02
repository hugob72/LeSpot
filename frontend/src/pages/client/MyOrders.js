import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import OrderCollapse from '../../components/client/OrderCollapse';
import '../../styles/home.css';
import '../../styles/myOrders.css';

const translations = {
    fr: { 
        loading: "Chargement de vos commandes...", 
        title: "Mes Commandes", 
        empty: "Vous n'avez passé aucune commande pour le moment.",
        searchPlaceholder: "Rechercher par n° de commande...", // NOUVEAU
        noResult: "Aucune commande ne correspond à cette recherche." // NOUVEAU
    },
    en: { 
        loading: "Loading your orders...", 
        title: "My Orders", 
        empty: "You haven't placed any orders yet.",
        searchPlaceholder: "Search by order number...", // NOUVEAU
        noResult: "No order matches this search." // NOUVEAU
    }
};

function MyOrders() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    
    // NOUVEAU : State pour la barre de recherche
    const [searchTerm, setSearchTerm] = useState('');
    
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }

        fetch(`http://localhost:3001/order/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des commandes:", err);
                setLoading(false);
            });
    }, [userId, history]);

    const toggleOrder = (idOrder) => {
        if (expandedOrder === idOrder) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(idOrder);
        }
    };

    // NOUVEAU : On filtre les commandes en fonction de la recherche
    // On convertit idOrder en string pour pouvoir utiliser la méthode .includes()
    const filteredOrders = orders.filter(order => 
        order.idOrder.toString().includes(searchTerm.trim())
    );

    if (loading) return <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}><Header /><div className="my-orders-loading">{t.loading}</div></div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container my-orders-container">
                <h1 className="my-orders-title">{t.title}</h1>

                {/* NOUVEAU : Barre de recherche (affichée seulement s'il y a des commandes ou si une recherche est en cours) */}
                {(orders.length > 0 || searchTerm !== '') && (
                    <div style={{ marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder={t.searchPlaceholder} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                padding: '10px 15px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color, #cbd5e1)',
                                fontSize: '1rem',
                                backgroundColor: 'var(--bg-color, #fff)',
                                color: 'var(--text-color, #333)'
                            }}
                        />
                    </div>
                )}

                {orders.length === 0 ? (
                    <p style={{color: 'var(--text-color)'}}>{t.empty}</p>
                ) : filteredOrders.length === 0 ? (
                    /* NOUVEAU : Message si la recherche ne donne rien */
                    <p style={{color: 'var(--text-color)'}}>{t.noResult}</p>
                ) : (
                    <div className="my-orders-list">
                        {/* NOUVEAU : On map sur filteredOrders au lieu de orders */}
                        {filteredOrders.map(order => (
                            <OrderCollapse 
                                key={order.idOrder} 
                                order={order} 
                                isExpanded={expandedOrder === order.idOrder} 
                                toggleOrder={toggleOrder} 
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
export default MyOrders;