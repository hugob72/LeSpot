import Combobox from "react-widgets/Combobox"
import { useState, useEffect } from "react";
import { useParams, useHistory } from 'react-router-dom';
import "react-widgets/styles.css";
import "../../styles/addArticle.css";

function AddArticle() {
    const { idArticle } = useParams();
    const history = useHistory();
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

    useEffect(() => {
        if (idArticle) {
           fetch(`http://localhost:3001/article/${idArticle}`)
            .then(response => response.json())
            .then(data => {
                setArticle({
                    ...data,
                    leash: data.withLeash === 1,
                    antiUV: data.isAntiUV === 1,
                    onSale: data.onSale === 1,
                    maxWeight: data.maxSupportedWeight,
                    taille: data.size
                });
                
                if (data.material) {
                    setMaterialWetsuit(data.material);
                } 

                if (data.withLeash !== null && data.withLeash !== undefined) {
                    setTypeArticle("Planche de surf");
                } else if (data.isAntiUV !== null && data.isAntiUV !== undefined) {
                    setTypeArticle("Combinaison");
                } else setTypeArticle("---");
            })
            .catch(error => console.error('Erreur :', error)); 
        }
    }, [idArticle]);


    const handleInputChange = (e) => {
        const { name, type, checked, value } = e.target;
        setArticle(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    }

    const handleTypeArticleChange = (value) => {
        setTypeArticle(value)
    };

    const handleMaterialWetsuitChange = (value) => {
        setMaterialWetsuit(value)
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0])
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
                finalImageUrl = uploadData.imageUrl || uploadData.image; 
            } catch (error) {
                console.error('Erreur upload image:', error);
                return;
            }
        }

        const articleToSave = { ...article, image: finalImageUrl, material: materialWetsuit };

        fetch('http://localhost:3001/article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleToSave)
        })
        .then(async response => {
            alert("Article ajouté avec succès !");
            history.push('/admin/stock');
        })
        .catch(error => {
            console.error('Erreur lors de la création de l\'article : ', error);
            alert('Impossible de créer l\'article : ' + error.message);
        });
    }

    const handleChangeItem = async () => {
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
                return;
            }
        }

        const articleToSave = { ...article, image: finalImageUrl };

        fetch(`http://localhost:3001/article/${idArticle}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(articleToSave)
        })
        .then(async response => {
            alert("Article modifié avec succès !");
            history.push('/admin/stock');
        })
        .catch(error => {
            console.error('Erreur lors de la modification : ', error);
            alert('Impossible de modifier l\'article : ' + error.message);
        });
    }

    return (
       <div>
        <div className="flex-column">
            <h1>Formulaire de {idArticle ? "modification": "création"} d'un article</h1>

            <label>Nom du produit</label>
            <input type="text" name="name" onChange={handleInputChange} className="detail-input" value={article.name || ''}></input>

            <label>Description du produit</label>
            <input type="text" name="description" onChange={handleInputChange} className="detail-input" value={article.description || ''}></input>

            <div>
                <input type="checkbox" name="onSale" id="onSale" onChange={handleInputChange} checked={article.onSale || false} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="onSale">En promotion ?</label>
            </div>
            <br/>

            <label>Prix</label>
            <input type="number" name="price" step="0.01" onChange={handleInputChange} className="detail-input" value={article.price || 0}></input>

            <label>Quantité en stock</label>
            <input type="number" name="amount" onChange={handleInputChange} className="detail-input" value={article.amount || 0}></input>

            <label>URL de l'image</label>
            {idArticle && article.image && <img src={article.image} alt="produit" style={{width: "150px"}}/>}
            <input type="file" name="image" onChange={handleImageChange} className="detail-input"/>

            <label>Type d'article</label>
            <Combobox data={["Planche de surf", "Combinaison"]} onChange={handleTypeArticleChange} className="combobox" value={typeArticle} />

            {typeArticle === "Planche de surf" && (
                <div className="flex-column">
                    <label>Poids</label>
                    <input type="number" name="weight" step="0.01" onChange={handleInputChange} className="detail-input" value={article.weight || ''}></input>  

                    <label>Volume</label>
                    <input type="number" name="volume" onChange={handleInputChange} className="detail-input" value={article.volume || ''}></input> 

                    <label>Poids maximum supporté</label>
                    <input type="number" name="maxWeight" step="0.01" onChange={handleInputChange} className="detail-input" value={article.maxWeight || ''}></input>  

                    <label>Stabilité</label>
                    <input type="number" name="stability" onChange={handleInputChange} className="detail-input" value={article.stability || ''}></input> 

                    <label>Maniabilité</label>
                    <input type="number" name="maneuverability" onChange={handleInputChange} className="detail-input" value={article.maneuverability || ''}></input> 

                    <label>Leash</label>
                    <input type="checkbox" name="leash" onChange={handleInputChange} className="detail-input" checked={article.leash || false}></input> 
                </div>
            )}

            {typeArticle === "Combinaison" && (
                <div className="flex-column">
                    <label>Taille</label>
                    <div className="radio-button-group">
                        {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                            <div key={size}>
                                <input type="radio" id={size} name="taille" value={size} onChange={handleInputChange} className="hidden-radio" checked={article.taille === size}/>
                                <label htmlFor={size} className="radio-button-label">{size}</label>
                            </div>
                        ))}
                    </div>

                    <label>Matière</label>
                    <Combobox defaultValue="---" data={["Néoprène", "Yulex"]} value={materialWetsuit} onChange={handleMaterialWetsuitChange} className="combobox" />

                    <label>Température minimale</label>
                    <input type="number" name="tempMin" onChange={handleInputChange} className="detail-input" value={article.tempMin || ''}></input> 

                    <label>Température maximale</label>
                    <input type="number" name="tempMax" onChange={handleInputChange} className="detail-input" value={article.tempMax || ''}></input> 

                    <label>Anti-UV</label>
                    <input type="checkbox" name="antiUV" onChange={handleInputChange} className="detail-input" checked={article.antiUV || false}></input> 
                </div>
            )}

            <div className="center-container">
                {idArticle ? 
                <button onClick={handleChangeItem} className="button btn-save">Modifier</button>
                :
                <button onClick={handleAddItem} className="button btn-save">Ajouter</button>
                }
            </div>
        </div>
    </div> 
    );
} 
export default AddArticle;