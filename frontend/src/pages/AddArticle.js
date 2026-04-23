import Combobox from "react-widgets/Combobox"
import Header from "../components/Header";
import { useState } from "react";
import "react-widgets/styles.css";

function AddArticle() {

    const [typeArticle, setTypeArticle] = useState("---");
    const [article, setArticle] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        onSale: false
    });

    const handleTypeArticleChange = (value) => {
        console.log(value)
        setTypeArticle(value);
    }

    return(
       <div>
        <Header/>
        <main>
            <p>Formulaire de création d'un article</p>
            <div>
                <label>Nom du produit</label>
                <input type="text" name="name" className="detail-input"></input>

                <label>Description du produit</label>
                <input type="text" name="description" className="detail-input"></input>

                {/* TODO : Vérification du décimal */}
                <label>Prix</label>
                <input type="number" name="price" className="detail-input"></input>

                <label>URL de l'image</label>
                <input type="file" name="image" className="detail-input"/>

                <label>Type d'article</label>
                <Combobox defaultValue="---" data={["Planche de surf", "Combinaison"]} onChange={handleTypeArticleChange} />

                {typeArticle === "Planche de surf" && (
                    <div>
                        <label>Poids</label>
                        <input type="number" name="weight" className="detail-input"></input>  

                        <label>Volume</label>
                        <input type="number" name="volume" className="detail-input"></input>  
                    </div>
                    
                )}

                {typeArticle === "Combinaison" && (
                    <div>Combi</div>
                )}

            </div>
        </main>
    </div> 
    );
} 
export default AddArticle;