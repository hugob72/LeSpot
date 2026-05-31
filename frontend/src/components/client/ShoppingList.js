import Article from '../../components/client/Article';
import { useState, useEffect } from 'react';
import '../../styles/shoppingList.css';

function ShoppingList({ cartItems, setCartItems }) {
    const [itemsList, setItemsList] = useState([]);
    const [displayedItems, setDisplayedItems] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(''); 
    const [sortOption, setSortOption] = useState('');
    const [filterType, setFilterType] = useState(''); // NOUVEAU : État pour le type d'article

    useEffect(() => {
        fetch('http://localhost:3001/')
            .then(response => response.json())
            .then(data => {
                setItemsList(data);
                setDisplayedItems(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des articles :', error);
            });
    }, []);

    useEffect(() => {
        // --- Filtrage ---
        let filtered = itemsList.filter(item => {
            const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchPrice = maxPrice === '' || item.price <= Number(maxPrice);
            
            // NOUVEAU : Si filterType est vide, on prend tout, sinon on compare avec l'itemType de la BDD
            const matchType = filterType === '' || item.itemType === filterType;

            return matchSearch && matchPrice && matchType; // L'article doit valider les 3 filtres
        });

        // --- Tri ---
        let sorted = [...filtered]; 
        
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
    }, [searchTerm, maxPrice, sortOption, filterType, itemsList]); // Ne pas oublier d'ajouter filterType ici

    const handleReset = (e) => {
        e.preventDefault();
        setSearchTerm('');
        setMaxPrice('');
        setSortOption('');
        setFilterType(''); // NOUVEAU : Réinitialise le filtre de type
    };

    return (
        <div className="shopping-page">
            
            <div className="filter-topbar">
                <form className="filter-form">
                    
                    {/* NOUVEAU : Liste déroulante pour le type */}
                    <div className="filter-group">
                        <label>Catégorie :</label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="">Tous les articles</option>
                            <option value="board">Planches de surf</option>
                            <option value="wetsuit">Combinaisons</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Rechercher un article :</label>
                        <input 
                            type="text" 
                            placeholder="Planche, combinaison..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Prix max (€) :</label>
                        <input 
                            type="number" 
                            min="0"
                            step="0.01" 
                            placeholder="Ex: 500" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Trier par :</label>
                        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="">Pertinence</option>
                            <option value="price-asc">Prix : Croissant</option>
                            <option value="price-desc">Prix : Décroissant</option>
                            <option value="name-asc">Nom : A à Z</option>
                            <option value="name-desc">Nom : Z à A</option>
                        </select>
                    </div>

                    <button className="btn-reset" onClick={handleReset}>Réinitialiser</button>
                </form>
            </div>

            <main className="article-container">
                {displayedItems.length === 0 ? (
                    <div className="no-results-message">
                        <p>Désolé, aucun article ne correspond à vos critères de recherche. 🏄‍♂️</p>
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