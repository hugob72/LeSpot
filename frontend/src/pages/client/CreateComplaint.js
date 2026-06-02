import React, { useState, useEffect, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/createComplaint.css';
import '../../styles/home.css';

const translations = {
    fr: {
        title: "Créer une réclamation",
        orderLabel: "Commande concernée :",
        selectOrder: "Sélectionnez une commande...",
        orderOption: "Commande n°",
        from: "du",
        typeLabel: "Type de problème :",
        selectType: "Sélectionnez un motif...",
        typeDelivery: "Problème de livraison / Colis non reçu",
        typeDefective: "Produit défectueux ou abîmé",
        typeError: "Erreur d'article ou de taille",
        typeRefund: "Demande de retour / Remboursement",
        typeOther: "Autre demande",
        topicLabel: "Sujet :",
        descLabel: "Description détaillée :",
        cancel: "Annuler",
        submit: "Envoyer la réclamation",
        alertOrder: "Veuillez sélectionner une commande associée à cette réclamation.",
        alertType: "Veuillez sélectionner un type de problème.",
        success: "Réclamation créée avec succès."
    },
    en: {
        title: "Create a Complaint",
        orderLabel: "Related Order:",
        selectOrder: "Select an order...",
        orderOption: "Order #",
        from: "from",
        typeLabel: "Issue Type:",
        selectType: "Select a reason...",
        typeDelivery: "Delivery issue / Package not received",
        typeDefective: "Defective or damaged product",
        typeError: "Wrong item or size",
        typeRefund: "Return request / Refund",
        typeOther: "Other request",
        topicLabel: "Subject:",
        descLabel: "Detailed description:",
        cancel: "Cancel",
        submit: "Submit Complaint",
        alertOrder: "Please select an order associated with this complaint.",
        alertType: "Please select an issue type.",
        success: "Complaint successfully created."
    }
};

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function CreateComplaint() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const history = useHistory();
    const query = useQuery();
    const initialOrderId = query.get('orderId');
    
    const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId || '');
    const [orders, setOrders] = useState([]);
    const [type, setType] = useState('');
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetch(`http://localhost:3001/order/user/${userId}`)
            .then(res => res.json())
            .then(data => setOrders(data))
            .catch(err => console.error('Erreur récupération commandes:', err));
    }, [userId, history]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedOrderId) {
            alert(t.alertOrder);
            return;
        }
        if (!type) {
            alert(t.alertType);
            return;
        }

        fetch('http://localhost:3001/complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: (userId !== null && userId !== undefined ? userId : '11') , idOrder: selectedOrderId, type, topic, description })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(t.success);
                history.push('/complaints'); 
            }
        })
        .catch(err => console.error('Erreur:', err));
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container create-complaint-container" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                <h1>{t.title}</h1>
                <form className="complaint-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t.orderLabel}</label>
                        <select 
                            value={selectedOrderId} 
                            onChange={(e) => setSelectedOrderId(e.target.value)} 
                            required
                            className="complaint-input"
                            style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}
                        >
                            <option value="">{t.selectOrder}</option>
                            {orders.map(order => (
                                <option key={order.idOrder} value={order.idOrder}>
                                    {t.orderOption}{order.idOrder} {t.from} {new Date(order.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                                </option>
                            ))}
                            <option>Utilisateur non connecté</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t.typeLabel}</label>
                        <select 
                            value={type} 
                            onChange={(e) => setType(e.target.value)} 
                            required
                            className="complaint-input"
                            style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}
                        >
                            <option value="">{t.selectType}</option>
                            <option value="livraison">{t.typeDelivery}</option>
                            <option value="produit_defectueux">{t.typeDefective}</option>
                            <option value="erreur_commande">{t.typeError}</option>
                            <option value="remboursement">{t.typeRefund}</option>
                            <option value="autre">{t.typeOther}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t.topicLabel}</label>
                        <input 
                            type="text" 
                            value={topic} 
                            onChange={(e) => setTopic(e.target.value)} 
                            required 
                            className="complaint-input"
                            style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t.descLabel}</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                            rows="6"
                            className="complaint-textarea"
                            style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}
                        />
                    </div>
                    <div className="complaint-buttons">
                        <button type="button" className="btn-cancel" onClick={handleCancel}>{t.cancel}</button>
                        <button type="submit" className="btn-submit">{t.submit}</button>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    );
}
export default CreateComplaint;