import { useHistory } from 'react-router-dom';
import { useContext } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/cart.css';

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        cart: "Panier",
        qty: "QTE :",
        total: "Total : ",
        emptyCart: "Vider le panier",
        viewCart: "Voir mon panier"
    },
    en: {
        cart: "Cart",
        qty: "QTY:",
        total: "Total: ",
        emptyCart: "Empty cart",
        viewCart: "View my cart"
    }
};

function Cart({cartItems, setCartItems}) {
    const history = useHistory();
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)} ${symbols[currency]}`;
    };

    let total = 0;
    for (let item of cartItems) {
        total += item.price * item.quantity
    }

    return (
        <div className="cart">
            <h1>{t.cart}</h1>
            {cartItems.map((item, index) => (
                <div className="cart-item" key={index}>
                    <p>{item.name} : </p>
                    <p>{formatPrice(item.price)}</p>
                    <p>{t.qty} {item.quantity}</p>
                </div>
            ))}

            <div className="cart-total">
                <p><b>{t.total}</b>{formatPrice(total)}</p>
                <div className="area-button">
                    <button className="button" onClick={() => {setCartItems([])}}>{t.emptyCart}</button>
                </div>
            </div>
        </div>
    );
}
export default Cart;