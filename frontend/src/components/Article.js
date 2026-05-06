import React, { useState, useEffect } from 'react';
import './../styles/article.css'



function Article(props) {
    

    const {cartItems, setCartItems} = props;
    const article = props.article;
    // const {article, setArticle} = useState(null);
    useEffect(() => {}, []);

    function addArticle(article) {
        const existingItem = cartItems.find(item => item.idItem === article.idItem);
        if (existingItem) {
            setCartItems(cartItems.map(item => item.idItem === article.idItem ? {...item, quantity: item.quantity + 1} : item));
        } else {
            setCartItems([...cartItems, {...article, quantity: 1}]);
        }
    }

    return (
        <div>
            <a href={`/detail/${article.idItem}`}>
                <div className="card">
                
                    {article.onSale === 1 &&
                        <div className="promo"> 
                            <p>{article.onSale ? "Solde" : ""}</p>
                        </div>
                    }
                    {/* <a href={`/detail/${article.idItem}`}> */}
                    
                        <img src={article.image} alt={article.name} className="card-image"/>
                    {/* </a> */}
                    <p>{article.price}€</p>
                    <p className='truncate'>{article.name}</p>
                    <div className="area-button">
                        <button className="button" onClick={() => addArticle(article)}>Ajouter au panier</button>
                    </div>
                </div>
                
            </a>
        </div>
    )
}
export default Article;