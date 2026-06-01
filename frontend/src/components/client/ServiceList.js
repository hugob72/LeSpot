import React, { useState, useEffect } from 'react';
import ServiceCard from '../../components/client/ServiceCard'; // Le nouveau composant
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import '../../styles/shoppingList.css'; // On réutilise le style de la boutique

function ServiceList() {
    const [servicesList, setServicesList] = useState([]);
    const [displayedServices, setDisplayedServices] = useState([]);

    // États pour les filtres
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(''); 
    const [maxDuration, setMaxDuration] = useState('');

    useEffect(() => {
        // On interroge notre nouvelle route backend
        fetch('http://localhost:3001/catalog/services')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setServicesList(data);
                    setDisplayedServices(data);
                }
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des prestations :', error);
            });
    }, []);

    // Filtrage dynamique
    useEffect(() => {
        let filtered = servicesList.filter(service => {
            const matchSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchPrice = maxPrice === '' || Number(service.basePrice) <= Number(maxPrice);
            const matchDuration = maxDuration === '' || Number(service.defaultDuration) <= Number(maxDuration);

            return matchSearch && matchPrice && matchDuration;
        });

        setDisplayedServices(filtered);
    }, [searchTerm, maxPrice, maxDuration, servicesList]);

    const handleReset = (e) => {
        e.preventDefault();
        setSearchTerm('');
        setMaxPrice('');
        setMaxDuration('');
    };

    return (
        <div className="home">
            <div className="shopping-page">
                
                {/* BARRE DE FILTRES */}
                <div className="filter-topbar">
                    <form className="filter-form">
                        <div className="filter-group">
                            <label>Rechercher un cours :</label>
                            <input 
                                type="text" 
                                placeholder="Surf, Paddle..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Budget max (€) :</label>
                            <input 
                                type="number" 
                                min="0"
                                step="1" 
                                placeholder="Ex: 50" 
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>Durée max (minutes) :</label>
                            <select value={maxDuration} onChange={(e) => setMaxDuration(e.target.value)}>
                                <option value="">Toutes les durées</option>
                                <option value="60">1h (60 min) ou moins</option>
                                <option value="90">1h30 (90 min) ou moins</option>
                                <option value="120">2h (120 min) ou moins</option>
                            </select>
                        </div>

                        <button className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                    </form>
                </div>

                {/* LISTE DES PRESTATIONS */}
                <main className="article-container">
                    {displayedServices.length === 0 ? (
                        <div className="no-results-message">
                            <p>Désolé, aucune prestation ne correspond à vos critères. 🏄‍♂️</p>
                        </div>
                    ) : (
                        displayedServices.map((service) => (
                            <ServiceCard key={service.idTypeService} service={service} />
                        ))
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default ServiceList;