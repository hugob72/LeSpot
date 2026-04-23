import { useHistory } from 'react-router-dom';

function ProfileDetails() {
    const userId = localStorage.getItem('userId');
    const history = useHistory();

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        history.push('/login');
    };

    return (
        <div>
            <h2>Bienvenue sur votre profil !</h2>
            <p>Voici vos informations personnelles :</p>
            <ul>
                <li>Id : {userId}</li>
                <li>Email :</li>
            </ul>
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
}
export default ProfileDetails;