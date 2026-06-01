import { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css"

function AdminCommandes() {
    // Liste originale et liste filtrée
    const [ordersList, setOrdersList] = useState([]);
    const [displayedOrders, setDisplayedOrders] = useState([]);
    
    // États pour les filtres
    const [searchId, setSearchId] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    
    const history = useHistory();

    useEffect(() => {
        fetch('http://localhost:3001/order')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setOrdersList(data);
                    setDisplayedOrders(data);
                } else {
                    setOrdersList([]);
                    setDisplayedOrders([]);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des commandes :', error);
            });
    }, []);

    // Logique de filtrage dynamique
    useEffect(() => {
        let filtered = ordersList.filter(order => {
            // Filtre par Numéro de commande
            const matchId = searchId === '' || order.idOrder.toString().includes(searchId);
            
            // Filtre par Statut
            const matchStatus = filterStatus === '' || order.currentStatus === filterStatus;
            
            // Filtre par Date (On compare le format YYYY-MM-DD)
            // L'input type="date" renvoie "YYYY-MM-DD". On coupe donc la date de la BDD pour la comparer.
            const orderDateStr = order.date ? new Date(order.date).toISOString().split('T')[0] : '';
            const matchDate = filterDate === '' || orderDateStr === filterDate;

            return matchId && matchStatus && matchDate;
        });

        setDisplayedOrders(filtered);
    }, [searchId, filterStatus, filterDate, ordersList]);

    // Fonction de réinitialisation
    const resetFilters = (e) => {
        e.preventDefault();
        setSearchId('');
        setFilterStatus('');
        setFilterDate('');
    };

    function navigateToInformationsCommande(id) {
        history.push('/admin/commandes/' + id);
    }

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatStatus = (status) => {
        const statusMap = {
            'en_attente': 'En attente',
            'payee': 'Payée',
            'preparation': 'En préparation',
            'expediee': 'Expédiée',
            'livree': 'Livrée',
            'annulee': 'Annulée'
        };
        return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'livree': return 'in-stock';
            case 'annulee': return 'out-of-stock';
            case 'payee': return 'in-stock'; 
            default: return '';
        }
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion des commandes</h3>
            </div>
            
            {/* BARRE DE FILTRES */}
            <div className="admin-filters-bar">
                <div className="admin-filter-group">
                    <label>Numéro :</label>
                    <input 
                        type="text" 
                        placeholder="Ex: 12" 
                        value={searchId} 
                        onChange={(e) => setSearchId(e.target.value)} 
                        className="admin-filter-input"
                    />
                </div>

                <div className="admin-filter-group">
                    <label>Statut :</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)} 
                        className="admin-filter-input"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="payee">Payée</option>
                        <option value="preparation">En préparation</option>
                        <option value="expediee">Expédiée</option>
                        <option value="livree">Livrée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>

                <div className="admin-filter-group">
                    <label>Date :</label>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        className="admin-filter-input"
                    />
                </div>

                <button className="admin-btn-reset" onClick={resetFilters}>Réinitialiser</button>
            </div>
            
            {/* TABLEAU DES RÉSULTATS */}
            <div className="table-responsive">
                {displayedOrders.length === 0 ? (
                    <div className="admin-no-results">
                        <p>Aucune commande ne correspond à ces critères.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Prix Total</th>
                                <th>Date</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedOrders.map((order) => (
                                <tr key={order.idOrder}>
                                    <td>#{order.idOrder}</td>
                                    <td className="admin-table-name">{order.lastName}</td>
                                    <td>{order.firstName}</td>
                                    {/* Sécurité avec Number() avant le toFixed */}
                                    <td>{order.totalPrice ? Number(order.totalPrice).toFixed(2) : "0.00"} €</td>
                                    <td>{formatDate(order.date)}</td>
                                    <td>
                                        <span className={`stock-badge ${getStatusClass(order.currentStatus)}`}>
                                            {formatStatus(order.currentStatus)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => navigateToInformationsCommande(order.idOrder)}>👁️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminCommandes;