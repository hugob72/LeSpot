import { Link, useHistory } from 'react-router-dom';
import { useContext } from 'react';
import { StyleContext } from '../../context/StyleContextProvider';
import { CartContext } from '../../context/CartContext';
import Logo from '../../assets/LeSpotLogo.png';
import '../../styles/header.css';

function Header() {
    const { theme } = useContext(StyleContext);
    const { cartItems } = useContext(CartContext); 
    const history = useHistory();

    // Calcul de la quantité totale d'articles pour le badge
    const totalQuantity = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

    return (
        <div className={`header ${theme ? 'dark-mode' : ''}`}>
            <img src={Logo} alt="Logo" className="logo" />
            <ul className="nav-links">
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/services">Nos services</Link></li>
                <li><Link to="/promotions">Promotions</Link></li>
                <li><Link to="/preferences">Préférences</Link></li>
                <li><Link to="/login">Connexion</Link></li>
                <li><Link to="/favoris">Mes Favoris</Link></li>
                <li><Link to="/orders">Mes commandes</Link></li>
                <li><Link to="/bookings">Mes réservations</Link></li>
                <li><Link to="/complaints">Mes réclamations</Link></li>
                <li><Link to="/reviews">Mes avis</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/admin">Admin</Link></li>
            </ul>

            {/* Zone de l'icône du panier (Redirige directement vers la page /cart) */}
            <div className="cart-icon-wrapper">
                <div className="cart-icon" onClick={() => history.push('/cart')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {/* Le badge n'apparait que si on a au moins 1 article */}
                    {totalQuantity > 0 && (
                        <span className="cart-badge">{totalQuantity}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;