import React, { useContext } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/article.css'

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        sale: "Solde",
        addToCart: "Ajouter au panier"
    },
    en: {
        sale: "Sale",
        addToCart: "Add to cart"
    }
};

function Article(props) {
    const {cartItems, setCartItems, article} = props;
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const formatPrice = (priceInEuros) => {
        const converted = priceInEuros * exchangeRates[currency];
        return `${converted.toFixed(2)}${symbols[currency]}`;
    };

    function addArticle(e, article) {
        e.preventDefault(); 
        
        const existingItem = cartItems.find(item => item.idItem === article.idItem);
        if (existingItem) {
            setCartItems(cartItems.map(item => item.idItem === article.idItem ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCartItems([...cartItems, {...article, quantity: 1}]);
        }
    }

    return (
        <a href={`/detail/${article.idItem}`} className="card-link">
            <div className="card">
                {article.onSale === 1 &&
                    <div className="promo"> 
                        <p>{t.sale}</p>
                    </div>
                }
                
                <img src={article.image} alt={article.name} className="card-image"/>
                
                <div className="card-content">
                    <p className="card-price">{formatPrice(article.price)}</p>
                    <p className="truncate">{article.name}</p>
                </div>
                
                <div className="area-button">
                    <button className="button" onClick={(e) => addArticle(e, article)}>{t.addToCart}</button>
                </div>
            </div>
        </a>
    )
}
export default Article;