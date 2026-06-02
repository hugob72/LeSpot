import React, { useContext } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider'; // Vérifie le chemin

const statusSteps = ['payee', 'preparation', 'expediee', 'livree'];

const translations = {
    fr: {
        orderNum: "Commande n°",
        placedOn: "Passée le",
        seeLess: "▲ Voir moins",
        seeMore: "▼ Voir plus",
        complaint: "Réclamation",
        cancelledMsg: "Cette commande a été annulée.",
        itemsOrdered: "Articles commandés",
        qty: "Quantité :",
        status: {
            'en_attente': 'En attente',
            'payee': 'En cours (Payée)',
            'preparation': 'En préparation',
            'expediee': 'En livraison',
            'livree': 'Livrée',
            'annulee': 'Annulée'
        }
    },
    en: {
        orderNum: "Order #",
        placedOn: "Placed on",
        seeLess: "▲ See less",
        seeMore: "▼ See more",
        complaint: "Complaint",
        cancelledMsg: "This order has been cancelled.",
        itemsOrdered: "Items ordered",
        qty: "Quantity:",
        status: {
            'en_attente': 'Pending',
            'payee': 'Processing (Paid)',
            'preparation': 'In preparation',
            'expediee': 'In delivery',
            'livree': 'Delivered',
            'annulee': 'Cancelled'
        }
    }
};

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

function OrderCollapse({ order, isExpanded, toggleOrder }) {
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

    const orderTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    let currentStepIndex = statusSteps.indexOf(order.currentStatus);
    if (currentStepIndex === -1 && order.currentStatus === 'en_attente') currentStepIndex = 0;

    return (
        <div className="order-collapse-container">
            <div onClick={() => toggleOrder(order.idOrder)} className="order-collapse-header">
                <div className="order-collapse-header-left">
                    <h3>{t.orderNum}{order.idOrder}</h3>
                    <span className="order-collapse-date">
                        {t.placedOn} {new Date(order.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                    </span>
                </div>
                <div className="order-collapse-header-right">
                    <p className="order-collapse-total">{formatPrice(orderTotal)}</p>
                    <span className="order-collapse-toggle-text">
                        {isExpanded ? t.seeLess : t.seeMore}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="order-collapse-content">
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                        <button className="btn-reclamation" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                window.location.href = `/create-complaint?orderId=${order.idOrder}`; 
                            }}
                            style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {t.complaint}
                        </button>
                    </div>

                    {order.currentStatus !== 'annulee' ? (
                        <div className="order-progress-container">
                            <div className="order-progress-line"></div>
                            {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step} className="order-progress-step">
                                        <div className={`order-progress-circle ${isCompleted ? 'completed' : 'pending'}`}>
                                            {isCompleted ? '✓' : index + 1}
                                        </div>
                                        <span className={`order-progress-label ${isCompleted ? 'completed' : 'pending'}`}>
                                            {t.status[step]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="order-cancelled-msg">
                            {t.cancelledMsg}
                        </div>
                    )}

                    <h4 className="order-items-title">{t.itemsOrdered}</h4>
                    <div className="order-items-list">
                        {order.items.map(item => (
                            <div key={item.idItem} className="order-item">
                                <img src={item.image} alt={item.name} className="order-item-img" />
                                <div className="order-item-info">
                                    <h5 className="order-item-name">{item.name}</h5>
                                    <p className="order-item-quantity">{t.qty} {item.quantity}</p>
                                </div>
                                <div className="order-item-price">
                                    {formatPrice(item.unitPrice * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
export default OrderCollapse;