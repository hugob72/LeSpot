import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import OrderCollapse from '../../components/client/OrderCollapse';
import '../../styles/home.css';
import '../../styles/myOrders.css';

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const history = useHistory();
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }

        fetch(`http://localhost:3001/order/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur lors de la récupération des commandes:", err);
                setLoading(false);
            });
    }, [userId, history]);

    const toggleOrder = (idOrder) => {
        if (expandedOrder === idOrder) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(idOrder);
        }
    };

    if (loading) return <div className="my-orders-loading">Chargement de vos commandes...</div>;

    return (
        <div className="home">
            <Header />
            <div className="container my-orders-container">
                <h1 className="my-orders-title">Mes Commandes</h1>

                {orders.length === 0 ? (
                    <p>Vous n'avez passé aucune commande pour le moment.</p>
                ) : (
                    <div className="my-orders-list">
                        {orders.map(order => (
                            <OrderCollapse 
                                key={order.idOrder} 
                                order={order} 
                                isExpanded={expandedOrder === order.idOrder} 
                                toggleOrder={toggleOrder} 
                            />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default MyOrders;