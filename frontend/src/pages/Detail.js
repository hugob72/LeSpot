import Header from '../components/Header';
import Footer from '../components/Footer';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/Detail.css';
import '../styles/home.css';

function Detail() {
    const { idArticle } = useParams();
    const [article, setArticle] = useState({});
    const [image, setImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        onSale: false
    });

    useEffect(() => {
            fetch(`http://localhost:3001/${idArticle}`)
                .then(response => response.json())
                .then(data => {
                    setArticle(data);
                    setUpdatedItem(data);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération de l\'article :', error);
                });
    }, [isEditing, idArticle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedItem(prevState => ({
            ...prevState,
            [name]: value 
        }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpdateItem = async () => {
        let finalImageUrl = updatedItem.image;

        // 1. If a new image was selected, upload it first
        if (image) {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('articleId', idArticle);

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

        // 2. Update the product with the new data and the (possibly new) image URL
        const itemToSave = { ...updatedItem, image: finalImageUrl };

        fetch(`http://localhost:3001/${idArticle}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(itemToSave)
        })
            .then(response => response.json())
            .then(data => {
                setArticle(data);
                setIsEditing(false);
                setImage(null); // Clear the file selection state
            })
            .catch(error => {
                console.error('Erreur mise à jour article:', error);
            });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        formData.append('articleId', idArticle);
        fetch('http://localhost:3001/upload', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                const imageUrl = data.image;
                setUpdatedItem(prevState => ({
                    ...prevState,
                    image: data.image
                }));
            })
            .catch(error => {
                console.error('Erreur lors du téléchargement de l\'image :', error);
            });
    };

    return (
    <div className="home">
        <Header />
        <main className="detail-wrapper">
            <div className="product-card">
                <div className="product-image-section">
                    <img src={article.image} alt={article.name} className="detail-image"/>
                </div>

                <div className="product-info-section">
                    <h1>Détail du produit : </h1>
                    {/*  <span className="highlight">#{idArticle}</span> */}
                    
                    {!isEditing ? (
                        <div className="view-mode">
                            <h2 className="product-title">{article.name}</h2>
                            <p className="product-price">{article.price}€</p>
                            <p className="product-description">{article.description}</p>
                            <button onClick={() => setIsEditing(true)} className="button btn-edit">Modifier</button>
                        </div>
                    ) : (
                        <div className="edit-mode">
                            <label>Nom du produit</label>
                            <input type="text" name="name" value={updatedItem.name} onChange={handleInputChange} className="detail-input"/>
                            
                            <label>Prix (€)</label>
                            <input type="number" name="price" value={updatedItem.price} onChange={handleInputChange} className="detail-input"/>
                            
                            <label>Description</label>
                            <textarea name="description" value={updatedItem.description} onChange={handleInputChange} className="detail-input" rows="4"/>
                            
                            <label>URL de l'image</label>
                            <input type="file" name="image" onChange={handleImageChange} className="detail-input"/>

                            <div className="button-group">
                                <button onClick={handleUpdateItem} className="button btn-save">Enregistrer</button>
                                <button onClick={() => setIsEditing(false)} className="button btn-cancel">Annuler</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
        <Footer />
    </div>
        
    );
}
export default Detail;