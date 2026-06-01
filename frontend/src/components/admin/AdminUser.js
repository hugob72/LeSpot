import React, { useEffect, useState } from "react";
import "../../styles/adminStock.css";

function AdminUsers() {
    // États pour les données
    const [usersList, setUsersList] = useState([]);
    const [displayedUsers, setDisplayedUsers] = useState([]);
    
    // États pour les filtres
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');
    const [filterRole, setFilterRole] = useState('');

    // 1. Récupération des données
    const fetchUsers = () => {
        fetch('http://localhost:3001/user')
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsersList(data);
                    setDisplayedUsers(data);
                } else {
                    console.error("Erreur backend:", data);
                    setUsersList([]);
                    setDisplayedUsers([]);
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des utilisateurs :', error));
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Logique de filtrage dynamique
    useEffect(() => {
        let filtered = usersList.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const matchName = searchName === '' || fullName.includes(searchName.toLowerCase());
            const matchEmail = searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase());
            const matchRole = filterRole === '' || user.role === filterRole;

            return matchName && matchEmail && matchRole;
        });

        setDisplayedUsers(filtered);
    }, [searchName, searchEmail, filterRole, usersList]);

    // 3. Réinitialisation des filtres
    const resetFilters = (e) => {
        e.preventDefault();
        setSearchName('');
        setSearchEmail('');
        setFilterRole('');
    };

    // 4. Changer le rôle (Client <-> Admin)
    const handleRoleChange = (idUser, currentRole) => {
        const newRole = currentRole === 'admin' ? 'client' : 'admin';
        const confirmMsg = newRole === 'admin' 
            ? "Voulez-vous promouvoir cet utilisateur en Gestionnaire ?" 
            : "Voulez-vous révoquer les droits de cet utilisateur pour le repasser Client ?";

        if (window.confirm(confirmMsg)) {
            fetch(`http://localhost:3001/user/${idUser}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    // Mise à jour de l'affichage en temps réel
                    setUsersList(usersList.map(u => u.idUser === idUser ? { ...u, role: newRole } : u));
                }
            })
            .catch(err => console.error('Erreur changement de rôle:', err));
        }
    };

    // 5. Supprimer un utilisateur
    const handleDeleteUser = (idUser) => {
        if (window.confirm("⚠️ La suppression d'un compte est définitive. Toutes les commandes, réclamations et avis associés seront également supprimés.\n Voulez-vous continuer ?")) {
            fetch(`http://localhost:3001/user/${idUser}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    // Met à jour la liste en retirant l'utilisateur supprimé
                    setUsersList(usersList.filter(u => u.idUser !== idUser));
                    alert("Le compte a été supprimé avec succès.");
                }
            })
            .catch(err => console.error('Erreur suppression:', err));
        }
    };

    // Utilitaires d'affichage
    const getRoleClass = (role) => {
        return role === 'admin' ? 'in-stock' : ''; // Admin en vert clair, client en normal
    };

    return (
        <div>
            <div className="admin-table-header">
                <h3>Gestion des Comptes Utilisateurs</h3>
            </div>
            
            {/* BARRE DE FILTRES */}
            <div className="admin-filters-bar">
                <div className="admin-filter-group">
                    <label>Nom ou Prénom :</label>
                    <input 
                        type="text" 
                        placeholder="Ex: Dupont" 
                        value={searchName} 
                        onChange={(e) => setSearchName(e.target.value)} 
                        className="admin-filter-input"
                    />
                </div>

                <div className="admin-filter-group">
                    <label>Email :</label>
                    <input 
                        type="text" 
                        placeholder="Ex: email@domaine.com" 
                        value={searchEmail} 
                        onChange={(e) => setSearchEmail(e.target.value)} 
                        className="admin-filter-input"
                    />
                </div>

                <div className="admin-filter-group">
                    <label>Rôle :</label>
                    <select 
                        value={filterRole} 
                        onChange={(e) => setFilterRole(e.target.value)} 
                        className="admin-filter-input"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="client">Client</option>
                        <option value="admin">Gestionnaire (Admin)</option>
                    </select>
                </div>

                <button className="admin-btn-reset" onClick={resetFilters}>Réinitialiser</button>
            </div>
            
            {/* TABLEAU DES RÉSULTATS */}
            <div className="table-responsive">
                {displayedUsers.length === 0 ? (
                    <div className="admin-no-results">
                        <p>Aucun utilisateur ne correspond à ces critères.</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedUsers.map((user) => (
                                <tr key={user.idUser}>
                                    <td>#{user.idUser}</td>
                                    <td className="admin-table-name">{user.lastName}</td>
                                    <td className="admin-table-name">{user.firstName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phoneNumber || '-'}</td>
                                    <td>
                                        <span className="admin-table-name">
                                            {user.role === 'admin' ? 'Admin' : 'Client'}
                                        </span>
                                    </td>
                                    <td style={{ minWidth: '120px' }}>
                                        {/* Bouton Changer de Rôle */}
                                        <button 
                                            className="action-btn edit-btn" 
                                            onClick={() => handleRoleChange(user.idUser, user.role)}
                                            title={user.role === 'admin' ? "Rétrograder en client" : "Promouvoir Gestionnaire"}
                                        >
                                            {user.role === 'admin' ? '👤' : '👑'}
                                        </button>
                                        
                                        {/* Bouton Supprimer */}
                                        <button 
                                            className="action-btn delete-btn" 
                                            onClick={() => handleDeleteUser(user.idUser)}
                                            title="Supprimer le compte"
                                            style={{ color: '#e74c3c' }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminUsers;