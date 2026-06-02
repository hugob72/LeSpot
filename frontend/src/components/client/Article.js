import React from 'react';
import '../../styles/article.css'

function Article(props) {
    const {cartItems, setCartItems, article} = props;

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
                        <p>Solde</p>
                    </div>
                }
                
                <img src={article.image} alt={article.name} className="card-image"/>
                
                <div className="card-content">
                    <p className="card-price">{article.price}€</p>
                    <p className="truncate">{article.name}</p>
                </div>
                
                <div className="area-button">
                    <button className="button" onClick={(e) => addArticle(e, article)}>Ajouter au panier</button>
                </div>
            </div>
        </a>
    )
}
export default Article;