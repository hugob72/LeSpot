import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/createComplaint.css';
import '../../styles/home.css';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function CreateComplaint() {
    const history = useHistory();
    const query = useQuery();
    const initialOrderId = query.get('orderId');
    
    const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
    const [orders, setOrders] = useState([]);
    const [type, setType] = useState(''); // Nouvel état pour le type
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
        } else {
            fetch(`http://localhost:3001/order/user/${userId}`)
                .then(res => res.json())
                .then(data => setOrders(data))
                .catch(err => console.error('Erreur récupération commandes:', err));
        }
    }, [userId, history]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedOrderId) {
            alert('Veuillez sélectionner une commande associée à cette réclamation.');
            return;
        }
        if (!type) {
            alert('Veuillez sélectionner un type de problème.');
            return;
        }

        fetch('http://localhost:3001/complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: userId, idOrder: selectedOrderId, type, topic, description }) // Envoi du type
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Réclamation créée avec succès.');
                history.push('/complaints'); // Ou la route vers la liste de ses réclamations
            }
        })
        .catch(err => console.error('Erreur:', err));
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <div className="home">
            <Header />
            <div className="container create-complaint-container">
                <h1>Créer une réclamation</h1>
                <form className="complaint-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Commande concernée :</label>
                        <select 
                            value={selectedOrderId} 
                            onChange={(e) => setSelectedOrderId(e.target.value)} 
                            required
                            className="complaint-input"
                        >
                            <option value="">Sélectionnez une commande...</option>
                            {orders.map(order => (
                                <option key={order.idOrder} value={order.idOrder}>
                                    Commande n°{order.idOrder} du {new Date(order.date).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* NOUVEAU CHAMP : Type de réclamation */}
                    <div className="form-group">
                        <label>Type de problème :</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            required
                            className="complaint-input"
                        >
                            <option value="">Sélectionnez un motif...</option>
                            <option value="livraison">Problème de livraison / Colis non reçu</option>
                            <option value="produit_defectueux">Produit défectueux ou abîmé</option>
                            <option value="erreur_commande">Erreur d'article ou de taille</option>
                            <option value="remboursement">Demande de retour / Remboursement</option>
                            <option value="autre">Autre demande</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Sujet :</label>
                        <input 
                            type="text" 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)} 
                            required 
                            className="complaint-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description détaillée :</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            rows="6"
                            className="complaint-textarea"
                        />
                    </div>
                    <div className="complaint-buttons">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>Annuler</button>
                        <button type="submit" className="btn-submit">Envoyer la réclamation</button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
export default CreateComplaint;