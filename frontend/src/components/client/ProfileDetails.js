import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../../styles/Profile.css';

function ProfileDetails() {
    const userId = localStorage.getItem('userId');
    const history = useHistory();

    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        address: '',
        postalCode: '',
        city: '',
        country: '',
        paymentPreference: ''
    });

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }
        
        // Fetch user data
        fetch(`http://localhost:3001/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                console.log(data)
                setEditForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    postalCode: data.postalCode || '',
                    city: data.city || '',
                    country: data.country || '',
                    paymentPreference: data.paymentPreference === null ? 'Aucun' : data.paymentPreference
                });
            })
            .catch(err => console.error('Erreur lors de la récupération du profil', err));
    }, [userId, history]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        history.push('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3001/user/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(editForm)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erreur lors de la mise à jour');
            return res.json();
        })
        .then(() => {
            setUser(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
        })
        .catch(err => console.error(err));
    };

    if (!user) return <div className="profile-container"><div>Chargement du profil...</div></div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2 className="profile-title">Bienvenue sur votre espace, {user.firstName} !</h2>
                <div>
                    {!isEditing && (
                        <button className="btn-primary" style={{ marginRight: '15px' }} onClick={() => setIsEditing(true)}>
                            Modifier mes informations
                        </button>
                    )}
                    <button className="btn-danger" onClick={handleLogout}>Se déconnecter</button>
                </div>
            </div>

            {!isEditing ? (
                <div className="profile-layout">
                    {/* Colonne de Gauche : Informations Personnelles */}
                    <div className="profile-section">
                        <h3 className="profile-subtitle">Informations Personnelles</h3>
                        <ul className="profile-list">
                            <li><span className="profile-label">Id :</span> <span className="profile-value">{user.idUser}</span></li>
                            <li><span className="profile-label">Nom :</span> <span className="profile-value">{user.lastName}</span></li>
                            <li><span className="profile-label">Prénom :</span> <span className="profile-value">{user.firstName}</span></li>
                            <li><span className="profile-label">Email :</span> <span className="profile-value">{user.email}</span></li>
                            <li><span className="profile-label">Numéro de téléphone :</span> <span className="profile-value">{user.phoneNumber}</span></li>
                            <li><span className="profile-label">Adresse :</span> <span className="profile-value">{user.address}</span></li>
                            <li><span className="profile-label">Code postal :</span> <span className="profile-value">{user.postalCode}</span></li>
                            <li><span className="profile-label">Ville :</span> <span className="profile-value">{user.city}</span></li>
                            <li><span className="profile-label">Pays :</span> <span className="profile-value">{user.country}</span></li>
                        </ul>
                    </div>

                    {/* Colonne de Droite : Préférences */}
                    <div className="profile-section">
                        <h3 className="profile-subtitle">Mes Préférences</h3>
                        <ul className="profile-list">
                            <li><span className="profile-label">Préférence de paiement :</span> <span className="profile-value">{user.paymentPreference || 'Aucun'}</span></li>
                            {/* Espace prévu pour les futures préférences */}
                        </ul>
                    </div>
                </div>
            ) : (
                <form className="profile-form" onSubmit={handleSave}>
                    <div className="profile-layout">
                        {/* Colonne de Gauche : Edition Infos Personnelles */}
                        <div className="profile-section">
                            <h3 className="profile-subtitle">Modifier mes informations</h3>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Nom : </label>
                                <input className="form-input" type="text" name="lastName" value={editForm.lastName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Prénom : </label>
                                <input className="form-input" type="text" name="firstName" value={editForm.firstName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Numéro de téléphone : </label>
                                <input className="form-input" type="tel" name="phoneNumber" value={editForm.phoneNumber} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Adresse : </label>
                                <input className="form-input" type="text" name="address" value={editForm.address} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Code postal : </label>
                                <input className="form-input" type="text" name="postalCode" value={editForm.postalCode} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>Ville : </label>
                                <input className="form-input" type="text" name="city" value={editForm.city} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>Pays : </label>
                                <input className="form-input" type="text" name="country" value={editForm.country} onChange={handleInputChange} />
                            </div>
                        </div>

                        {/* Colonne de Droite : Edition Préférences */}
                        <div className="profile-section">
                            <h3 className="profile-subtitle">Modifier mes préférences</h3>
                            <div className="form-group">
                                <label>Préférence de paiement : </label>
                                <select className="form-select" name="paymentPreference" value={editForm.paymentPreference} onChange={handleInputChange}>
                                    <option value="Carte bancaire">Carte bancaire</option>
                                    <option value="Paypal">Paypal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-primary" type="submit">Sauvegarder les modifications</button>
                        <button className="btn-secondary" type="button" onClick={() => setIsEditing(false)}>Annuler</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ProfileDetails;