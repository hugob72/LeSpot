import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import '../../styles/login.css';

function LoginDetails() {
    const [lastname, setUsername] = useState('');
    const [firstname, setFirstName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            console.log('TOTO')
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('token', data.token);
            // localStorage.setItem('firstName', data.firstName);
            // localStorage.setItem('lastName', data.lastName);
            history.push('/profile');
        })
        .catch(error => {
            console.error('Erreur lors de la connexion', error);
            setErrorMessage(error.message);
        });
    }

    return (
        <div className="login-card">
            <h2 className="login-title">{isSignup ? 'Inscription' : 'Connexion'}</h2>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form className="login-form" onSubmit={handleSubmit}>
                <input className="form-input" type="text" placeholder="Nom" value={lastname} hidden={!isSignup} onChange={(e) => setUsername(e.target.value)} required={isSignup} />
                <input className="form-input" type="text" placeholder="Prénom" value={firstname} hidden={!isSignup} onChange={(e) => setFirstName(e.target.value)} required={isSignup} />
                <input className="form-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="form-input" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input className="form-input" type="password" placeholder="Confirmer le mot de passe" hidden={!isSignup} required={isSignup} />
                <input className="form-input" type="tel" placeholder="Numéro de téléphone" value={phoneNumber} hidden={!isSignup} onChange={(e) => setPhoneNumber(e.target.value)} required={isSignup} />
                <button className="btn-primary" type="submit">{isSignup ? 'S\'inscrire' : 'Se connecter'}</button>
            </form>
            <p className="toggle-text">{isSignup ? 'Vous avez déjà un compte ?' : 'Vous n\'avez pas de compte ?'}</p>
            <button className="btn-secondary" onClick={() => setIsSignup(!isSignup)}>{isSignup ? 'Se connecter' : 'S\'inscrire'}</button>
        </div>
    );

}
export default LoginDetails;