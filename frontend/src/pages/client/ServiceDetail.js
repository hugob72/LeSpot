import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Calendar from 'react-calendar';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { CartContext } from '../../context/CartContext';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import 'react-calendar/dist/Calendar.css'; 
import '../../styles/serviceDetail.css'; 

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };
const translations = {
    fr: {
        loading: "Chargement des disponibilités...",
        error: "Prestation introuvable.",
        alreadyInCart: "Cette session est déjà dans votre panier.",
        minutes: "minutes",
        startingAt: "À partir de",
        bookSession: "Réserver votre session",
        availabilitiesOn: "Disponibilités le",
        noSlots: "Aucune session prévue à cette date.",
        places: "places",
        full: "Complet",
        selectedSession: "Vous avez sélectionné la session de",
        continueBooking: "Continuer la réservation",
        onDate: "le",
        atTime: "à"
    },
    en: {
        loading: "Loading availability...",
        error: "Service not found.",
        alreadyInCart: "This session is already in your cart.",
        minutes: "minutes",
        startingAt: "Starting at",
        bookSession: "Book your session",
        availabilitiesOn: "Availability on",
        noSlots: "No sessions scheduled on this date.",
        places: "spots",
        full: "Full",
        selectedSession: "You have selected the session at",
        continueBooking: "Continue booking",
        onDate: "on",
        atTime: "at"
    }
};

function ServiceDetail() {
    const { language, currency, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const { id } = useParams();
    const history = useHistory();
    const userId = localStorage.getItem('userId');
    const { cartItems, setCartItems } = useContext(CartContext);
    const [service, setService] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)}${symbols[currency]}`;
    };

    useEffect(() => {
        fetch(`http://localhost:3001/catalog/services/${id}`)
            .then(res => res.json())
            .then(data => setService(data))
            .catch(err => console.error('Erreur prestation:', err));

        fetch(`http://localhost:3001/catalog/services/${id}/slots`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setSlots(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erreur créneaux:', error);
                setLoading(false);
            });
    }, [id]);

    const getSlotsForSelectedDate = () => {
        const offset = selectedDate.getTimezoneOffset() * 60000;
        const localDate = new Date(selectedDate.getTime() - offset).toISOString().split('T')[0];

        return slots.filter(slot => {
            const slotDate = new Date(slot.date).toISOString().split('T')[0];
            return slotDate === localDate;
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedSlot(null); 
    };

    const handleBooking = () => {
        if (!userId) {
            history.push('/login');
            return;
        }
        if (!selectedSlot) return;

        const alreadyInCart = cartItems.find(item => item.isService && item.idService === selectedSlot.idService);
        if (alreadyInCart) {
            alert(t.alreadyInCart);
            return;
        }

        const formattedDate = new Date(selectedSlot.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
        const formattedTime = selectedSlot.heure.substring(0,5);
        const serviceCartItem = {
            isService: true, 
            idService: selectedSlot.idService,
            name: `${service.name} (${t.onDate} ${formattedDate} ${t.atTime} ${formattedTime})`,
            price: service.basePrice,
            quantity: 1, 
            image: service.image
        };

        setCartItems([...cartItems, serviceCartItem]);
        history.push('/cart'); 
    };

    if (loading) return <div className="loading">{t.loading}</div>;
    if (!service) return <div className="error">{t.error}</div>;

    const availableSlotsToday = getSlotsForSelectedDate();

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="service-detail-wrapper">
                
                <div className="service-hero" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                    <img src={service.image} alt={service.name} className="service-hero-img" />
                    <div className="service-hero-content">
                        <h1 style={{color: 'var(--text-color)'}}>{service.name}</h1>
                        <p className="service-desc" style={{color: 'var(--text-color)'}}>{service.description}</p>
                        <div className="service-badges">
                            <span className="badge">⏱️ {service.defaultDuration} {t.minutes}</span>
                            <span className="badge">💶 {t.startingAt} {formatPrice(service.basePrice)}</span>
                        </div>
                    </div>
                </div>

                <div className="booking-section">
                    <h2 style={{color: 'var(--text-color)'}}>{t.bookSession}</h2>
                    
                    <div className="booking-grid">
                        <div className="calendar-container">
                            <Calendar 
                                onChange={handleDateChange} 
                                value={selectedDate}
                                minDate={new Date()} 
                                className="custom-calendar"
                                locale={language === 'fr' ? 'fr-FR' : 'en-US'}
                            />
                        </div>

                        <div className="slots-container" style={{backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)'}}>
                            <h3 style={{color: 'var(--text-color)'}}>{t.availabilitiesOn} {selectedDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            
                            {availableSlotsToday.length === 0 ? (
                                <div className="no-slots" style={{color: 'var(--text-color)'}}>{t.noSlots}</div>
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
                                                {slot.placesRestantes > 0 ? `${slot.placesRestantes} ${t.places}` : t.full}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {selectedSlot && (
                                <div className="booking-action" style={{backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)'}}>
                                    <p style={{color: 'var(--text-color)'}}>{t.selectedSession} <strong>{selectedSlot.heure.substring(0, 5)}</strong>.</p>
                                    <button className="btn-confirm-booking" onClick={handleBooking}>
                                        {t.continueBooking}
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