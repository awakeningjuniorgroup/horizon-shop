import fs from 'fs';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import Product from './models/product.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
// ID du vendeur Mandvi Cart
const SELLER_ID = new mongoose.Types.ObjectId("69b291f6af9592fee026420b");

const importData = async () => {
    try {
        console.log("⏳ Connexion au cluster Mandvi Cart...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connecté à MongoDB.");

        const productsByCategory = {};
        const allParsedProducts = [];

        console.log("📖 Lecture du fichier CSV et groupement par catégories...");
        
        fs.createReadStream('BigBasketProducts.csv')
            .pipe(csv())
            .on('data', (row) => {
                if (row.product && row.sale_price) {
                    const categoryName = row.category || "General";
                    
                    const newProduct = {
                        name: row.product,
                        description: [row.description],
                        image: ["https://via.placeholder.com/400"], 
                        category: categoryName,
                        subCategory: row.sub_category || categoryName,
                        brand: row.brand || "Generic", 
                        price: parseFloat(row.market_price) || parseFloat(row.sale_price),
                        offerPrice: parseFloat(row.sale_price),
                        inStock: true,
                        bestseller: parseFloat(row.rating) >= 4.0,
                        sellerId: SELLER_ID,
                        date: Date.now(),
                        averageRating: parseFloat(row.rating) || Math.floor(Math.random() * 2) + 3,
                        numberOfReviews: 0,
                        reviews: [],
                        variants: [
                            {
                                weight: row.type || "Standard Pack",
                                price: parseFloat(row.market_price) || parseFloat(row.sale_price),
                                offerPrice: parseFloat(row.sale_price),
                                inStock: true
                            }
                        ]
                    };

                    allParsedProducts.push(newProduct);

                    if (!productsByCategory[categoryName]) {
                        productsByCategory[categoryName] = [];
                    }
                    productsByCategory[categoryName].push(newProduct);
                }
            })
            .on('end', async () => {
                console.log(`📦 ${allParsedProducts.length} articles de base chargés.`);

                // 1. Établir les nouvelles catégories personnalisées
                const newCategoriesToEstablish = [
                    "Electronics & Gadgets", 
                    "Toys & Games", 
                    "Fitness & Sports", 
                    "Home Appliances"
                ];

                newCategoriesToEstablish.forEach(newCat => {
                    productsByCategory[newCat] = [];
                    for(let i = 0; i < 10; i++) {
                        const randomProduct = allParsedProducts[Math.floor(Math.random() * allParsedProducts.length)];
                        // Clonage propre
                        const clonedProduct = { ...randomProduct };
                        clonedProduct.category = newCat;
                        clonedProduct.subCategory = newCat;
                        clonedProduct.name = `${newCat} Special Item ${i + 1}`;
                        productsByCategory[newCat].push(clonedProduct);
                    }
                });

                // 2. Formater pour avoir EXACTEMENT 100 articles par catégorie
                console.log("⚙️ Préparation : 100 articles par catégorie...");
                const finalProductsToInsert = [];

                for (const [category, products] of Object.entries(productsByCategory)) {
                    let count = 0;
                    // Limite fixée à 100 pour correspondre à votre log
                    while (count < 100) { 
                        const baseProduct = products[count % products.length];
                        const finalProduct = { ...baseProduct }; 
                        
                        // FIX : Génération d'un SKU unique pour éviter l'erreur E11000
                        finalProduct.sku = `SKU-${category.replace(/\s+/g, '')}-${count}-${Math.random().toString(36).substring(7)}`.toUpperCase();

                        if (count >= products.length) {
                            finalProduct.name = `${baseProduct.name} - Pack ${Math.floor(count / products.length) + 1}`;
                        }
                        
                        finalProductsToInsert.push(finalProduct);
                        count++;
                    }
                }

                // 3. Upload vers la base de données
                try {
                    console.log(`🚀 Suppression des anciens articles...`);
                    await Product.deleteMany({}); 
                    
                    console.log(`📦 Insertion de ${finalProductsToInsert.length} produits...`);
                    // Utilisation de insertMany pour la performance
                    await Product.insertMany(finalProductsToInsert);
                    
                    console.log("✅ Succès ! Chaque catégorie a maintenant exactement 100 articles.");
                    process.exit();
                } catch (err) {
                    console.error("❌ Erreur lors de l'insertion :", err);
                    process.exit(1);
                }
            });
    } catch (error) {
        console.error("❌ Erreur de connexion :", error);
        process.exit(1);
    }
};

importData();