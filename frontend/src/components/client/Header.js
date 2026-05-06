import { Link } from 'react-router-dom';
import {useContext} from 'react';
import {StyleContext} from '../../context/StyleContextProvider';
import Logo from '../../assets/LeSpotLogo.png';
import '../../styles/header.css';

function Header() {
    const {theme, setTheme} = useContext(StyleContext);
    return (
        <div className={`header ${theme ? 'dark-mode' : ''}`}>
            {/* <h1>Le Spot</h1> */}
            <img src={Logo} alt="Logo" className="logo" />
            <ul>
                <li><Link to="/">Accueil</Link></li>
                <li><Link to="/preferences">Préférences</Link></li>
                <li><Link to="/login">Connexion</Link></li>
                <li>Contact</li>
                <li><Link to="/add-article">Ajout article</Link></li>
            </ul>
        </div>
        
    )
}
export default Header;