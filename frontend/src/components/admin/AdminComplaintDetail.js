import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Combobox from "react-widgets/Combobox";
import "react-widgets/styles.css";
import '../../styles/complaintDetail.css';

const typeTraductions = {
    'livraison': 'Problème de livraison',
    'produit_defectueux': 'Produit défectueux',
    'erreur_commande': 'Erreur de commande',
    'remboursement': 'Demande de retour',
    'autre': 'Autre'
};

function AdminComplaintDetail() {
    const { idComplaint } = useParams();
    const history = useHistory();
    const [complaint, setComplaint] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [status, setStatus] = useState("---");
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    const statusOptions = [
        { id: 'ouverte', name: 'Ouverte' },
        { id: 'en_cours', name: 'En cours' },
        { id: 'resolue', name: 'Résolue' },
        { id: 'fermee', name: 'Fermée' }
    ];

    useEffect(() => {
        fetch(`http://localhost:3001/complaint/${idComplaint}`)
            .then(res => res.json())
            .then(data => {
                setComplaint(data);
                setStatus(statusOptions.find(opt => opt.id === data.state).name);
            })
            .catch(error => alert('Erreur:', error));

        fetch(`http://localhost:3001/complaint/${idComplaint}/messages`)
            .then(res => res.json())
            .then(data => {
                setMessages(data || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur messages:', error);
                setLoading(false);
            });
    }, [idComplaint]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            fetch(`http://localhost:3001/complaint/${idComplaint}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUser: userId, message: newMessage })
            })
            .then(res => res.json())
            .then(data => {
                setNewMessage('');
                fetch(`http://localhost:3001/complaint/${idComplaint}/messages`)
                    .then(res => res.json())
                    .then(msgData => setMessages(msgData));
            })
            .catch(error => console.error('Erreur envoi message:', error));  
        }
    };

    const handleStatusChange = (value) => {
        setStatus(value);
    };

    const handleSaveStatus = () => {
        const selectedOption = statusOptions.find(opt => opt.name === status);
        if (selectedOption) {
            fetch(`http://localhost:3001/complaint/${idComplaint}/state`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ state: selectedOption.id })
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => { 
                        throw new Error(data.error || 'Erreur serveur'); 
                    });
                }
                return response.json();
            })
            .then(data => {
                alert("Statut modifié avec succès !");
                setComplaint(prev => ({ ...prev, state: selectedOption.id }));
            })
            .catch(error => {alert('Impossible de modifier le statut : ' + error.message);});
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (!complaint) return <div>Réclamation introuvable.</div>;

    return (
        <div>
            <div className="flex-column" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div className="complaint-detail-header" style={{ margin: 0, padding: 0, border: 'none', background: 'transparent' }}>
                        <h2 style={{ marginBottom: 0 }}>Réclamation n°{complaint.idComplaint}</h2>
                        <div className={`complaint-state state-${complaint.state.replace(/\s+/g, '-').toLowerCase()}`}>
                            {complaint.state}
                        </div>
                    </div>
                    <button className="button" style={{ backgroundColor: '#ccc', color: '#333' }} onClick={() => history.push('/admin/litiges')}>Retour</button>
                </div>

                <div className="complaint-grid-layout" style={{ maxWidth: '100%', margin: 0 }}>
                    <div className="complaint-sidebar">
                        <div className="complaint-info-box">
                            <h3>{complaint.topic}</h3>
                            <p className="complaint-type-badge" style={{ color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px' }}>
                                {typeTraductions[complaint.type] || 'Non catégorisé'}
                            </p>
                            <p className="complaint-desc">{complaint.description}</p>
                            <hr className="complaint-divider"/>
                            <p className="complaint-meta"><strong>Ouverte par :</strong> {complaint.firstName} {complaint.lastName}</p>
                            {complaint.idOrder && <p className="complaint-meta"><strong>Commande liée :</strong> n°{complaint.idOrder}</p>}
                        </div>

                        <div className="complaint-info-box">
                            <h3>Changer le statut</h3>
                            <Combobox data={statusOptions.map(opt => opt.name)} value={status} onChange={handleStatusChange} className="combobox" style={{ marginTop: '10px' }}/>
                            <button onClick={handleSaveStatus} className="button btn-save" style={{ marginTop: '15px', width: '100%' }}>Mettre à jour</button>
                        </div>
                    </div>

                    <div className="complaint-main-content">
                        <div className="complaint-messages-section">
                            <h3>Historique des échanges</h3>
                            <div className="messages-list">
                                {messages.length === 0 ? (
                                    <p className="no-messages">Aucun message pour le moment.</p>
                                ) : (
                                    messages.map(msg => {
                                        const isCurrentUser = String(msg.idUser) === String(userId);
                                        return (
                                            <div key={msg.idMessage} className={`message-item ${isCurrentUser ? 'message-right' : 'message-left'}`}>
                                                <div className="message-content">
                                                    <p className="message-text" style={{color : isCurrentUser ? 'white' : '#333'}}>{msg.content}</p>
                                                    <span className="message-author">
                                                        {msg.firstName} {msg.lastName} {msg.role === 'admin' ? '(Admin)' : ''} - {new Date(msg.sendDate).toLocaleString('fr-FR')}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <form className="message-form" onSubmit={handleSendMessage}>
                                <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Répondre au client..." required rows="3" className="message-textarea"></textarea>
                                <button type="submit" className="btn-send-message">Envoyer le message</button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
export default AdminComplaintDetail;