import { Link, useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';
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
        profile: "Mon Profil",
        favorites: "Mes Favoris",
        orders: "Mes commandes",
        bookings: "Mes réservations",
        complaintsUser: "Faire une réclamation",
        complaints: "Mes réclamations",
        reviews: "Mes avis",
        contact: "Contact",
        admin: "Admin",
        logout: "Se déconnecter"
    },
    en: {
        home: "Home",
        services: "Our services",
        promotions: "Promotions",
        preferences: "Preferences",
        login: "Login",
        profile: "My Profile",
        favorites: "My Favorites",
        orders: "My Orders",
        bookings: "My Bookings",
        complaintsUser: "Make a complaint",
        complaints: "My Complaints",
        reviews: "My Reviews",
        contact: "Contact",
        admin: "Admin",
        logout: "Logout"
    }
};

function Header() {
    const { theme, language } = useContext(PreferencesContext);
    const { cartItems } = useContext(CartContext); 
    const history = useHistory();
    const t = translations[language] || translations.fr;
    const totalQuantity = cartItems.reduce((acc, item) => acc + (parseInt(item.quantity) || 0), 0);

    // État pour gérer l'ouverture du menu déroulant au survol
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');


    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        history.push('/login');
    };

    return (
        <div className={`header ${theme === 'dark' ? 'dark-mode' : (theme === 'water' ? 'water-mode' : 'light-mode')}`}>
            <img src={Logo} alt="Logo" className="logo" />
            
            <ul className="nav-links">
                <li><Link to="/">{t.home}</Link></li>
                <li><Link to="/services">{t.services}</Link></li>
                <li><Link to="/promotions">{t.promotions}</Link></li>
                {(!userId) && <li><Link to="/create-complaint">{t.complaintsUser}</Link></li> }
                {/* <li><Link to="/contact">{t.contact}</Link></li> */}
                {(userId && role === "admin") && <li><Link to="/admin">{t.admin}</Link></li> }
            </ul>

            {/* Zone de droite avec les icônes */}
            <div className="header-icons-wrapper">
                
                {/* MENU DÉROULANT DU COMPTE */}
                <div 
                    className="account-icon-wrapper"
                    onMouseEnter={() => setIsAccountOpen(true)}
                    onMouseLeave={() => setIsAccountOpen(false)}
                >
                    <div className="account-icon">
                        {/* Icône Utilisateur */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>

                    <div className={`account-dropdown ${isAccountOpen ? 'open' : ''}`}>
                        <ul className="account-dropdown-list">
                            {userId ? (
                                <>
                                    <li><Link to="/profile">{t.profile}</Link></li>
                                    <li><Link to="/favoris">{t.favorites}</Link></li>
                                    <li><Link to="/orders">{t.orders}</Link></li>
                                    <li><Link to="/bookings">{t.bookings}</Link></li>
                                    <li><Link to="/complaints">{t.complaints}</Link></li>
                                    <li><Link to="/reviews">{t.reviews}</Link></li>
                                    <li className="logout-btn" onClick={handleLogout}>{t.logout}</li>
                                </>
                            ) : (
                                <li><Link to="/login">{t.login}</Link></li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* ICÔNE DU PANIER */}
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
        </div>
    )
}

export default Header;