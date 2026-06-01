import React, { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css"

function AdminComplaints() {
    // Liste originale (intacte) et liste affichée (filtrée)
    const [complaintsList, setComplaintsList] = useState([]);
    const [displayedComplaints, setDisplayedComplaints] = useState([]);
    
    // États pour les filtres
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const history = useHistory();

    const typeTraductions = {
        'livraison': 'Problème de livraison',
        'produit_defectueux': 'Produit défectueux',
        'erreur_commande': 'Erreur de commande',
        'remboursement': 'Demande de retour',
        'autre': 'Autre'
    };

    const stateTraductions = {
        'ouverte': 'Ouverte',
        'en_cours': 'En cours',
        'resolue': 'Résolue',
        'fermee': 'Fermée'
    };

    useEffect(() => {
        fetch('http://localhost:3001/complaint')
            .then(response => response.json())
            .then(data => {
                // SÉCURITÉ : On vérifie que data est bien un tableau
                if (Array.isArray(data)) {
                    setComplaintsList(data);
                    setDisplayedComplaints(data);
                } else {
                    console.error('Erreur backend:', data);
                    setComplaintsList([]);
                    setDisplayedComplaints([]);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des réclamations :', error);
                setComplaintsList([]);
                setDisplayedComplaints([]);
            });
    }, []);

    // Logique de filtrage dynamique (s'exécute à chaque changement d'un filtre)
    useEffect(() => {
        let filtered = complaintsList.filter(complaint => {
            // Filtre par Type
            const matchType = filterType === '' || complaint.type === filterType;
            
            // Filtre par Statut
            const matchStatus = filterStatus === '' || complaint.state === filterStatus;
            
            // Filtre par Date (Format YYYY-MM-DD)
            const complaintDateStr = complaint.date ? new Date(complaint.date).toISOString().split('T')[0] : '';
            const matchDate = filterDate === '' || complaintDateStr === filterDate;

            return matchType && matchStatus && matchDate;
        });

        setDisplayedComplaints(filtered);
    }, [filterType, filterStatus, filterDate, complaintsList]);

    // Réinitialisation des filtres
    const resetFilters = (e) => {
        e.preventDefault();
        setFilterType('');
        setFilterStatus('');
        setFilterDate('');
    };

    function navigateToInformationsComplaint(id) {
        history.push('/admin/litiges/' + id);
    }

    const getStatusClass = (status) => {
        switch(status) {
            case 'ouverte': return 'out-of-stock'; // Rouge/Orange
            case 'en_cours': return 'in-stock';    // Ou une autre classe CSS personnalisée
            case 'resolue': return 'in-stock';     // Vert
            case 'fermee': return '';              // Gris
            default: return '';
        }
    };

    // Formatage de la date pour le tableau
    const formatDate = (dateString) => {
        if (!dateString) return "Non définie";
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion des litiges (Réclamations)</h3>
            </div>
            
            {/* BARRE DE FILTRES */}
            <div className="admin-filters-bar">
                <div className="admin-filter-group">
                    <label>Type :</label>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)} 
                        className="admin-filter-input"
                    >
                        <option value="">Tous les types</option>
                        <option value="livraison">Problème de livraison</option>
                        <option value="produit_defectueux">Produit défectueux</option>
                        <option value="erreur_commande">Erreur de commande</option>
                        <option value="remboursement">Demande de retour</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                <div className="admin-filter-group">
                    <label>Statut :</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)} 
                        className="admin-filter-input"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="ouverte">Ouverte</option>
                        <option value="en_cours">En cours</option>
                        <option value="resolue">Résolue</option>
                        <option value="fermee">Fermée</option>
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

            {/* TABLEAU */}
            <div className="table-responsive">
                {displayedComplaints.length === 0 ? (
                    <div className="admin-no-results">
                        <p>Aucun litige ne correspond à ces critères.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Sujet</th>
                                <th>Type</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedComplaints.map((complaint) => (
                                <tr key={complaint.idComplaint}>
                                    <td>#{complaint.idComplaint}</td>
                                    <td className="admin-table-name">{complaint.topic}</td>
                                    <td>{typeTraductions[complaint.type] || complaint.type || 'Non catégorisé'}</td>
                                    <td>{complaint.firstName} {complaint.lastName}</td>
                                    <td>{formatDate(complaint.date)}</td>
                                    <td>
                                        <span className={`stock-badge ${getStatusClass(complaint.state)}`}>
                                            {stateTraductions[complaint.state] || complaint.state}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn edit-btn" onClick={() => navigateToInformationsComplaint(complaint.idComplaint)}>👁️</button>
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

export default AdminComplaints;