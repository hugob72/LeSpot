import { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
import "../../styles/addArticle.css";
import "../../styles/adminStock.css";

function AdminCommandeDetails() {
    const { idOrder } = useParams();
    const history = useHistory();
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("---");

    const statusOptions = [
        { id: 'en_attente', name: 'En attente' },
        { id: 'payee', name: 'Payée' },
        { id: 'preparation', name: 'En préparation' },
        { id: 'expediee', name: 'Expédiée' },
        { id: 'livree', name: 'Livrée' },
        { id: 'annulee', name: 'Annulée' }
    ];

    useEffect(() => {
        if (idOrder) {
            fetch(`http://localhost:3001/order/${idOrder}`)
                .then(response => response.json())
                .then(data => {
                    setOrder(data);
                    const currentStatusOption = statusOptions.find(opt => opt.id === data.currentStatus);
                    if (currentStatusOption) {
                        setStatus(currentStatusOption.name);
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de la commande :', error);
                });
        }
    }, [idOrder]);

    const handleStatusChange = (value) => {
        setStatus(value);
    };

    const handleSaveStatus = () => {
        // Retrieve internal status ID from name
        const selectedOption = statusOptions.find(opt => opt.name === status);
        if (!selectedOption) return;

        fetch(`http://localhost:3001/order/${idOrder}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: selectedOption.id })
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur serveur');
            
            alert("Statut de la commande modifié avec succès !");
            history.push('/admin/commandes');
        })
        .catch(error => {
            console.error('Erreur lors de la modification : ', error);
            alert('Impossible de modifier le statut : ' + error.message);
        });
    };

    if (!order) {
        return <div>Chargement...</div>;
    }

    const formatDate = (dateString) => {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div>
            <div className="flex-column" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Détails de la commande #{order.idOrder}</h1>
                    <button className="button" style={{ backgroundColor: '#ccc', color: '#333' }} onClick={() => history.push('/admin/commandes')}>Retour</button>
                </div>

                <div style={{ display: 'flex', gap: '40px', marginTop: '20px' }}>
                    <div className="flex-column" style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                        <h3>Informations Client</h3>
                        <p><strong>Nom :</strong> {order.user?.lastName}</p>
                        <p><strong>Prénom :</strong> {order.user?.firstName}</p>
                        <p><strong>Email :</strong> {order.user?.email}</p>
                        <p><strong>Téléphone :</strong> {order.user?.phoneNumber || 'Non renseigné'}</p>
                        
                        <h3 style={{ marginTop: '20px' }}>Adresse de livraison</h3>
                        <p>{order.user?.address || 'Non renseignée'}</p>
                        <p>{order.user?.postalCode} {order.user?.city}</p>
                        <p>{order.user?.country}</p>
                    </div>

                    <div className="flex-column" style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                        <h3>Informations Commande</h3>
                        <p><strong>Date :</strong> {formatDate(order.date)}</p>
                        <p><strong>Prix Total :</strong> {order.totalPrice ? order.totalPrice.toFixed(2) : 0} €</p>
                        
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ fontWeight: 'bold' }}>Changer le statut :</label>
                            <Combobox 
                                data={statusOptions.map(opt => opt.name)} 
                                value={status} 
                                onChange={handleStatusChange} 
                                className="combobox" 
                                style={{ marginTop: '10px' }}
                            />
                            <button onClick={handleSaveStatus} className="button btn-save" style={{ marginTop: '15px', width: '100%' }}>Sauvegarder le statut</button>
                        </div>
                    </div>
                </div>

                <h3 style={{ marginTop: '40px' }}>Articles commandés</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Nom</th>
                                <th>Quantité</th>
                                <th>Prix Unitaire</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td><img src={item.image} alt={item.name} className="admin-table-img" style={{ width: '80px', borderRadius: '8px' }} /></td>
                                    <td className="admin-table-name">{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unitPrice} €</td>
                                    <td>{(item.quantity * item.unitPrice).toFixed(2)} €</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminCommandeDetails;