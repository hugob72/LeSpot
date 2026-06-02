import { Link, useHistory } from 'react-router-dom';
import { useContext } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import { CartContext } from '../../context/CartContext';
import Logo from '../../assets/LeSpotLogo.png';
import '../../styles/header.css';

const translations = {
    fr: {
        home: "Accueil",
        services: "Nos services",
        promotions: "Promotions",
        preferences: "Préférences",
        login: "Connexion",
        favorites: "Mes Favoris",
        orders: "Mes commandes",
        bookings: "Mes réservations",
        complaints: "Mes réclamations",
        reviews: "Mes avis",
        contact: "Contact",
        admin: "Admin"
    },
    en: {
        home: "Home",
        services: "Our services",
        promotions: "Promotions",
        preferences: "Preferences",
        login: "Login",
        favorites: "My Favorites",
        orders: "My Orders",
        bookings: "My Bookings",
        complaints: "My Complaints",
        reviews: "My Reviews",
        contact: "Contact",
        admin: "Admin"
    }
};

function Header() {
    const { theme, language, currency } = useContext(PreferencesContext);
    const { cartItems } = useContext(CartContext); 
    const history = useHistory();
    const t = translations[language] || translations.fr;
    const totalQuantity = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

    return (
        <div className={`header ${theme ? 'dark-mode' : ''}`}>
            <img src={Logo} alt="Logo" className="logo" />
            <ul className="nav-links">
                <li><Link to="/">{t.home}</Link></li>
                <li><Link to="/services">{t.services}</Link></li>
                <li><Link to="/promotions">{t.promotions}</Link></li>
                <li><Link to="/preferences">{t.preferences}</Link></li>
                <li><Link to="/login">{t.login}</Link></li>
                <li><Link to="/favoris">{t.favorites}</Link></li>
                <li><Link to="/orders">{t.orders}</Link></li>
                <li><Link to="/bookings">{t.bookings}</Link></li>
                <li><Link to="/complaints">{t.complaints}</Link></li>
                <li><Link to="/reviews">{t.reviews}</Link></li>
                <li><Link to="/contact">{t.contact}</Link></li>
                <li><Link to="/admin">{t.admin}</Link></li>
            </ul>

            <div className="cart-icon-wrapper">
                <div className="cart-icon" onClick={() => history.push('/cart')}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {totalQuantity > 0 && (
                        <span className="cart-badge">{totalQuantity}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Header;