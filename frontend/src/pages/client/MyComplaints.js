import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/myComplaints.css';
import '../../styles/home.css';

// Dictionnaire pour traduire le type de réclamation proprement
const typeTraductions = {
    'livraison': 'Problème de livraison',
    'produit_defectueux': 'Produit défectueux',
    'erreur_commande': 'Erreur de commande',
    'remboursement': 'Demande de retour',
    'autre': 'Autre'
};

function MyComplaints() {
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

    if (loading) return <div className="complaints-loading">Chargement...</div>;

    return (
        <div className="home">
            <Header />
            {/* Remplacement de la classe .container problématique */}
            <div className="my-complaints-wrapper">
                <div className="complaints-header">
                    <h1>Mes Réclamations</h1>
                    <Link to="/create-complaint" className="btn-new-complaint">Nouvelle réclamation</Link>
                </div>

                {complaints.length === 0 ? (
                    <div className="empty-state">
                        <p>Vous n'avez aucune réclamation en cours.</p>
                    </div>
                ) : (
                    <div className="complaints-list">
                        {complaints.map(complaint => (
                            <Link to={`/complaint/${complaint.idComplaint}`} key={complaint.idComplaint} className="complaint-card-link">
                                <div className="complaint-card">
                                    <div className="complaint-info">
                                        {/* Affichage du type si disponible */}
                                        {complaint.type && (
                                            <span className="complaint-type">
                                                {typeTraductions[complaint.type] || 'Non catégorisé'}
                                            </span>
                                        )}
                                        <h3>{complaint.topic}</h3>
                                        <p className="complaint-id">
                                            Réclamation n°{complaint.idComplaint} {complaint.idOrder && `- Liée à la commande n°${complaint.idOrder}`}
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