import Combobox from "react-widgets/Combobox"
import Header from "../../components/client/Header";
import { useState, useContext } from "react";
import { PreferencesContext } from '../../context/PreferencesContextProvider';
import "react-widgets/styles.css";
import "../../styles/addArticle.css";

const translations = {
    fr: {
        title: "Formulaire de création d'un article",
        name: "Nom du produit", desc: "Description du produit", price: "Prix de base (EUR)",
        qty: "Quantité en stock", imgUrl: "URL de l'image", type: "Type d'article",
        board: "Planche de surf", wetsuit: "Combinaison", weight: "Poids",
        volume: "Volume", maxWeight: "Poids maximum supporté", stability: "Stabilité",
        maneuverability: "Maniabilité", leash: "Leash", size: "Taille",
        material: "Matière", neoprene: "Néoprène", yulex: "Yulex",
        tempMin: "Température minimale", tempMax: "Température maximale",
        antiUv: "Anti-UV", add: "Ajouter", none: "---"
    },
    en: {
        title: "Item Creation Form",
        name: "Product Name", desc: "Product Description", price: "Base Price (EUR)",
        qty: "Stock Quantity", imgUrl: "Image URL", type: "Item Type",
        board: "Surfboard", wetsuit: "Wetsuit", weight: "Weight",
        volume: "Volume", maxWeight: "Max Supported Weight", stability: "Stability",
        maneuverability: "Maneuverability", leash: "Leash", size: "Size",
        material: "Material", neoprene: "Neoprene", yulex: "Yulex",
        tempMin: "Minimum Temperature", tempMax: "Maximum Temperature",
        antiUv: "Anti-UV", add: "Add", none: "---"
    }
};

function AddArticle() {
    const { language, theme } = useContext(PreferencesContext);
    const t = translations[language] || translations.fr;

    const [typeArticle, setTypeArticle] = useState(t.none);
    const [materialWetsuit, setMaterialWetsuit] = useState(t.none);
    const [image, setImage] = useState(null);
    const [article, setArticle] = useState({
        name: '', price: 0, description: '', image: '', onSale: false
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setArticle(prevState => ({ ...prevState, [name]: value }));
    }

    const handleTypeArticleChange = (value) => setTypeArticle(value);
    const handleMaterialWetsuitChange = (value) => setMaterialWetsuit(value);
    const handleImageChange = (e) => setImage(e.target.files[0]);

    const handleAddItem = async () => {
        let finalImageUrl = article.image;
        if (image) {
            const formData = new FormData();
            formData.append('image', image);

            try {
                const uploadResponse = await fetch('http://localhost:3001/upload', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadResponse.json();
                finalImageUrl = uploadData.imageUrl || uploadData.image; 
            } catch (error) {
                console.error('Erreur upload image:', error);
            }
        }

        const articleToSave = { ...article, image:finalImageUrl, leash: false, material: materialWetsuit };

        fetch('http://localhost:3001/article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleToSave)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Ajout effectué en BDD");
        })
        .catch(error => {
            alert('Erreur lors de la création de l\'article : ', error);
        })
    }

    return(
       <div className={theme === 'dark' ? 'dark-mode' : ''}>
        <Header/>
        <main className="detail-wrapper">
            <div className="add-article-form-card">
                <div className="flex-column">
                    <h1>{t.title}</h1>

                    <label>{t.name}</label>
                    <input type="text" name="name" onChange={handleInputChange} className="detail-input"></input>

                    <label>{t.desc}</label>
                    <input type="text" name="description" onChange={handleInputChange} className="detail-input"></input>

                    <label>{t.price}</label>
                    <input type="number" name="price" onChange={handleInputChange} className="detail-input"></input>

                    <label>{t.qty}</label>
                    <input type="number" name="amount" onChange={handleInputChange} className="detail-input"></input>

                    <label>{t.imgUrl}</label>
                    <input type="file" name="image" onChange={handleImageChange} className="detail-input"/>

                    <label>{t.type}</label>
                    <Combobox defaultValue={t.none} data={[t.board, t.wetsuit]} onChange={handleTypeArticleChange} className="combobox" />

                    {typeArticle === t.board && (
                        <div className="flex-column">
                            <label>{t.weight}</label>
                            <input type="number" name="weight" onChange={handleInputChange} className="detail-input"></input>  

                            <label>{t.volume}</label>
                            <input type="number" name="volume" onChange={handleInputChange} className="detail-input"></input> 

                            <label>{t.maxWeight}</label>
                            <input type="number" name="maxWeight" onChange={handleInputChange} className="detail-input"></input>  

                            <label>{t.stability}</label>
                            <input type="number" name="stability" onChange={handleInputChange} className="detail-input"></input> 

                            <label>{t.maneuverability}</label>
                            <input type="number" name="maneuverability" onChange={handleInputChange} className="detail-input"></input> 

                            <label>{t.leash}</label>
                            <input type="checkbox" name="leash" onChange={handleInputChange} className="detail-input"></input> 
                        </div>
                    )}

                    {typeArticle === t.wetsuit && (
                        <div className="flex-column">
                            <label>{t.size}</label>
                            <div className="radio-button-group">
                                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                    <div key={size} style={{display: 'inline-block'}}>
                                        <input type="radio" id={size} name="taille" value={size} onChange={handleInputChange} className="hidden-radio" />
                                        <label htmlFor={size} className="radio-button-label">{size}</label>
                                    </div>
                                ))}
                            </div>
                            
                            <label>{t.material}</label>
                            <Combobox defaultValue={t.none} data={[t.neoprene, t.yulex]} onChange={handleMaterialWetsuitChange} className="combobox" />

                            <label>{t.tempMin}</label>
                            <input type="number" name="tempMin" onChange={handleInputChange} className="detail-input"></input> 

                            <label>{t.tempMax}</label>
                            <input type="number" name="tempMax" onChange={handleInputChange} className="detail-input"></input> 

                            <label>{t.antiUv}</label>
                            <input type="checkbox" name="antiUV" onChange={handleInputChange} className="detail-input"></input> 
                        </div>
                    )}

                    <div className="center-container">
                        <button onClick={handleAddItem} className="button btn-save">{t.add}</button>
                    </div>

                </div>
            </div>
            
        </main>
    </div> 
    );
} 
export default AddArticle;