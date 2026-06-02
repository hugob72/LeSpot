import {useContext} from 'react';
import {PreferencesContext} from '../../context/PreferencesContextProvider';
import '../../styles/preference.css';

function Preference() {
    const {theme, setTheme} = useContext(PreferencesContext);
    const ChangeTheme = (e) => { setTheme(e.target.checked); };
    return (
        <div className="preference-container">
            <div className={`preferences-page ${theme ? 'dark-mode' : ''}`}>
                <h1>Préférences</h1>
                <p>Cette page est en construction. Veuillez revenir plus tard.</p>
                <input type="checkbox" checked={theme} onChange={ChangeTheme}/>Mode Sombre
            </div>
        </div>
    );
}
export default Preference;