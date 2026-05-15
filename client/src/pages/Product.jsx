import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { Star, Truck, ShoppingCart, Heart, Share2, Tag, ChevronRight, Minus, Plus, Zap, Headset } from 'lucide-react';
import { motion } from 'framer-motion';

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart, isLoading, navigate } = useContext(AppContext);
    const [product, setProduct] = useState(null);
    const [image, setImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);

    const fetchProductData = () => {
        const item = products.find((item) => item._id === productId);
        if (item) {
            setProduct(item);
            setImage(Array.isArray(item.image) ? item.image[0] : item.image);
            
            if (item.variants && item.variants.length > 0) {
                setSelectedVariant(item.variants[0]);
            } else {
                setSelectedVariant(null);
            }

            const related = products.filter(p => p.category === item.category && p._id !== item._id).slice(0, 4);
            setRelatedProducts(related);
        }
    };

    useEffect(() => {
        if (products.length > 0) {
            fetchProductData();
            window.scrollTo(0,0);
        }
    }, [productId, products]);

    const handleAddToCart = () => {
        // Trigger the global addToCart context (which will now handle the global animation)
        addToCart(product._id, currentWeight);
    };

    if (isLoading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const currentPrice = selectedVariant ? selectedVariant.price : product.price;
    const currentOfferPrice = selectedVariant ? selectedVariant.offerPrice : product.offerPrice;
    const currentWeight = selectedVariant ? selectedVariant.weight : "Standard";
    const discount = Math.round(((currentPrice - currentOfferPrice) / currentPrice) * 100);
    const ratingValue = product.averageRating || 4.5;
    const reviewCount = product.numberOfReviews || 0;

    return (
        <div className="bg-white min-h-screen font-outfit pb-32 md:pb-20 relative">
            
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-500 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <span className="cursor-pointer hover:text-black" onClick={()=>navigate('/')}>Accueil</span>
                        <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                        <span className="cursor-pointer hover:text-black" onClick={()=>navigate('/products')}>Boutique</span>
                        <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                        <span className="cursor-pointer hover:text-black capitalize" onClick={()=>navigate(`/products/${product.category}`)}>{product.category}</span>
                        <ChevronRight size={14} className="mx-2 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8 md:mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    
                    {/* LEFT: GALLERY (Sticky) */}
                    <div className="lg:sticky lg:top-24 h-fit space-y-4">
                        <div className="relative bg-gray-50 rounded-[2.5rem] overflow-hidden aspect-square flex items-center justify-center group">
                            <motion.img 
                                key={image}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                src={image} 
                                alt={product.name} 
                                className="w-[85%] h-[85%] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" 
                            />
                            
                            {/* Floating Actions */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button className="p-3 bg-white/80 backdrop-blur rounded-full shadow-sm hover:scale-110 hover:text-red-500 transition-all">
                                    <Heart size={20} />
                                </button>
                                <button className="p-3 bg-white/80 backdrop-blur rounded-full shadow-sm hover:scale-110 hover:text-blue-500 transition-all">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {Array.isArray(product.image) && product.image.map((item, index) => (
                                <button 
                                    key={index}
                                    onClick={() => setImage(item)}
                                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                                        image === item ? 'border-green-600 opacity-100 ring-2 ring-green-100' : 'border-transparent bg-gray-50 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <img src={item} className="w-full h-full object-contain p-1" alt="Thumbnail" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: DETAILS */}
                    <div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Tag size={12} /> {product.category}
                            </span>
                            {product.bestseller && (
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Bestseller
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 gap-1">
                                <span className="font-bold text-yellow-700">{ratingValue}</span>
                                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                            </div>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-500 text-sm font-medium">{reviewCount} Appreciations</span>
                        </div>

                        {/* Price Card */}
                        <div className="bg-gray-50 rounded-3xl p-6 md:p-8 mb-8 border border-gray-100">
                            <div className="flex items-end gap-3 mb-2">
                                <span className="text-5xl font-black text-gray-900 tracking-tighter">{currentOfferPrice} {currency}</span>
                                <span className="text-xl text-gray-400 line-through mb-1">{currentPrice} {currency}</span>
                            </div>
                            {discount > 0 && (
                                <p className="text-green-600 font-bold text-sm bg-green-100 inline-block px-3 py-1 rounded-full">
                                    vous gardez {currentPrice - currentOfferPrice} ({discount}%) {currency}``
                                </p>
                            )}
                        </div>

                        {/* Variants */}
                        {product.variants?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Selectioner la taille</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((item, index) => (
                                        <button 
                                            key={index}
                                            onClick={() => setSelectedVariant(item)}
                                            className={`px-6 py-3 rounded-2xl border-2 text-sm font-bold transition-all ${
                                                item.weight === selectedVariant?.weight 
                                                ? 'border-[#4A76AC] bg-[#4A76AC] text-white' 
                                                : 'border-gray-200 text-gray-600 hover:border-[#4A76AC]'
                                            }`}
                                        >
                                            {item.weight}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Desktop Actions */}
                        <div className="hidden md:flex gap-4 mb-10">
                            <div className="flex items-center border-2 border-gray-200 rounded-full px-4 h-14">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100 rounded-full"><Minus size={16}/></button>
                                <span className="w-10 text-center font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-gray-100 rounded-full"><Plus size={16}/></button>
                            </div>
                            <button 
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#4A76AC] text-white rounded-full font-bold h-14 hover:bg-[#3d618c] transition-colors flex items-center justify-center gap-2 shadow-xl shadow-gray-200 active:scale-95"
                            >
                                <ShoppingCart size={20} /> Ajouter au panier   {currency}{currentOfferPrice * quantity}
                            </button>
                        </div>

                        {/* Description */}
                        <div className="prose prose-gray max-w-none text-gray-600 mb-10">
                            <p>{Array.isArray(product.description) ? product.description.join(' ') : product.description}</p>
                        </div>

                        {/* Trust Features */}
                        <div className="grid grid-cols-3 gap-3 md:gap-4">
                            <div className="flex flex-col items-center justify-center text-center p-4 border border-slate-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
                                <Truck className="text-[#4A76AC] mb-2" size={24} />
                                <span className="font-bold text-sm text-slate-800">livraison gratuite</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5"></span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center p-4 border border-slate-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
                                <Zap className="text-[#4A76AC] mb-2" size={24} />
                                <span className="font-bold text-sm text-slate-800">livraison rapide</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">A votre porte</span>
                            </div>

                            <div className="flex flex-col items-center justify-center text-center p-4 border border-slate-100 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] bg-white">
                                <Headset className="text-[#4A76AC] mb-2" size={24} />
                                <span className="font-bold text-sm text-slate-800">Article cassé?</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Contact</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Reviews */}
                <div className="mt-20 border-t border-gray-100 pt-16">
                    <ReviewSection productId={product._id} reviews={product.reviews || []} />
                </div>

                {/* Related */}
                {relatedProducts.length > 0 && (
                    <div className="mt-20">
                        <h2 className="text-3xl font-black text-gray-900 mb-8">Vous pouvez aussi aimer</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((item, index) => (
                                <ProductCard key={index} product={item} />
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* 🟢 MOBILE STICKY FOOTER */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40 flex items-center justify-between gap-4 safe-area-pb">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
                    <span className="text-2xl font-black text-gray-900">{currentOfferPrice} {currency}</span>
                </div>
                <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#4A76AC] text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                    Ajouter au panier
                </button>
            </div>
        </div>
    );
};

export default Product;