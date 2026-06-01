import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import '../../styles/homeAdmin.css';
import Logo from '../../assets/LeSpotLogo.png';
import AdminStock from '../../components/admin/AdminStock';
import AddArticle from '../../components/admin/AddArticle';
import AdminCommandes from '../../components/admin/AdminCommandes';
import AdminCommandeDetails from '../../components/admin/AdminCommandeDetails';
import AdminComplaints from '../../components/admin/AdminComplaints';
import AdminComplaintDetail from '../../components/admin/AdminComplaintDetail';
import AdminUsers from '../../components/admin/AdminUser';


function HomeAdmin() {
    return (
        <div className="admin-layout">
            
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <img src={Logo} alt="Logo" className="admin-logo" />
                </div>
                <ul className="admin-menu-list">
                    <Link to="/admin/dashboard" className="admin-menu-item">Dashboard</Link>
                    <Link to="/admin/stock" className="admin-menu-item">Articles</Link>
                    <Link to="/admin/commandes" className="admin-menu-item">Commandes</Link>
                    <Link to="/admin/dashboard" className="admin-menu-item">Services & Cours</Link>
                    <Link to="/admin/litiges" className="admin-menu-item">Litiges</Link>
                    <Link to="/admin/users" className="admin-menu-item">Comptes</Link>
                </ul>
            </aside>

            <div className="admin-main-area">
                
                <header className="admin-header">
                    <h2>Administration</h2>
                    <Link to="/" className="admin-user-profile">Retour</Link>
                </header>

                <main className="admin-content-wrapper">
                    <div className="admin-content-card">
                        <Switch>
                            <Route exact path="/admin/dashboard">

                            </Route>
                            <Route exact path="/admin/stock">
                                <AdminStock />
                            </Route>
                            <Route path="/admin/stock/add-article/:idArticle">
                                <AddArticle />
                            </Route>
                            <Route path="/admin/stock/add-article">
                                <AddArticle />
                            </Route>
                            <Route exact path="/admin/commandes">
                                <AdminCommandes />
                            </Route>
                            <Route path="/admin/commandes/:idOrder">
                                <AdminCommandeDetails />
                            </Route>
                            <Route exact path="/admin/litiges">
                                <AdminComplaints />
                            </Route>
                            <Route path="/admin/litiges/:idComplaint">
                                <AdminComplaintDetail />
                            </Route>
                            <Route path="/admin/users">
                                <AdminUsers />
                            </Route>
                        </Switch>
                    </div>
                </main>

            </div>
        </div>
    );
}

export default HomeAdmin;