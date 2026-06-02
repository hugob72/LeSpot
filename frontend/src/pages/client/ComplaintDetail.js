import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/complaintDetail.css';

const translations = {
    fr: {
        loading: "Chargement...",
        notFound: "Réclamation introuvable.",
        complaintNum: "Réclamation n°",
        openedBy: "Ouverte par :",
        linkedOrder: "Commande liée :",
        history: "Historique des échanges",
        noMessages: "Aucun message pour le moment.",
        writePlaceholder: "Écrire un message pour le support...",
        sendBtn: "Envoyer le message",
        adminTag: "(Admin)",
        uncategorized: "Non catégorisé",
        types: {
            'livraison': 'Problème de livraison',
            'produit_defectueux': 'Produit défectueux',
            'erreur_commande': 'Erreur de commande',
            'remboursement': 'Demande de retour',
            'autre': 'Autre'
        }
    },
    en: {
        loading: "Loading...",
        notFound: "Complaint not found.",
        complaintNum: "Complaint #",
        openedBy: "Opened by:",
        linkedOrder: "Linked order:",
        history: "Message History",
        noMessages: "No messages yet.",
        writePlaceholder: "Write a message to support...",
        sendBtn: "Send message",
        adminTag: "(Admin)",
        uncategorized: "Uncategorized",
        types: {
            'livraison': 'Delivery issue',
            'produit_defectueux': 'Defective product',
            'erreur_commande': 'Order error',
            'remboursement': 'Return request',
            'autre': 'Other'
        }
    }
};

function ComplaintDetail() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

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
        
        fetch(`http://localhost:3001/complaint/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) alert(data.error);
                else setComplaint(data);
            })
            .catch(err => console.error(err));

        fetch(`http://localhost:3001/complaint/${id}/messages`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setMessages(data);
                else setMessages([]); 
                setLoading(false);
            })
            .catch(err => {
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
        .catch(err => console.error(err));
    };

    if (loading) return <div className="complaint-detail-loading">{t.loading}</div>;
    if (!complaint) return <div className="complaint-detail-error">{t.notFound}</div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="complaint-page-wrapper">
                
                <div className="complaint-detail-header">
                    <h2>{t.complaintNum}{complaint.idComplaint}</h2>
                    <div className={`complaint-state state-${complaint.state.replace(/\s+/g, '-').toLowerCase()}`}>
                        {complaint.state}
                    </div>
                </div>
                
                <div className="complaint-grid-layout">
                    <div className="complaint-sidebar">
                        <div className="complaint-info-box" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                            <h3>{complaint.topic}</h3>
                            
                            <p className="complaint-type-badge" style={{ color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '15px' }}>
                                {t.types[complaint.type] || t.uncategorized}
                            </p>

                            <p className="complaint-desc">{complaint.description}</p>
                            <hr className="complaint-divider" />
                            <p className="complaint-meta"><strong>{t.openedBy}</strong> {complaint.firstName} {complaint.lastName}</p>
                            {complaint.idOrder && <p className="complaint-meta"><strong>{t.linkedOrder}</strong> n°{complaint.idOrder}</p>}
                        </div>
                    </div>

                    <div className="complaint-main-content">
                        <div className="complaint-messages-section" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                            <h3>{t.history}</h3>
                            <div className="messages-list">
                                {messages.length === 0 ? (
                                    <p className="no-messages">{t.noMessages}</p>
                                ) : (
                                    messages.map(msg => {
                                        const isCurrentUser = String(msg.idUser) === String(userId);
                                        return (
                                            <div key={msg.idMessage} className={`message-item ${isCurrentUser ? 'message-right' : 'message-left'}`}>
                                                <div className="message-content">
                                                    <p className="message-text">{msg.content}</p>
                                                    <span className="message-author">
                                                        {msg.firstName} {msg.lastName} {msg.role === 'admin' ? t.adminTag : ''} - {new Date(msg.sendDate).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}
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
                                    placeholder={t.writePlaceholder}
                                    required
                                    rows="3"
                                    className="message-textarea"
                                    style={{backgroundColor: 'var(--bg-color)', color: 'var(--text-color)'}}
                                ></textarea>
                                <button type="submit" className="btn-send-message">{t.sendBtn}</button>
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