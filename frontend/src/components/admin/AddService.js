import { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import "../../styles/addArticle.css"; // On garde ton CSS global

function AddService() {
    const { idService } = useParams();
    const history = useHistory();
    const [catalog, setCatalog] = useState([]);
    
    const [slot, setSlot] = useState({
        idTypeService: '',
        date: '',
        heure: '',
        duree: 90,
        price: 35,
        numberParticipants: 8
    });

    useEffect(() => {
        // 1. Récupération du catalogue
        fetch('http://localhost:3001/catalog/services')
            .then(res => res.json())
            .then(data => setCatalog(Array.isArray(data) ? data : []))
            .catch(err => console.error(err));

        // 2. Récupération des données du créneau si on est en mode Modification
        if (idService) {
            fetch(`http://localhost:3001/admin/services/${idService}`)
                .then(response => response.json())
                .then(data => {
                    setSlot({
                        idTypeService: data.idTypeService,
                        date: data.date.split('T')[0], 
                        heure: data.heure,
                        duree: data.duree,
                        price: data.price,
                        numberParticipants: data.numberParticipants
                    });
                })
                .catch(error => console.error('Erreur récupération du créneau :', error)); 
        }
    }, [idService]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSlot(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddSlot = () => {
        fetch('http://localhost:3001/admin/services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slot)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur serveur');
            
            alert("Créneau ajouté avec succès à l'agenda !");
            history.push('/admin/services'); 
        })
        .catch(error => {
            console.error('Erreur création : ', error);
            alert('Impossible de créer le créneau : ' + error.message);
        });
    };

    const handleChangeSlot = () => {
        fetch(`http://localhost:3001/admin/services/${idService}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slot)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur serveur');
            
            alert("Créneau modifié avec succès !");
            history.push('/admin/services'); 
        })
        .catch(error => {
            console.error('Erreur modification : ', error);
            alert('Impossible de modifier le créneau : ' + error.message);
        });
    };

    return (
        <div>
            {/* CORRECTION ICI : On a retiré le style={{...}} pour revenir au design de base */}
            <div className="flex-column">
                <h1>Formulaire de {idService ? "modification": "création"} d'un créneau</h1>

                <label>Prestation</label>
                <select name="idTypeService" onChange={handleInputChange} className="detail-input" value={slot.idTypeService} required>
                    <option value="">Sélectionnez un cours...</option>
                    {catalog.map(c => <option key={c.idTypeService} value={c.idTypeService}>{c.name}</option>)}
                </select>

                <label>Date</label>
                <input type="date" name="date" onChange={handleInputChange} className="detail-input" value={slot.date} required />

                <label>Heure</label>
                <input type="time" name="heure" onChange={handleInputChange} className="detail-input" value={slot.heure} required />

                <label>Durée (minutes)</label>
                <input type="number" name="duree" onChange={handleInputChange} className="detail-input" value={slot.duree} required />

                <label>Prix (€)</label>
                <input type="number" name="price" step="0.01" onChange={handleInputChange} className="detail-input" value={slot.price} required />

                <label>Nombre de places maximum</label>
                <input type="number" name="numberParticipants" onChange={handleInputChange} className="detail-input" value={slot.numberParticipants} required />

                <div className="center-container" style={{ marginTop: '20px' }}>
                    {idService ? 
                        <button onClick={handleChangeSlot} className="button btn-save">Modifier</button>
                    :
                        <button onClick={handleAddSlot} className="button btn-save">Ajouter le créneau</button>
                    }
                </div>
            </div>
        </div> 
    );
} 

export default AddService;