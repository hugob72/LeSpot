import React, { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css';

const translations = {
    fr: {
        loading: "Chargement de vos réservations...",
        title: "Mes Réservations",
        empty: "Vous n'avez encore réservé aucune session. 🏄‍♂️",
        upcoming: "Sessions à venir",
        noUpcoming: "Aucune session prévue prochainement.",
        duration: "⏱️ Durée :",
        min: "min",
        confirmed: "Confirmée",
        history: "Historique passé",
        noHistory: "Aucun historique disponible.",
        completed: "Terminée"
    },
    en: {
        loading: "Loading your bookings...",
        title: "My Bookings",
        empty: "You haven't booked any sessions yet. 🏄‍♂️",
        upcoming: "Upcoming sessions",
        noUpcoming: "No upcoming sessions scheduled.",
        duration: "⏱️ Duration:",
        min: "min",
        confirmed: "Confirmed",
        history: "Past history",
        noHistory: "No history available.",
        completed: "Completed"
    }
};

function MyBookings() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }

        fetch(`http://localhost:3001/user/${userId}/bookings`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    setBookings([]);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur récupération réservations:", err);
                setLoading(false);
            });
    }, [userId, history]);

    if (loading) return <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}><Header /><p style={{textAlign:'center', marginTop:'50px'}}>{t.loading}</p></div>;

    const now = new Date();

    const getBookingDate = (dateStr, timeStr) => {
        const d = new Date(dateStr); 
        const [hours, minutes] = timeStr.split(':');
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0); 
        return d;
    };
    
    const upcomingBookings = bookings.filter(b => getBookingDate(b.date, b.heure) >= now);
    const pastBookings = bookings.filter(b => getBookingDate(b.date, b.heure) < now);

    const formatDateTime = (dateStr, timeStr) => {
        const date = getBookingDate(dateStr, timeStr); 
        const formattedDate = date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        // En anglais, "à" se traduit par "at"
        const atWord = language === 'fr' ? 'à' : 'at';
        return `${formattedDate} ${atWord} ${timeStr.substring(0, 5)}`;
    };

    return (
        <div className={`home ${theme === 'dark' ? 'dark-mode' : ''}`}>
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">{t.title}</h1>

                {bookings.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>{t.empty}</p>
                ) : (
                    <>
                        <h2 style={{ color: '#48A3AE', borderBottom: '2px solid var(--accent-color)', paddingBottom: '10px', marginTop: '30px' }}>{t.upcoming}</h2>
                        {upcomingBookings.length === 0 ? (
                            <p style={{ color: '#777', fontStyle: 'italic' }}>{t.noUpcoming}</p>
                        ) : (
                            upcomingBookings.map((booking, index) => (
                                <div key={index} className="cart-summary-item" style={{ borderLeft: '5px solid #10b981', backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                                    <div className="cart-summary-item-info">
                                        <img src={booking.image} alt={booking.name} className="cart-summary-item-img" />
                                        <div>
                                            <h3 style={{color: 'var(--text-color)'}}>{booking.name}</h3>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-color)' }}>
                                                📅 {formatDateTime(booking.date, booking.heure)}
                                            </p>
                                            <p style={{ color: 'var(--text-color)', opacity: 0.8 }}>{t.duration} {booking.duree} {t.min}</p>
                                        </div>
                                    </div>
                                    <div className="cart-summary-item-controls">
                                        <span style={{ backgroundColor: '#e0f2f1', color: '#00796b', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                                            {t.confirmed}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        <h2 style={{ color: 'var(--text-color)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', marginTop: '50px' }}>{t.history}</h2>
                        {pastBookings.length === 0 ? (
                            <p style={{ color: '#777', fontStyle: 'italic' }}>{t.noHistory}</p>
                        ) : (
                            pastBookings.map((booking, index) => (
                                <div key={index} className="cart-summary-item" style={{ opacity: '0.7', borderLeft: '5px solid var(--border-color)', backgroundColor: 'var(--card-bg)' }}>
                                    <div className="cart-summary-item-info">
                                        <img src={booking.image} alt={booking.name} className="cart-summary-item-img" style={{ filter: 'grayscale(50%)' }} />
                                        <div>
                                            <h3 style={{color: 'var(--text-color)'}}>{booking.name}</h3>
                                            <p style={{color: 'var(--text-color)'}}>📅 {formatDateTime(booking.date, booking.heure)}</p>
                                        </div>
                                    </div>
                                    <div className="cart-summary-item-controls">
                                        <span style={{ color: 'var(--text-color)', opacity: 0.8, fontWeight: 'bold' }}>{t.completed}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
export default MyBookings;