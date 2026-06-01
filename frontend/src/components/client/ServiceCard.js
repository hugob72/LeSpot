import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/article.css'; 

function ServiceCard({ service }) {
    return (
        <Link to={`/service/${service.idTypeService}`} className="card-link">
            {/* Ajout de la classe "service-card" ici */}
            <div className="card service-card"> 
                {/* Ajout de la classe "service-card-image" ici */}
                <img src={service.image || 'https://via.placeholder.com/300x200?text=Service'} alt={service.name} className="card-image service-card-image"/>
                
                <div className="card-content">
                    <p className="card-price">À partir de {Number(service.basePrice).toFixed(2)}€</p>
                    <p className="truncate" style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{service.name}</p>
                    <p style={{fontSize: '0.85rem', color: '#7f8c8d'}}>⏱️ Durée : {service.defaultDuration} min</p>
                </div>
                
                <div className="area-button">
                    <button className="button" style={{backgroundColor: '#48A3AE'}}>
                        Voir les disponibilités
                    </button>
                </div>
            </div>
        </Link>
    );
}

export default ServiceCard;