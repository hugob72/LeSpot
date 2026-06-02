import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { PreferencesContext } from '../../context/PreferencesContextProvider'; // Vérifie le chemin
import '../../styles/login.css';

const translations = {
    fr: {
        signup: "Inscription",
        login: "Connexion",
        lastname: "Nom",
        firstname: "Prénom",
        password: "Mot de passe",
        confirmPassword: "Confirmer le mot de passe",
        phone: "Numéro de téléphone",
        submitSignup: "S'inscrire",
        submitLogin: "Se connecter",
        alreadyAccount: "Vous avez déjà un compte ?",
        noAccount: "Vous n'avez pas de compte ?"
    },
    en: {
        signup: "Sign up",
        login: "Login",
        lastname: "Last name",
        firstname: "First name",
        password: "Password",
        confirmPassword: "Confirm password",
        phone: "Phone number",
        submitSignup: "Register",
        submitLogin: "Sign in",
        alreadyAccount: "Already have an account?",
        noAccount: "Don't have an account?"
    }
};

function LoginDetails() {
    const { language } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [lastname, setUsername] = useState('');
    const [firstname, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Inutilisé dans le fetch mais présent visuellement
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const history = useHistory();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            history.push('/profile');
        }
    }, [history]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const endpoint = isSignup ? 'http://localhost:3001/signup' : 'http://localhost:3001/login';
        fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: isSignup ? JSON.stringify({firstname, lastname, email, password, phoneNumber}) : JSON.stringify({email, password})
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text) });
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            history.push('/profile');
        })
        .catch(error => {
            console.error('Erreur', error);
            setErrorMessage(error.message);
        });
    }

    return (
        <div className="login-card">
            <h2 className="login-title">{isSignup ? t.signup : t.login}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
                <input className="form-input" type="text" placeholder={t.lastname} value={lastname} hidden={!isSignup} onChange={(e) => setUsername(e.target.value)} required={isSignup} />
                <input className="form-input" type="text" placeholder={t.firstname} value={firstname} hidden={!isSignup} onChange={(e) => setFirstName(e.target.value)} required={isSignup} />
                <input className="form-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="form-input" type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input className="form-input" type="password" placeholder={t.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} hidden={!isSignup} required={isSignup} />
                <input className="form-input" type="tel" placeholder={t.phone} value={phoneNumber} hidden={!isSignup} onChange={(e) => setPhoneNumber(e.target.value)} required={isSignup} />
                <button className="btn-primary" type="submit">{isSignup ? t.submitSignup : t.submitLogin}</button>
            </form>
            <p className="toggle-text">{isSignup ? t.alreadyAccount : t.noAccount}</p>
            <button className="btn-secondary" onClick={() => setIsSignup(!isSignup)}>{isSignup ? t.login : t.signup}</button>
        </div>
    );
}
export default LoginDetails;