import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/Profile.css';

const translations = {
    fr: {
        loading: "Chargement du profil...",
        welcome: "Bienvenue sur votre espace,",
        deleteBtn: "Supprimer mon compte",
        editBtn: "Modifier mes informations",
        logout: "Se déconnecter",
        personalInfo: "Informations Personnelles",
        lastName: "Nom",
        firstName: "Prénom",
        phone: "Numéro de téléphone",
        address: "Adresse",
        postalCode: "Code postal",
        city: "Ville",
        country: "Pays",
        preferences: "Mes Préférences",
        paymentPref: "Préférence de paiement",
        none: "Aucun",
        theme: "Thème",
        themeSunset: "Couché de soleil (Sombre)",
        themeSunrise: "Levé de soleil (Clair)",
        themeWater: "Océan (Bleu)",
        lang: "Langue",
        currency: "Devise",
        saveBtn: "Sauvegarder les modifications",
        cancelBtn: "Annuler",
        confirmDelete: "ATTENTION\n\nÊtes-vous sûr de vouloir supprimer définitivement votre compte ?\nCette action est irréversible et effacera toutes vos commandes, avis et favoris.",
        successDelete: "Votre compte et toutes vos données ont été supprimés avec succès. Au revoir !",
        errorDelete: "Une erreur est survenue lors de la suppression de votre compte.",
        editInfoTitle: "Modifier mes informations",
        editPrefTitle: "Modifier mes préférences",
        appTheme: "Thème de l'application"
    },
    en: {
        loading: "Loading profile...",
        welcome: "Welcome to your space,",
        deleteBtn: "Delete my account",
        editBtn: "Edit my information",
        logout: "Log out",
        personalInfo: "Personal Information",
        lastName: "Last name",
        firstName: "First name",
        phone: "Phone number",
        address: "Address",
        postalCode: "Postal code",
        city: "City",
        country: "Country",
        preferences: "My Preferences",
        paymentPref: "Payment preference",
        none: "None",
        theme: "Theme",
        themeSunset: "Sunset (Dark)",
        themeSunrise: "Sunrise (Light)",
        themeWater: "Ocean (Blue)",
        lang: "Language",
        currency: "Currency",
        saveBtn: "Save changes",
        cancelBtn: "Cancel",
        confirmDelete: "WARNING\n\nAre you sure you want to permanently delete your account?\nThis action is irreversible and will erase all your orders, reviews, and favorites.",
        successDelete: "Your account and all your data have been successfully deleted. Goodbye!",
        errorDelete: "An error occurred while deleting your account.",
        editInfoTitle: "Edit my information",
        editPrefTitle: "Edit my preferences",
        appTheme: "Application theme"
    }
};

function ProfileDetails() {
    const { theme, setTheme, language, setLanguage, currency, setCurrency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    
    const userId = localStorage.getItem('userId');
    const history = useHistory();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '', lastName: '', phoneNumber: '', address: '', postalCode: '', city: '', country: '', paymentPreference: ''
    });

    useEffect(() => {
        if (!userId) {
            history.push('/login');
            return;
        }
        fetch(`http://localhost:3001/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setUser(data);
                setEditForm({
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    phoneNumber: data.phoneNumber || '',
                    address: data.address || '',
                    postalCode: data.postalCode || '',
                    city: data.city || '',
                    country: data.country || '',
                    paymentPreference: data.paymentPreference === null ? t.none : data.paymentPreference
                });
            })
            .catch(error => console.error(error));
    }, [userId, history, t.none]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        history.push('/login');
    };

    const handleDeleteAccount = () => {
        const isConfirmed = window.confirm(t.confirmDelete);
        if (isConfirmed) {
            fetch(`http://localhost:3001/user/${userId}`, { method: 'DELETE' })
            .then(async res => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                alert(t.successDelete);
                localStorage.removeItem('userId');
                localStorage.removeItem('token');
                history.push('/');
            })
            .catch(err => {
                console.error(err);
                alert(t.errorDelete);
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3001/user/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erreur');
            return res.json();
        })
        .then(() => {
            setUser(prev => ({ ...prev, ...editForm }));
            setIsEditing(false);
        })
        .catch(err => console.error(err));
    };

    if (!user) return <div className="profile-container"><div>{t.loading}</div></div>;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2 className="profile-title">{t.welcome} {user.firstName} !</h2>
                <div>
                    {!isEditing && (
                        <>
                            <button className="btn-danger" style={{ marginRight: '15px', backgroundColor: '#ef4444' }} onClick={handleDeleteAccount}>
                                {t.deleteBtn}
                            </button>
                            <button className="btn-primary" style={{ marginRight: '15px' }} onClick={() => setIsEditing(true)}>
                                {t.editBtn}
                            </button>
                        </>
                    )}
                    
                    <button className="btn-danger" onClick={handleLogout}>{t.logout}</button>
                </div>
            </div>

            {!isEditing ? (
                <div className="profile-layout">
                    <div className="profile-section">
                        <h3 className="profile-subtitle">{t.personalInfo}</h3>
                        <ul className="profile-list">
                            <li><span className="profile-label">Id :</span> <span className="profile-value">{user.idUser}</span></li>
                            <li><span className="profile-label">{t.lastName} :</span> <span className="profile-value">{user.lastName}</span></li>
                            <li><span className="profile-label">{t.firstName} :</span> <span className="profile-value">{user.firstName}</span></li>
                            <li><span className="profile-label">Email :</span> <span className="profile-value">{user.email}</span></li>
                            <li><span className="profile-label">{t.phone} :</span> <span className="profile-value">{user.phoneNumber}</span></li>
                            <li><span className="profile-label">{t.address} :</span> <span className="profile-value">{user.address}</span></li>
                            <li><span className="profile-label">{t.postalCode} :</span> <span className="profile-value">{user.postalCode}</span></li>
                            <li><span className="profile-label">{t.city} :</span> <span className="profile-value">{user.city}</span></li>
                            <li><span className="profile-label">{t.country} :</span> <span className="profile-value">{user.country}</span></li>
                        </ul>
                    </div>

                    <div className="profile-section">
                        <h3 className="profile-subtitle">{t.preferences}</h3>
                        <ul className="profile-list">
                            <li><span className="profile-label">{t.paymentPref} :</span> <span className="profile-value">{user.paymentPreference || t.none}</span></li>
                            <li><span className="profile-label">{t.theme} :</span> 
                                <span className="profile-value">
                                    {theme === 'dark' ? t.themeSunset : (theme === 'water' ? t.themeWater : t.themeSunrise)}
                                </span>
                            </li>
                            <li><span className="profile-label">{t.lang} :</span> <span className="profile-value">{language === 'fr' ? 'Français' : 'English'}</span></li>
                            <li><span className="profile-label">{t.currency} :</span> <span className="profile-value">{currency}</span></li>
                        </ul>
                    </div>
                </div>
            ) : (
                <form className="profile-form" onSubmit={handleSave}>
                    <div className="profile-layout">
                        <div className="profile-section">
                            <h3 className="profile-subtitle">{t.editInfoTitle}</h3>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>{t.lastName} : </label>
                                <input className="form-input" type="text" name="lastName" value={editForm.lastName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>{t.firstName} : </label>
                                <input className="form-input" type="text" name="firstName" value={editForm.firstName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>{t.phone} : </label>
                                <input className="form-input" type="tel" name="phoneNumber" value={editForm.phoneNumber} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>{t.address} : </label>
                                <input className="form-input" type="text" name="address" value={editForm.address} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>{t.postalCode} : </label>
                                <input className="form-input" type="text" name="postalCode" value={editForm.postalCode} onChange={handleInputChange} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label>{t.city} : </label>
                                <input className="form-input" type="text" name="city" value={editForm.city} onChange={handleInputChange} />
                            </div>
                            <div className="form-group">
                                <label>{t.country} : </label>
                                <input className="form-input" type="text" name="country" value={editForm.country} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3 className="profile-subtitle">{t.editPrefTitle}</h3>
                            <div className="form-group">
                                <label>{t.paymentPref} : </label>
                                <select className="form-select" name="paymentPreference" value={editForm.paymentPreference} onChange={handleInputChange}>
                                    <option value="Carte bancaire">Carte bancaire / Credit Card</option>
                                    <option value="Paypal">Paypal</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>{t.appTheme} : </label>
                                <select className="form-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                                    <option value="light">{t.themeSunrise}</option>
                                    <option value="dark">{t.themeSunset}</option>
                                    <option value="water">{t.themeWater}</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>{t.lang} : </label>
                                <select className="form-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    <option value="fr">Français</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label>{t.currency} : </label>
                                <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                    <option value="EUR">€ (Euro)</option>
                                    <option value="USD">$ (Dollar US)</option>
                                    <option value="GBP">£ (Livre Sterling)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="btn-primary" type="submit">{t.saveBtn}</button>
                        <button className="btn-secondary" type="button" onClick={() => setIsEditing(false)}>{t.cancelBtn}</button>
                    </div>
                </form>
            )}
        </div>
    );
}
export default ProfileDetails;