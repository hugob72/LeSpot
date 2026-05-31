import React from 'react';

const statusSteps = ['payee', 'preparation', 'expediee', 'livree'];
const statusLabels = {
    'en_attente': 'En attente',
    'payee': 'En cours (Payée)',
    'preparation': 'En préparation',
    'expediee': 'En livraison',
    'livree': 'Livrée',
    'annulee': 'Annulée'
};

function OrderCollapse({ order, isExpanded, toggleOrder }) {
    const orderTotal = order.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);

    // Calculate progress for breadcrumb
    let currentStepIndex = statusSteps.indexOf(order.currentStatus);
    if (currentStepIndex === -1 && order.currentStatus === 'en_attente') currentStepIndex = 0; // fallback

    return (
        <div className="order-collapse-container">
            {/* En-tête de la commande (cliquable) */}
            <div 
                onClick={() => toggleOrder(order.idOrder)}
                className="order-collapse-header"
            >
                <div className="order-collapse-header-left">
                    <h3>Commande n°{order.idOrder}</h3>
                    <span className="order-collapse-date">
                        Passée le {new Date(order.date).toLocaleDateString('fr-FR')}
                    </span>
                </div>
                <div className="order-collapse-header-right">
                <p className="order-collapse-total">{orderTotal.toFixed(2)} €</p>
                <span className="order-collapse-toggle-text">
                    {isExpanded ? '▲ Voir moins' : '▼ Voir plus'}
                </span>
                </div>
                </div>

                {/* Détails de la commande (dépliant) */}
                {isExpanded && (
                <div className="order-collapse-content">
                <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '15px'}}>
                    <button 
                        className="btn-reclamation" 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            window.location.href = `/create-complaint?orderId=${order.idOrder}`; 
                        }}
                        style={{ padding: '8px 15px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Réclamation
                    </button>
                </div>

                {/* Fil d'ariane / Barre de progression */}                    {order.currentStatus !== 'annulee' ? (
                        <div className="order-progress-container">
                            {/* Ligne de fond */}
                            <div className="order-progress-line"></div>
                            
                            {statusSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step} className="order-progress-step">
                                        <div className={`order-progress-circle ${isCompleted ? 'completed' : 'pending'}`}>
                                            {isCompleted ? '✓' : index + 1}
                                        </div>
                                        <span className={`order-progress-label ${isCompleted ? 'completed' : 'pending'}`}>
                                            {statusLabels[step]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="order-cancelled-msg">
                            Cette commande a été annulée.
                        </div>
                    )}

                    {/* Liste des articles */}
                    <h4 className="order-items-title">Articles commandés</h4>
                    <div className="order-items-list">
                        {order.items.map(item => (
                            <div key={item.idItem} className="order-item">
                                <img src={item.image} alt={item.name} className="order-item-img" />
                                <div className="order-item-info">
                                    <h5 className="order-item-name">{item.name}</h5>
                                    <p className="order-item-quantity">Quantité : {item.quantity}</p>
                                </div>
                                <div className="order-item-price">
                                    {(item.unitPrice * item.quantity).toFixed(2)} €
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