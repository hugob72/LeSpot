import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/complaintDetail.css';

const typeTraductions = {
    'livraison': 'Problème de livraison',
    'produit_defectueux': 'Produit défectueux',
    'erreur_commande': 'Erreur de commande',
    'remboursement': 'Demande de retour',
    'autre': 'Autre'
};

function ComplaintDetail() {
    const { id } = useParams();
    const history = useHistory();
    const [complaint, setComplaint] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }
        
        // Fetch complaint details
        fetch(`http://localhost:3001/complaint/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    console.log(data);
                    setComplaint(data);
                }
            })
            .catch(err => console.error('Erreur:', err));

        // Fetch complaint messages
        fetch(`http://localhost:3001/complaint/${id}/messages`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Erreur reçue du backend:", data);
                    setMessages([]); 
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur messages:', err);
                setMessages([]);
                setLoading(false);
            });
    }, [id, userId, history]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        fetch(`http://localhost:3001/complaint/${id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idUser: userId, message: newMessage })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                setNewMessage('');
                fetch(`http://localhost:3001/complaint/${id}/messages`)
                    .then(res => res.json())
                    .then(msgData => setMessages(msgData));
            }
        })
        .catch(err => console.error('Erreur envoi message:', err));
    };

    if (loading) return <div className="complaint-detail-loading">Chargement...</div>;
    if (!complaint) return <div className="complaint-detail-error">Réclamation introuvable.</div>;

    return (
        <div className="home">
            <Header />
            {/* Remplacement de la div classique par un wrapper dédié pleine largeur */}
            <div className="complaint-page-wrapper">
                
                <div className="complaint-detail-header">
                    <h2>Réclamation n°{complaint.idComplaint}</h2>
                    <div className={`complaint-state state-${complaint.state.replace(/\s+/g, '-').toLowerCase()}`}>
                        {complaint.state}
                    </div>
                </div>
                
                {/* Début de la grille à deux colonnes */}
                <div className="complaint-grid-layout">
                    
                    {/* Colonne de gauche : Informations */}
                    <div className="complaint-sidebar">
                        <div className="complaint-info-box">
                            <h3>{complaint.topic}</h3>
                            
                            {/* Affichage du type sous forme de badge discret ou texte fort */}
                            <p className="complaint-type-badge" style={{ color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px' }}>
                                {typeTraductions[complaint.type] || 'Non catégorisé'}
                            </p>

                            <p className="complaint-desc">{complaint.description}</p>
                            <hr className="complaint-divider" />
                            <p className="complaint-meta"><strong>Ouverte par :</strong> {complaint.firstName} {complaint.lastName}</p>
                            {complaint.idOrder && <p className="complaint-meta"><strong>Commande liée :</strong> n°{complaint.idOrder}</p>}
                        </div>
                    </div>

                    {/* Colonne de droite : Messages */}
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
                                                    <p className="message-text">{msg.content}</p>
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
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrire un message pour le support..."
                                    required
                                    rows="3"
                                    className="message-textarea"
                                ></textarea>
                                <button type="submit" className="btn-send-message">Envoyer le message</button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </div>
    );
}

export default ComplaintDetail;