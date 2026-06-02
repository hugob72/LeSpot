import React, { useState, useEffect, useContext } from 'react';
import ServiceCard from '../../components/client/ServiceCard'; 
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/shoppingList.css'; 

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        searchLabel: "Rechercher un cours :", searchPlaceholder: "Surf, Paddle...",
        budgetLabel: "Budget max", budgetPlaceholder: "Ex: 50",
        durationLabel: "Durée max (minutes) :", allDurations: "Toutes les durées",
        min60: "1h (60 min) ou moins", min90: "1h30 (90 min) ou moins", min120: "2h (120 min) ou moins",
        reset: "Réinitialiser", noResults: "Désolé, aucune prestation ne correspond à vos critères. 🏄‍♂️"
    },
    en: {
        searchLabel: "Search for a class:", searchPlaceholder: "Surf, Paddle...",
        budgetLabel: "Max budget", budgetPlaceholder: "Ex: 50",
        durationLabel: "Max duration (minutes):", allDurations: "All durations",
        min60: "1h (60 min) or less", min90: "1.5h (90 min) or less", min120: "2h (120 min) or less",
        reset: "Reset", noResults: "Sorry, no services match your criteria. 🏄‍♂️"
    }
};

function ServiceList() {
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const [servicesList, setServicesList] = useState([]);
    const [displayedServices, setDisplayedServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(''); 
    const [maxDuration, setMaxDuration] = useState('');

    useEffect(() => {
        fetch('http://localhost:3001/catalog/services')
            .then(response => response.json())
            .then(data => {
                setServicesList(data);
                setDisplayedServices(data);
            })
            .catch(error => console.error('Erreur lors de la récupération des prestations :', error));
    }, []);

    useEffect(() => {
        let filtered = servicesList.filter(service => {
            const matchSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
            const convertedPrice = service.basePrice * exchangeRates[currency];
            const matchPrice = maxPrice === '' || convertedPrice <= Number(maxPrice);
            const matchDuration = maxDuration === '' || Number(service.defaultDuration) <= Number(maxDuration);
            return matchSearch && matchPrice && matchDuration;
        });

        setDisplayedServices(filtered);
    }, [searchTerm, maxPrice, maxDuration, servicesList, currency]);

    const handleReset = (e) => {
        e.preventDefault();
        setSearchTerm('');
        setMaxPrice('');
        setMaxDuration('');
    };

    return (
        <div className="home">
            <div className="shopping-page">
                <div className="filter-topbar">
                    <form className="filter-form">
                        <div className="filter-group">
                            <label>{t.searchLabel}</label>
                            <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>

                        <div className="filter-group">
                            <label>{t.budgetLabel} ({symbols[currency]}) :</label>
                            <input type="number" min="0" step="1" placeholder={t.budgetPlaceholder} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                        </div>

                        <div className="filter-group">
                            <label>{t.durationLabel}</label>
                            <select value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)}>
                                <option value="">{t.allDurations}</option>
                                <option value="60">{t.min60}</option>
                                <option value="90">{t.min90}</option>
                                <option value="120">{t.min120}</option>
                            </select>
                        </div>
                        <button className="btn-reset" onClick={handleReset}>{t.reset}</button>
                    </form>
                </div>

                <main className="article-container">
                    {displayedServices.length === 0 ? (
                        <div className="no-results-message">
                            <p>{t.noResults}</p>
                        </div>
                    ) : (
                        displayedServices.map((service) => (
                            <ServiceCard key={service.idTypeService} service={service} />
                        ))
                    )}
                </main>
            </div>
            <Footer/>
        </div>
    );
}
export default ServiceList;