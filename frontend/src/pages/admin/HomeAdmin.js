import React from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import '../../styles/homeAdmin.css';
import Logo from '../../assets/LeSpotLogo.png';
import AdminStock from '../../components/admin/AdminStock';

function HomeAdmin() {
    return (
        <div className="admin-layout">
            
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <img src={Logo} alt="Logo" className="admin-logo" />
                </div>
                <ul className="admin-menu-list">
                    <Link to="/admin/dashboard" className="admin-menu-item">📊 Dashboard</Link>
                    <Link to="/admin/stock" className="admin-menu-item">🏄‍♂️ Articles</Link>
                    <Link to="/admin/dashboard" className="admin-menu-item">📦 Commandes</Link>
                    <Link to="/admin/dashboard" className="admin-menu-item">📅 Services & Cours</Link>
                    <Link to="/admin/dashboard" className="admin-menu-item">⚠️ Litiges</Link>
                    <Link to="/admin/dashboard" className="admin-menu-item">👨‍💻 Comptes</Link>
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
                            <Route path="/admin/stock">
                                <AdminStock />
                            </Route>
                        </Switch>
                    </div>
                </main>

            </div>
        </div>
    );
}

export default HomeAdmin;