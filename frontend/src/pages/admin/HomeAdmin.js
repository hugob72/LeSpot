import React, { useContext } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider'; // Ajout du context
import '../../styles/homeAdmin.css';
import Logo from '../../assets/LeSpotLogo.png';
import AdminStock from '../../components/admin/AdminStock';
import AddArticle from '../../components/admin/AddArticle';
import AdminCommandes from '../../components/admin/AdminCommandes';
import AdminCommandeDetails from '../../components/admin/AdminCommandeDetails';
import AdminComplaints from '../../components/admin/AdminComplaints';
import AdminComplaintDetail from '../../components/admin/AdminComplaintDetail';
import AdminUsers from '../../components/admin/AdminUser';
import AdminServices from '../../components/admin/AdminServices';
import AddService from '../../components/admin/AddService';
import AdminPromotions from '../../components/admin/AdminPromotions';
import AddPromotion from '../../components/admin/AddPromotion';

const translations = {
    fr: {
        dashboard: "Dashboard", articles: "Articles", orders: "Commandes",
        services: "Services & Cours", disputes: "Litiges", promos: "Promotions",
        accounts: "Comptes", adminTitle: "Administration", back: "Retour"
    },
    en: {
        dashboard: "Dashboard", articles: "Items", orders: "Orders",
        services: "Services & Classes", disputes: "Disputes", promos: "Promotions",
        accounts: "Accounts", adminTitle: "Administration", back: "Back"
    }
};

function HomeAdmin() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    return (
        <div className={`admin-layout ${theme === 'dark' ? 'dark-mode' : ''}`}>
            
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <img src={Logo} alt="Logo" className="admin-logo" />
                </div>
                <ul className="admin-menu-list">
                    <Link to="/admin/dashboard" className="admin-menu-item">{t.dashboard}</Link>
                    <Link to="/admin/stock" className="admin-menu-item">{t.articles}</Link>
                    <Link to="/admin/commandes" className="admin-menu-item">{t.orders}</Link>
                    <Link to="/admin/services" className="admin-menu-item">{t.services}</Link>
                    <Link to="/admin/litiges" className="admin-menu-item">{t.disputes}</Link>
                    <Link to="/admin/promotions" className="admin-menu-item">{t.promos}</Link>
                    <Link to="/admin/users" className="admin-menu-item">{t.accounts}</Link>
                </ul>
            </aside>

            <div className="admin-main-area">
                <header className="admin-header">
                    <h2>{t.adminTitle}</h2>
                    <Link to="/" className="admin-user-profile">{t.back}</Link>
                </header>

                <main className="admin-content-wrapper">
                    <div className="admin-content-card">
                        <Switch>
                            <Route exact path="/admin/dashboard"></Route>
                            <Route exact path="/admin/stock"><AdminStock /></Route>
                            <Route path="/admin/stock/add-article/:idArticle"><AddArticle /></Route>
                            <Route path="/admin/stock/add-article"><AddArticle /></Route>
                            <Route exact path="/admin/commandes"><AdminCommandes /></Route>
                            <Route path="/admin/commandes/:idOrder"><AdminCommandeDetails /></Route>
                            <Route path="/admin/services"><AdminServices /></Route>
                            <Route exact path="/admin/add-service"><AddService /></Route>
                            <Route path="/admin/add-service/:idService"><AddService /></Route>
                            <Route exact path="/admin/promotions"><AdminPromotions /></Route>
                            <Route exact path="/admin/add-promotion"><AddPromotion /></Route>
                            <Route path="/admin/add-promotion/:idPromotion"><AddPromotion /></Route>
                            <Route exact path="/admin/litiges"><AdminComplaints /></Route>
                            <Route path="/admin/litiges/:idComplaint"><AdminComplaintDetail /></Route>
                            <Route path="/admin/users"><AdminUsers /></Route>
                        </Switch>
                    </div>
                </main>
            </div>
        </div>
    );
}
export default HomeAdmin;