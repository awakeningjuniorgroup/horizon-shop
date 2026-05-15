import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, X, Save, ArrowLeft, Plus } from 'lucide-react';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { axios, token } = useAppContext();
    
    const [loading, setLoading] = useState(false);
    
    // États pour les nouvelles images à uploader
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [image3, setImage3] = useState(null);
    const [image4, setImage4] = useState(null);
    
    // Stocke les URLs des images déjà présentes sur le serveur
    const [existingImages, setExistingImages] = useState([]);

    // Détails du produit
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [bestseller, setBestseller] = useState(false);
    
    // État des Variantes
    const [variants, setVariants] = useState([{ weight: '', price: '', offerPrice: '', inStock: true }]);

    // 1. Récupération des données du produit
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.post('/api/product/single', { productId });
                if (data.success) {
                    const p = data.product;
                    setName(p.name);
                    setDescription(Array.isArray(p.description) ? p.description.join('\n') : p.description);
                    setCategory(p.category);
                    setSubCategory(p.subCategory);
                    setBestseller(p.bestseller);
                    setExistingImages(p.image || []);
                    
                    if(p.variants && p.variants.length > 0) {
                        setVariants(p.variants);
                    } else {
                        setVariants([{ weight: 'Standard', price: p.price, offerPrice: p.offerPrice, inStock: p.inStock }]);
                    }
                } else {
                    toast.error("Produit non trouvé");
                    navigate('/admin/products');
                }
            } catch (error) { 
                console.error(error);
                toast.error("Erreur lors du chargement du produit"); 
            }
        };
        fetchProduct();
    }, [productId, axios, navigate]);

    // 2. Gestion des Variantes
    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...variants];
        updatedVariants[index][field] = value;
        setVariants(updatedVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { weight: '', price: '', offerPrice: '', inStock: true }]);
    };

    const removeVariant = (index) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    // 3. Soumission du formulaire
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Préparation des données structurées
            const productData = {
                productId,
                name,
                description: description.split('\n').filter(line => line.trim() !== ''),
                category,
                subCategory,
                bestseller,
                variants: variants.map(v => ({
                    weight: v.weight,
                    price: Number(v.price),
                    offerPrice: Number(v.offerPrice),
                    inStock: v.inStock
                }))
            };

            formData.append("productData", JSON.stringify(productData));
            formData.append("productId", productId); // Sécurité supplémentaire pour certains backends

            // Ajout des nouveaux fichiers images si présents
            if (image1) formData.append("image1", image1);
            if (image2) formData.append("image2", image2);
            if (image3) formData.append("image3", image3);
            if (image4) formData.append("image4", image4);

            const { data } = await axios.post('/api/product/update', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success("Produit mis à jour avec succès");
                navigate('/admin/products');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <button type="button" onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-600"/>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Modifier le Produit</h1>
            </div>

            {/* Section Images */}
            <div>
                <p className="font-bold text-gray-700 mb-3">Images du Produit</p>
                <div className="flex gap-4 flex-wrap">
                    {[image1, image2, image3, image4].map((newImg, index) => (
                        <label key={index} htmlFor={`image${index+1}`} className="cursor-pointer group relative">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden hover:border-green-500 transition-colors">
                                {newImg ? (
                                    <img className="w-full h-full object-cover" src={URL.createObjectURL(newImg)} alt="Aperçu" />
                                ) : existingImages[index] ? (
                                    <img className="w-full h-full object-cover opacity-90" src={existingImages[index]} alt="Existant" />
                                ) : (
                                    <Upload className="text-gray-400 group-hover:text-green-500" />
                                )}
                            </div>
                            <input onChange={(e) => {
                                const file = e.target.files[0];
                                if (index === 0) setImage1(file);
                                if (index === 1) setImage2(file);
                                if (index === 2) setImage3(file);
                                if (index === 3) setImage4(file);
                            }} type="file" id={`image${index+1}`} hidden />
                        </label>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">* Sélectionner une nouvelle image remplacera l'ancienne dans cet emplacement.</p>
            </div>

            {/* Informations de base (Catégorie libre) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <p className="font-bold text-gray-700 mb-2">Nom du produit</p>
                    <input required onChange={(e) => setName(e.target.value)} value={name} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-colors" type="text" placeholder="Ex: Bananes Fraîches" />
                </div>
                <div>
                    <p className="font-bold text-gray-700 mb-2">Catégorie</p>
                    <input 
                        required 
                        onChange={(e) => setCategory(e.target.value)} 
                        value={category} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-colors" 
                        type="text" 
                        placeholder="Entrez une catégorie (ex: Fruits)" 
                    />
                </div>
                <div>
                    <p className="font-bold text-gray-700 mb-2">Sous-catégorie</p>
                    <input 
                        required 
                        onChange={(e) => setSubCategory(e.target.value)} 
                        value={subCategory} 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none transition-colors" 
                        type="text" 
                        placeholder="Ex: Bio, Importé..." 
                    />
                </div>
            </div>

            {/* Variantes */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <p className="font-bold text-gray-700">Variantes de prix & poids</p>
                    <button type="button" onClick={addVariant} className="text-sm text-green-600 font-bold hover:text-green-700 flex items-center gap-1">
                        <Plus size={16}/> Ajouter une variante
                    </button>
                </div>
                <div className="space-y-3">
                    {variants.map((variant, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                            <input required placeholder="Poids (ex: 1kg)" value={variant.weight} onChange={(e) => handleVariantChange(index, 'weight', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                            <input required type="number" placeholder="Prix Normal" value={variant.price} onChange={(e) => handleVariantChange(index, 'price', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                            <input required type="number" placeholder="Prix Promo" value={variant.offerPrice} onChange={(e) => handleVariantChange(index, 'offerPrice', e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm" />
                            
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={variant.inStock} onChange={(e) => handleVariantChange(index, 'inStock', e.target.checked)} className="rounded text-green-600 focus:ring-green-500" />
                                    En stock
                                </label>
                            </div>

                            {variants.length > 1 && (
                                <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 p-2">
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div>
                <p className="font-bold text-gray-700 mb-2">Description</p>
                <textarea required onChange={(e) => setDescription(e.target.value)} value={description} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 outline-none h-32 resize-none" placeholder="Détails du produit (un par ligne)"></textarea>
            </div>

            {/* Bestseller */}
            <div className="flex items-center gap-3">
                <input type="checkbox" id="bestseller" checked={bestseller} onChange={() => setBestseller(prev => !prev)} className="w-5 h-5 cursor-pointer accent-green-600" />
                <label htmlFor="bestseller" className="cursor-pointer text-gray-700 font-medium">Ajouter aux meilleures ventes</label>
            </div>

            {/* Bouton de validation */}
            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                {loading ? "Mise à jour..." : <><Save size={20}/> Enregistrer les modifications</>}
            </button>
        </form>
    );
};

export default EditProduct;