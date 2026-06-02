import { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import "../../styles/addArticle.css"; 

function AddPromotion() {
    const { idPromotion } = useParams();
    const history = useHistory();
    
    const [promo, setPromo] = useState({
        code: '',
        rate: null,
        description: '',
        conditions: '',
        dateDebut: '',
        dateFin: '',
        isFeatured: false
    });

    useEffect(() => {
        if (idPromotion) {
            fetch(`http://localhost:3001/promotions/${idPromotion}`)
                .then(response => response.json())
                .then(data => {
                    setPromo({
                        code: data.code,
                        rate: data.rate,
                        description: data.description || '',
                        conditions: data.conditions || '',
                        dateDebut: data.dateDebut.substring(0, 16),
                        dateFin: data.dateFin.substring(0, 16),
                        isFeatured: data.isFeatured === 1
                    });
                })
                .catch(error => console.error('Erreur récupération promo :', error)); 
        }
    }, [idPromotion]);

    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setPromo(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (new Date(promo.dateDebut) >= new Date(promo.dateFin)) {
            alert("Erreur : La date de fin doit obligatoirement être après la date de début.");
            return false;
        }
        if (promo.rate <= 0 || promo.rate > 100) {
            alert("Erreur : Le taux de réduction doit être compris entre 1% et 100%.");
            return false;
        }
        return true;
    };

    const handleAddPromotion = () => {
        if (validateForm()) {
           fetch('http://localhost:3001/promotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promo)
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
            alert("Code promotionnel créé avec succès !");
            history.push('/admin/promotions');
        })
        .catch(error => alert(error.message)); 
        }
    
    };

    const handleChangePromotion = () => {
        if (validateForm()) {
            fetch(`http://localhost:3001/promotions/${idPromotion}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promo)
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
            alert("Promotion modifiée avec succès !");
            history.push('/admin/promotions'); 
        })
        .catch(error => alert(error.message));
        };

    };

    return (
        <div>
            <div className="flex-column">
                <h1>Formulaire de {idPromotion ? "modification": "création"} d'une promotion</h1>

                <label>Code Promotionnel (Unique)</label>
                <input type="text" name="code" onChange={handleInputChange} className="detail-input" value={promo.code} placeholder="Ex: SURF20" style={{ textTransform: 'uppercase' }} required />

                <label>Taux de réduction (%)</label>
                <input type="number" name="rate" min="1" max="100" onChange={handleInputChange} className="detail-input" value={promo.rate} required />

                <label>Description</label>
                <input type="text" name="description" onChange={handleInputChange} className="detail-input" value={promo.description} placeholder="Ex: -20% sur tout le site pour fêter l'été" />

                <label>Date et heure de début</label>
                <input type="datetime-local" name="dateDebut" onChange={handleInputChange} className="detail-input" value={promo.dateDebut} required />

                <label>Date et heure de fin</label>
                <input type="datetime-local" name="dateFin" onChange={handleInputChange} className="detail-input" value={promo.dateFin} required />

                <div>
                    <input type="checkbox" name="isFeatured" id="isFeatured" onChange={handleInputChange} checked={promo.isFeatured} />
                    <label htmlFor="isFeatured" style={{ margin: 0, fontWeight: 'bold' }}>Mettre en avant sur la page des promotions</label>
                </div>

                <div className="center-container">
                    {idPromotion ? 
                        <button onClick={handleChangePromotion} className="button btn-save">Modifier</button>
                    :
                        <button onClick={handleAddPromotion} className="button btn-save">Créer</button>
                    }
                </div>
            </div>
        </div> 
    );
} 

export default AddPromotion;