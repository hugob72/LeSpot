import { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import "../../styles/addArticle.css";

function AddService() {
    const { idService } = useParams();
    const history = useHistory();
    const [catalog, setCatalog] = useState([]);
    
    const [slot, setSlot] = useState({
        idTypeService: '',
        date: '',
        heure: '',
        duree: '',
        price: '',
        numberParticipants: ''
    });

    useEffect(() => {
        fetch('http://localhost:3001/catalog/services')
            .then(res => res.json())
            .then(data => setCatalog(Array.isArray(data) ? data : []))
            .catch(error => alert(error));

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
                .catch(error => alert('Erreur récupération du créneau :', error)); 
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
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => { 
                    throw new Error(data.error || 'Erreur serveur'); 
                });
            }
            return response.json();
        })
        .then(data => {
            alert("Créneau ajouté avec succès à l'agenda !");
            history.push('/admin/services'); 
        })
        .catch(error => {alert('Impossible de créer le créneau : ' + error.message);});
    };

    const handleChangeSlot = () => {
        fetch(`http://localhost:3001/admin/services/${idService}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slot)
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
            alert("Créneau modifié avec succès !");
            history.push('/admin/services'); 
        })
        .catch(error => {alert('Impossible de modifier le créneau : ' + error.message);});
    };

    return (
        <div>
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

                <div className="center-container">
                    {idService ? 
                        <button onClick={handleChangeSlot} className="button btn-save">Modifier</button>
                    :
                        <button onClick={handleAddSlot} className="button btn-save">Ajouter</button>
                    }
                </div>
            </div>
        </div> 
    );
} 

export default AddService;