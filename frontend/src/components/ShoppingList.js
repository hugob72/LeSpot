import Article from '../components/Article';
import {articleList} from '../datas/articleList.js'
import {useState, useEffect} from 'react';
import '../styles/shoppingList.css'

function ShoppingList({cartItems, setCartItems}) {
    const [research, setResearchValue] = useState(null);
    const [itemsList, setItemsList] = useState([])
    useEffect(() => {
        fetch('http://localhost:3001/')
            .then(response => response.json())
            .then(data => {
                console.log('Données récupérées :', data);
                setItemsList(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des articles :', error);
            });
    }, []);    

    return (
        <div>
            <div className="filter-container">
                <form>
                    <input type="text" placeholder="Rechercher un article..." />
                </form>
            </div>
            <div className="article-container">
                {console.log(itemsList)}
                {itemsList.map((article) => (
                    <Article article={article} cartItems={cartItems} setCartItems={setCartItems} />
                ))}
            </div>
        </div>
        
    )
}
export default ShoppingList;