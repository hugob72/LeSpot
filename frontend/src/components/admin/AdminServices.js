import { useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import "../../styles/adminStock.css";

function AdminServices() {
    const [slotsList, setSlotsList] = useState([]);
    const [displayedSlots, setDisplayedSlots] = useState([]);
    const [catalog, setCatalog] = useState([]); // Pour le filtre prestation
    
    // États pour les filtres
    const [filterDate, setFilterDate] = useState('');
    const [filterType, setFilterType] = useState('');

    const history = useHistory();

    const fetchData = () => {
        // 1. Récupération des créneaux (Agenda)
        fetch('http://localhost:3001/admin/services')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSlotsList(data);
                    setDisplayedSlots(data);
                }
            })
            .catch(error => console.error('Erreur récupération des créneaux :', error));

        // 2. Récupération des prestations (Catalogue) pour alimenter le filtre
        fetch('http://localhost:3001/catalog/services')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) setCatalog(data);
            })
            .catch(error => console.error('Erreur récupération catalogue :', error));
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Logique de filtrage en temps réel
    useEffect(() => {
        let filtered = slotsList.filter(slot => {
            const slotDateStr = slot.date ? new Date(slot.date).toISOString().split('T')[0] : '';
            const matchDate = filterDate === '' || slotDateStr === filterDate;
            const matchType = filterType === '' || String(slot.idTypeService) === filterType;

            return matchDate && matchType;
        });
        setDisplayedSlots(filtered);
    }, [filterDate, filterType, slotsList]);

    function navigateToAddService() {
        history.push('/admin/add-service');
    }

    function navigateToModifyService(id) {
        history.push('/admin/add-service/' + id);
    }

    function deleteService(id) {
        if (window.confirm("Supprimer ce créneau ? Toutes les réservations associées seront annulées.")) {
            fetch(`http://localhost:3001/admin/services/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(() => {
                alert("Suppression effectuée avec succès.");
                setSlotsList(slotsList.filter(slot => slot.idService !== id));
            })
            .catch(error => console.error('Erreur lors de la suppression : ', error));
        }
    }

    const resetFilters = (e) => {
        e.preventDefault();
        setFilterDate('');
        setFilterType('');
    };

    const formatDateTime = (dateStr, timeStr) => {
        const d = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':');
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        return `${d.toLocaleDateString('fr-FR')} à ${timeStr.substring(0, 5)}`;
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion de l'Agenda (Créneaux)</h3>
                <button className="admin-btn-add" onClick={navigateToAddService}>Ajouter un créneau</button>
            </div>
            
            {/* BARRE DE FILTRES */}
            <div className="admin-filters-bar">
                <div className="admin-filter-group">
                    <label>Filtrer par Date :</label>
                    <input 
                        type="date" 
                        value={filterDate} 
                        onChange={(e) => setFilterDate(e.target.value)} 
                        className="admin-filter-input" 
                    />
                </div>
                <div className="admin-filter-group">
                    <label>Filtrer par Prestation :</label>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)} 
                        className="admin-filter-input"
                    >
                        <option value="">Toutes les prestations</option>
                        {catalog.map(c => (
                            <option key={c.idTypeService} value={c.idTypeService}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <button className="admin-btn-reset" onClick={resetFilters}>Réinitialiser</button>
            </div>

            {/* TABLEAU OU MESSAGE DE RÉSULTAT VIDE */}
            <div className="table-responsive">
                {displayedSlots.length === 0 ? (
                    <div className="admin-no-results">
                        <p>Aucun créneau ne correspond à ces critères.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Prestation</th>
                                <th>Date & Heure</th>
                                <th>Durée</th>
                                <th>Tarif</th>
                                <th>Inscrits</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedSlots.map((slot) => {
                                const isFull = slot.inscrits >= slot.numberParticipants;
                                return (
                                    <tr key={slot.idService}>
                                        <td>#{slot.idService}</td>
                                        <td className="admin-table-name">{slot.typeName}</td>
                                        <td>{formatDateTime(slot.date, slot.heure)}</td>
                                        <td>{slot.duree} min</td>
                                        <td>{Number(slot.price).toFixed(2)} €</td>
                                        <td>
                                            <span className={`stock-badge ${isFull ? 'out-of-stock' : 'in-stock'}`}>
                                                {slot.inscrits} / {slot.numberParticipants}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="action-btn edit-btn" onClick={() => navigateToModifyService(slot.idService)}>✏️</button>
                                            <button className="action-btn delete-btn" onClick={() => deleteService(slot.idService)}>🗑️</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminServices;