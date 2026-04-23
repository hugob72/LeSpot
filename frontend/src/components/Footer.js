import '../styles/footer.css';
import {useState} from 'react';

function Footer() {
    const [inputValue, setInputValue] = useState('Laissez nous un message 😊')
    return (
        <footer>
            <p>© 2026 Le Spot. Tous droits réservés.</p>
            <div>
                <form>
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)}></textarea>
                    <button onClick={() => alert(inputValue)}>Resultat</button>
                </form>
            </div>
        </footer>
    );
}
export default Footer;