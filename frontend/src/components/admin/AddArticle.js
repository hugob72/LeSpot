import Combobox from "react-widgets/Combobox"
import Header from "../../components/client/Header";
import { useState } from "react";
import "react-widgets/styles.css";
import "../../styles/addArticle.css";

function AddArticle() {

    const [typeArticle, setTypeArticle] = useState("---");
    const [materialWetsuit, setMaterialWetsuit] = useState("---");
    const [image, setImage] = useState(null);
    const [article, setArticle] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        onSale: false
    });

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setArticle(prevState => ({
            ...prevState,
            [name]: value
        }));
    }

    const handleTypeArticleChange = (value) => {
        setTypeArticle(value);
    }

    const handleMaterialWetsuitChange = (value) => {
        setMaterialWetsuit(value);
    }

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

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
                // Assume server returns { imageUrl: "path/to/img.jpg" }
                finalImageUrl = uploadData.imageUrl || uploadData.image; 
            } catch (error) {
                console.error('Erreur upload image:', error);
            }
        }

        const articleToSave = { ...article, image:finalImageUrl, leash: false, material: materialWetsuit };
        console.log(articleToSave);

        fetch('http://localhost:3001/article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleToSave)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Ajout effectué en BDD")
            setArticle(null);
        })
        .catch(error => {
            console.error('Erreur lors de la création de l\'article : ', error);
        })

    }

    return(
       <div>
        <div className="flex-column">
            <h1>Formulaire de création d'un article</h1>

            <label>Nom du produit</label>
            <input type="text" name="name" onChange={handleInputChange} className="detail-input"></input>

            <label>Description du produit</label>
            <input type="text" name="description" onChange={handleInputChange} className="detail-input"></input>

            {/* TODO : Vérification du décimal */}
            <label>Prix</label>
            <input type="number" name="price" onChange={handleInputChange} className="detail-input"></input>

            <label>Quantité en stock</label>
            <input type="number" name="amount" onChange={handleInputChange} className="detail-input"></input>

            <label>URL de l'image</label>
            <input type="file" name="image" onChange={handleImageChange} className="detail-input"/>

            <label>Type d'article</label>
            <Combobox defaultValue="---" data={["Planche de surf", "Combinaison"]} onChange={handleTypeArticleChange} className="combobox" />

            {typeArticle === "Planche de surf" && (
                <div className="flex-column">
                    <label>Poids</label>
                    <input type="number" name="weight" onChange={handleInputChange} className="detail-input"></input>  

                    <label>Volume</label>
                    <input type="number" name="volume" onChange={handleInputChange} className="detail-input"></input> 

                    <label>Poids maximum supporté</label>
                    <input type="number" name="maxWeight" onChange={handleInputChange} className="detail-input"></input>  

                    <label>Stabilité</label>
                    <input type="number" name="stability" onChange={handleInputChange} className="detail-input"></input> 

                    <label>Maniabilité</label>
                    <input type="number" name="maneuverability" onChange={handleInputChange} className="detail-input"></input> 

                    <label>Leash</label>
                    <input type="checkbox" name="leash" onChange={handleInputChange} className="detail-input"></input> 

                </div>
                
            )}

            {typeArticle === "Combinaison" && (
                <div className="flex-column">
                    
                    <label>Taille</label>
                    <div className="radio-button-group">
                        <input type="radio" id="XS" name="taille" value="XS" onChange={handleInputChange} className="hidden-radio" />
                        <label htmlFor="XS" className="radio-button-label">XS</label>

                        <input type="radio" id="S" name="taille" value="S" onChange={handleInputChange} className="hidden-radio" />
                        <label htmlFor="S" className="radio-button-label">S</label>

                        <input type="radio" id="M" name="taille" value="M" onChange={handleInputChange} className="hidden-radio" />
                        <label htmlFor="M" className="radio-button-label">M</label>

                        <input type="radio" id="L" name="taille" value="L" onChange={handleInputChange} className="hidden-radio" />
                        <label htmlFor="L" className="radio-button-label">L</label>

                        <input type="radio" id="XL" name="taille" value="XL" onChange={handleInputChange} className="hidden-radio" />
                        <label htmlFor="XL" className="radio-button-label">XL</label>
                    </div>
                    

                    <label>Matière</label>
                    <Combobox defaultValue="---" data={["Néoprène", "Yulex"]} onChange={handleMaterialWetsuitChange} className="combobox" />

                    <label>Température minimale</label>
                    <input type="number" name="tempMin" onChange={handleInputChange} className="detail-input"></input> 

                    <label>Température maximale</label>
                    <input type="number" name="tempMax" onChange={handleInputChange} className="detail-input"></input> 

                    <label>Anti-UV</label>
                    <input type="checkbox" name="antiUV" onChange={handleInputChange} className="detail-input"></input> 

                </div>
            )}

            <div className="center-container">
                <button onClick={handleAddItem} className="button btn-save">Ajouter</button>
            </div>
        </div>
    </div> 
    );
} 
export default AddArticle;