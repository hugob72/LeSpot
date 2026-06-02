import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/article.css'; 

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };
const translations = {
    fr: { startingAt: "À partir de", duration: "Durée :", min: "min", seeAvail: "Voir les disponibilités" },
    en: { startingAt: "Starting at", duration: "Duration:", min: "min", seeAvail: "See availability" }
};

function ServiceCard({ service }) {
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)}${symbols[currency]}`;
    };

    return (
        <Link to={`/service/${service.idTypeService}`} className="card-link">
            <div className="card service-card"> 
                <img src={service.image || 'https://via.placeholder.com/300x200?text=Service'} alt={service.name} className="card-image service-card-image"/>
                
                <div className="card-content">
                    <p className="card-price">{t.startingAt} {formatPrice(service.basePrice)}</p>
                    <p className="truncate" style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{service.name}</p>
                    <p style={{fontSize: '0.85rem', color: '#7f8c8d'}}>⏱️ {t.duration} {service.defaultDuration} {t.min}</p>
                </div>
                
                <div className="area-button">
                    <button className="button" style={{backgroundColor: '#48A3AE'}}>{t.seeAvail}</button>
                </div>
            </div>
        </Link>
    );
}
export default ServiceCard;