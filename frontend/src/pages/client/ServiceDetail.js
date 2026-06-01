import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Calendar from 'react-calendar';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { CartContext } from '../../context/CartContext';
import 'react-calendar/dist/Calendar.css'; // Le CSS de base qu'on va écraser
import '../../styles/serviceDetail.css'; // Notre CSS personnalisé

function ServiceDetail() {
    const { id } = useParams();
    const history = useHistory();
    const userId = localStorage.getItem('userId');
    const { cartItems, setCartItems } = useContext(CartContext);

    const [service, setService] = useState(null);
    const [slots, setSlots] = useState([]);
    
    // États pour la réservation
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Récupération des infos de la prestation
        fetch(`http://localhost:3001/catalog/services/${id}`)
            .then(res => res.json())
            .then(data => setService(data))
            .catch(err => console.error('Erreur prestation:', err));

        // 2. Récupération des créneaux (Agenda)
        fetch(`http://localhost:3001/catalog/services/${id}/slots`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSlots(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erreur créneaux:', err);
                setLoading(false);
            });
    }, [id]);

    // Filtrer les créneaux pour le jour sélectionné sur le calendrier
    const getSlotsForSelectedDate = () => {
        // Formate la date sélectionnée en YYYY-MM-DD (format local pour éviter les décalages de fuseau)
        const offset = selectedDate.getTimezoneOffset() * 60000;
        const localDate = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];

        return slots.filter(slot => {
            const slotDate = new Date(slot.date).toISOString().split('T')[0];
            return slotDate === localDate;
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null); // Réinitialise le créneau si on change de jour
    };

   const handleBooking = () => {
        if (!userId) {
            history.push('/login');
            return;
        }
        if (!selectedSlot) return;

        // On vérifie si ce créneau n'est pas DÉJÀ dans le panier
        const alreadyInCart = cartItems.find(item => item.isService && item.idService === selectedSlot.idService);
        if (alreadyInCart) {
            alert('Cette session est déjà dans votre panier.');
            return;
        }

        // On crée l'objet formaté pour le panier
        const serviceCartItem = {
            isService: true, // Ce flag est crucial pour la suite !
            idService: selectedSlot.idService,
            name: `${service.name} (le ${new Date(selectedSlot.date).toLocaleDateString('fr-FR')} à ${selectedSlot.heure.substring(0,5)})`,
            price: service.basePrice,
            quantity: 1, // Fixe à 1 (un utilisateur = une place selon ta BDD)
            image: service.image
        };

        setCartItems([...cartItems, serviceCartItem]);
        history.push('/cart'); // Redirection vers le panier
    };

    if (loading) return <div className="loading">Chargement des disponibilités...</div>;
    if (!service) return <div className="error">Prestation introuvable.</div>;

    const availableSlotsToday = getSlotsForSelectedDate();

    return (
        <div className="home">
            <Header />
            <div className="service-detail-wrapper">
                
                {/* En-tête : Présentation de la prestation */}
                <div className="service-hero">
                    <img src={service.image} alt={service.name} className="service-hero-img" />
                    <div className="service-hero-content">
                        <h1>{service.name}</h1>
                        <p className="service-desc">{service.description}</p>
                        <div className="service-badges">
                            <span className="badge">⏱️ {service.defaultDuration} minutes</span>
                            <span className="badge">💶 À partir de {Number(service.basePrice).toFixed(2)}€</span>
                        </div>
                    </div>
                </div>

                {/* Section Réservation : Calendrier + Créneaux */}
                <div className="booking-section">
                    <h2>Réserver votre session</h2>
                    
                    <div className="booking-grid">
                        {/* Colonne Gauche : Calendrier */}
                        <div className="calendar-container">
                            <Calendar 
                                onChange={handleDateChange} 
                                value={selectedDate}
                                minDate={new Date()} // Empêche de sélectionner le passé
                                className="custom-calendar"
                            />
                        </div>

                        {/* Colonne Droite : Créneaux horaires */}
                        <div className="slots-container">
                            <h3>Disponibilités le {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            
                            {availableSlotsToday.length === 0 ? (
                                <div className="no-slots">Aucune session prévue à cette date.</div>
                            ) : (
                                <div className="slots-grid">
                                    {availableSlotsToday.map(slot => (
                                        <button 
                                            key={slot.idService}
                                            className={`slot-btn ${selectedSlot?.idService === slot.idService ? 'selected' : ''}`}
                                            onClick={() => setSelectedSlot(slot)}
                                            disabled={slot.placesRestantes <= 0}
                                        >
                                            <span className="slot-time">{slot.heure.substring(0, 5)}</span>
                                            <span className="slot-places">
                                                {slot.placesRestantes > 0 ? `${slot.placesRestantes} places` : 'Complet'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Bouton de confirmation (Apparaît si un créneau est choisi) */}
                            {selectedSlot && (
                                <div className="booking-action">
                                    <p>Vous avez sélectionné la session de <strong>{selectedSlot.heure.substring(0, 5)}</strong>.</p>
                                    <button className="btn-confirm-booking" onClick={handleBooking}>
                                        Continuer la réservation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            <Footer />
        </div>
    );
}

export default ServiceDetail;