import Article from '../../components/client/Article';
import { useState, useEffect, useContext } from 'react';
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import '../../styles/shoppingList.css';

const exchangeRates = { EUR: 1, USD: 1.08, GBP: 0.85 };
const symbols = { EUR: '€', USD: '$', GBP: '£' };

const translations = {
    fr: {
        category: "Catégorie :", allItems: "Tous les articles", boards: "Planches de surf", wetsuits: "Combinaisons",
        searchLabel: "Rechercher un article :", searchPlaceholder: "Planche, combinaison...",
        priceLabel: "Prix max", pricePlaceholder: "Ex: 500",
        sortBy: "Trier par :", relevance: "Pertinence", priceAsc: "Prix : Croissant", priceDesc: "Prix : Décroissant", nameAsc: "Nom : A à Z", nameDesc: "Nom : Z à A",
        reset: "Réinitialiser", noResults: "Désolé, aucun article ne correspond à vos critères de recherche. 🏄‍♂️"
    },
    en: {
        category: "Category:", allItems: "All items", boards: "Surfboards", wetsuits: "Wetsuits",
        searchLabel: "Search for an item:", searchPlaceholder: "Board, wetsuit...",
        priceLabel: "Max price", pricePlaceholder: "Ex: 500",
        sortBy: "Sort by:", relevance: "Relevance", priceAsc: "Price: Low to High", priceDesc: "Price: High to Low", nameAsc: "Name: A to Z", nameDesc: "Name: Z to A",
        reset: "Reset", noResults: "Sorry, no items match your search criteria. 🏄‍♂️"
    }
};

function ShoppingList({ cartItems, setCartItems }) {
    const { language, currency } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [itemsList, setItemsList] = useState([]);
    const [displayedItems, setDisplayedItems] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(''); 
    const [sortOption, setSortOption] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        fetch('http://localhost:3001/article/all')
            .then(response => response.json())
            .then(data => {
                setItemsList(data);
                setDisplayedItems(data);
            })
            .catch(error => console.error('Erreur lors de la récupération des articles :', error));
    }, []);

    useEffect(() => {
        // --- Filtrage ---
        let filtered = itemsList.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Conversion du prix avant comparaison
            const convertedPrice = item.price * exchangeRates[currency];
            const matchPrice = maxPrice === '' || convertedPrice <= Number(maxPrice);
            
            const matchType = filterType === '' || item.itemType === filterType;

            return matchSearch && matchPrice && matchType; 
        });

        // --- Tri ---
        let sorted = [...filtered]; 
        
        // Le tri reste identique car un multiplicateur de devise ne change pas l'ordre
        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'name-asc') {
            sorted.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOption === 'name-desc') {
            sorted.sort((a, b) => b.name.localeCompare(a.name));
        }

        setDisplayedItems(sorted);
    }, [searchTerm, maxPrice, sortOption, filterType, itemsList, currency]); // Ajout de currency aux dépendances

    const handleReset = (e) => {
        e.preventDefault();
        setSearchTerm('');
        setMaxPrice('');
        setSortOption('');
        setFilterType(''); 
    };

    return (
        <div className="shopping-page">
            <div className="filter-topbar">
                <form className="filter-form">
                    
                    <div className="filter-group">
                        <label>{t.category}</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">{t.allItems}</option>
                            <option value="board">{t.boards}</option>
                            <option value="wetsuit">{t.wetsuits}</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t.searchLabel}</label>
                        <input 
                            type="text" 
                            placeholder={t.searchPlaceholder} 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>{t.priceLabel} ({symbols[currency]}) :</label>
                        <input 
                            type="number" 
                            min="0"
                            step="0.01" 
                            placeholder={t.pricePlaceholder} 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>{t.sortBy}</label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="">{t.relevance}</option>
                            <option value="price-asc">{t.priceAsc}</option>
                            <option value="price-desc">{t.priceDesc}</option>
                            <option value="name-asc">{t.nameAsc}</option>
                            <option value="name-desc">{t.nameDesc}</option>
                        </select>
                    </div>

                    <button className="btn-reset" onClick={handleReset}>{t.reset}</button>
                </form>
            </div>

            <main className="article-container">
                {displayedItems.length === 0 ? (
                    <div className="no-results-message">
                        <p>{t.noResults}</p>
                    </div>
                ) : (
                    displayedItems.map((article) => (
                        <Article key={article.idItem} article={article} cartItems={cartItems} setCartItems={setCartItems} />
                    ))
                )}
            </main>
        </div>
    );
}
export default ShoppingList;