import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/home.css';
import '../../styles/cartSummary.css'; // On réutilise ce style pour avoir de belles cartes horizontales

function MyBookings() {
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

    if (loading) return <div className="home"><Header /><p style={{textAlign:'center', marginTop:'50px'}}>Chargement de vos réservations...</p></div>;

    // Trier les réservations : "À venir" vs "Passées"
    const now = new Date();

    // Nouvelle fonction robuste pour combiner la date et l'heure en respectant le fuseau horaire (France)
    const getBookingDate = (dateStr, timeStr) => {
        const d = new Date(dateStr); // Récupère la date (gère automatiquement le décalage UTC -> Heure locale)
        const [hours, minutes] = timeStr.split(':');
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0); // Applique l'heure localement
        return d;
    };
    
    // On utilise notre nouvelle fonction pour le filtre
    const upcomingBookings = bookings.filter(b => getBookingDate(b.date, b.heure) >= now);
    const pastBookings = bookings.filter(b => getBookingDate(b.date, b.heure) < now);

    // Fonction de formatage pour un affichage propre
    const formatDateTime = (dateStr, timeStr) => {
        const date = getBookingDate(dateStr, timeStr); // On réutilise la fonction pour être raccord !
        return `${date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} à ${timeStr.substring(0, 5)}`;
    };

    return (
        <div className="home">
            <Header />
            <div className="container cart-summary-container">
                <h1 className="cart-summary-title">Mes Réservations</h1>

                {bookings.length === 0 ? (
                    <p style={{ textAlign: 'center', marginTop: '20px' }}>Vous n'avez encore réservé aucune session. 🏄‍♂️</p>
                ) : (
                    <>
                        {/* SECTION : À VENIR */}
                        <h2 style={{ color: '#48A3AE', borderBottom: '2px solid #F7E7CE', paddingBottom: '10px', marginTop: '30px' }}>Sessions à venir</h2>
                        {upcomingBookings.length === 0 ? (
                            <p style={{ color: '#777', fontStyle: 'italic' }}>Aucune session prévue prochainement.</p>
                        ) : (
                            upcomingBookings.map((booking, index) => (
                                <div key={index} className="cart-summary-item" style={{ borderLeft: '5px solid #10b981' }}>
                                    <div className="cart-summary-item-info">
                                        <img src={booking.image} alt={booking.name} className="cart-summary-item-img" />
                                        <div>
                                            <h3>{booking.name}</h3>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                                                📅 {formatDateTime(booking.date, booking.heure)}
                                            </p>
                                            <p style={{ color: '#666' }}>⏱️ Durée : {booking.duree} min</p>
                                        </div>
                                    </div>
                                    <div className="cart-summary-item-controls">
                                        <span style={{ backgroundColor: '#e0f2f1', color: '#00796b', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                                            Confirmée
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* SECTION : HISTORIQUE */}
                        <h2 style={{ color: '#5a4a42', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '50px' }}>Historique passé</h2>
                        {pastBookings.length === 0 ? (
                            <p style={{ color: '#777', fontStyle: 'italic' }}>Aucun historique disponible.</p>
                        ) : (
                            pastBookings.map((booking, index) => (
                                <div key={index} className="cart-summary-item" style={{ opacity: '0.7', borderLeft: '5px solid #ccc' }}>
                                    <div className="cart-summary-item-info">
                                        <img src={booking.image} alt={booking.name} className="cart-summary-item-img" style={{ filter: 'grayscale(50%)' }} />
                                        <div>
                                            <h3>{booking.name}</h3>
                                            <p>📅 {formatDateTime(booking.date, booking.heure)}</p>
                                        </div>
                                    </div>
                                    <div className="cart-summary-item-controls">
                                        <span style={{ color: '#888', fontWeight: 'bold' }}>Terminée</span>
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