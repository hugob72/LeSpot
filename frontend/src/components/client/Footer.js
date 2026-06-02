import '../../styles/footer.css';
import { useState, useContext, useEffect } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider';

const translations = {
    fr: {
        message: "Laissez nous un message 😊",
        rights: "© 2026 Le Spot. Tous droits réservés.",
        result: "Resultat"
    },
    en: {
        message: "Leave us a message 😊",
        rights: "© 2026 Le Spot. All rights reserved.",
        result: "Result"
    }
};

function Footer() {
    const { language } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;
    const [inputValue, setInputValue] = useState(t.message);

    useEffect(() => {
        if (inputValue === translations.fr.message || inputValue === translations.en.message) {
            setInputValue(t.message);
        }
    }, [language, t.message, inputValue]);

    return (
        <footer>
            <p>{t.rights}</p>
            <div>
                <form>
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)}></textarea>
                    <button type="button" onClick={() => alert(inputValue)}>{t.result}</button>
                </form>
            </div>
        </footer>
    );
}
export default Footer;