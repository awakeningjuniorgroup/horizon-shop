import React, { useState, useContext } from 'react';
import { Star, Send } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const ReviewSection = ({ productId, reviews = [] }) => {
    const { axios, backendUrl, token, fetchProducts } = useContext(AppContext);
    
    const [activeTab, setActiveTab] = useState('reviews');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Please login to write a review");
        
        setIsSubmitting(true);
        try {
            const { data } = await axios.post(backendUrl + '/api/product/review', {
                productId,
                rating,
                comment
            });

            if (data.success) {
                toast.success("Review Added!");
                setComment("");
                fetchProducts(); // Refresh data to show new review/rating
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-20">
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('desc')}
                    className={`px-6 py-3 font-bold text-sm ${activeTab === 'desc' ? 'border-b-2 border-[#4A76AC]  text-[#4A76AC]' : 'text-gray-500'}`}
                >
                    Description
                </button>
                <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 font-bold text-sm ${activeTab === 'reviews' ? 'border-b-2 border-[#4A76AC]  text-[#4A76AC]' : 'text-gray-500'}`}
                >
                    Appréciations ({reviews.length})
                </button>
            </div>

            <div className="py-6 text-sm text-gray-600 leading-relaxed">
                {activeTab === 'desc' ? (
                    <p>
                        Horizon shop offre une gamme de produits de qualité, soigneusement sélectionnés pour répondre à vos besoins quotidiens. 
                        Notre engagement envers la satisfaction du client nous distingue, faisant de nous votre destination de confiance pour des achats en ligne pratiques et fiables.
                    </p>
                ) : (
                    <div className="flex flex-col gap-6">
                        
                        {/* 1. Review Form */}
                        <div className="bg-gray-50 p-6 rounded-xl mb-4">
                            <h3 className="font-bold text-gray-800 mb-3">Donner votre appréciations</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star 
                                            key={star} 
                                            size={24} 
                                            onClick={() => setRating(star)}
                                            className={`cursor-pointer transition-colors ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                                        />
                                    ))}
                                </div>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Ajouter un commentaire sur ce produit..."
                                    className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-[#4A76AC] bg-white"
                                    rows="3"
                                    required
                                ></textarea>
                                <button disabled={isSubmitting} className="self-end bg-[#4A76AC] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#3d618c] flex items-center gap-2">
                                    {isSubmitting ? "Posting..." : <><Send size={16} />posté</>}
                                </button>
                            </form>
                        </div>

                        {/* 2. Review List */}
                        {reviews.length > 0 ? reviews.map((review, index) => (
                            <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs uppercase">
                                        {review.userName?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-xs">{review.userName || "User"}</p>
                                        <div className="flex text-yellow-400 text-[10px]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-yellow-400" : "text-gray-300"} />
                                            ))}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 ml-auto">
                                        {new Date(review.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 pl-10">{review.comment}</p>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-4">Pas d'appréciations. Soyez le premier à donner votre avis!</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;