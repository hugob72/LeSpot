import Header from '../../components/client/Header';
import Footer from '../../components/client/Footer';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../../styles/Detail.css';
import '../../styles/home.css';

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
    const unite = {
        price: '€',
        weight: 'kg',
        maxSupportedWeight: 'kg',
        volume: 'L',
        tempMin: '°C',
        tempMax: '°C'
    }
    const mapping = {
        price: 'Prix',
        stability: 'Stabilité',
        maneuverabilité: 'Maniabilité',
        volume: 'Volume',
        weight: 'Poids',
        maxSupportedWeight: 'Poids maximum supporté',
        withLeash: 'Leash',
        size: 'Taille',
        material: 'Matière principale',
        tempMin: 'Température minimale',
        tempMax: 'Température maximale',
        isAntiUV: 'Anti UV'
    }

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
        <main className="main-section">
            <div className="product-card">
                <div className="product-image-section">
                    <img src={article.image} alt={article.name} className="detail-image"/>
                </div>

                <div className="product-info-section">
                        
                    <h1 className="product-title">{article.name}</h1>

                    <p className="product-description">{article.description}</p>

                    <div className='price'>
                        <p className="product-price">{article.price}€</p>
                        <div className='product-button-action'>
                            <button>Ajouter au panier</button>
                            <button>Favori</button>
                        </div>
                    </div>

                    <div className='product-specifications table-responsive'>
                        <table className="admin-table">

                            <tbody>
                                {Object.entries(article).map(([key, value]) => (
                                    (mapping[key] && value !== null && value !== undefined) && (
                                        <tr key={key}>
                                            <td>{mapping[key]}</td>
                                            <td>{value} {unite[key]}</td>
                                        </tr>
                                    )
                                ))}
                            </tbody>

                        </table>
                    </div>
         
                </div>
            </div>
        </main>
        <Footer />
    </div>
        
    );
}
export default Detail;