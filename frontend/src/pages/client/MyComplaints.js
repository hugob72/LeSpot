import React, { useState, useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/myComplaints.css';
import '../../styles/home.css';

const translations = {
    fr: {
        loading: "Chargement...", 
        title: "Mes Réclamations", 
        newComplaint: "Nouvelle réclamation",
        empty: "Vous n'avez aucune réclamation en cours.",
        complaintNum: "Réclamation n°", 
        linkedOrder: "- Liée à la commande n°",
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
        title: "My Complaints", 
        newComplaint: "New complaint",
        empty: "You have no active complaints.",
        complaintNum: "Complaint #", 
        linkedOrder: "- Linked to order #",
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

function MyComplaints() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }
        fetch(`http://localhost:3001/complaint/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setComplaints(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur:", err);
                setLoading(false);
            });
    }, [userId, history]);

    if (loading) return <div className="complaints-loading">{t.loading}</div>;

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="my-complaints-wrapper">
                <div className="complaints-header">
                    <h1 style={{color: 'var(--text-color)'}}>{t.title}</h1>
                    <Link to="/create-complaint" className="btn-new-complaint">{t.newComplaint}</Link>
                </div>

                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <p style={{color: 'var(--text-color)'}}>{t.empty}</p>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {complaints.map(complaint => (
                            <Link to={`/complaint/${complaint.idComplaint}`} key={complaint.idComplaint} className="complaint-card-link">
                                <div className="complaint-card" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                                    <div className="complaint-info">
                                        {complaint.type && (
                                            <span className="complaint-type">
                                                {t.types[complaint.type] || t.uncategorized}
                                            </span>
                                        )}
                                        <h3 style={{color: 'var(--text-color)'}}>{complaint.topic}</h3>
                                        <p className="complaint-id">
                                            {t.complaintNum}{complaint.idComplaint} {complaint.idOrder && `${t.linkedOrder}${complaint.idOrder}`}
                                        </p>
                                    </div>
                                    <div className={`complaint-state state-${complaint.state.replace(/\s+/g, '-').toLowerCase()}`}>
                                        {complaint.state}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
export default MyComplaints;