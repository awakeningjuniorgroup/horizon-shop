import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

// 🌟 SENIOR FEATURE: Custom Category Image Overrides
// If you want a specific image for a category, add it here in lowercase.
// If a category isn't listed here, the system will automatically use the first product's image!
const CUSTOM_CATEGORY_IMAGES = {
  "fruits & FCFAles":
    "https://i.pinimg.com/736x/b6/d2/53/b6d253f0fbb299a24910eec65612a0c1.jpg",
  // Example: "electronics & gadgets": "https://your-image-link.com/tech.jpg"
};

const Categories = () => {
  const { navigate, products } = useAppContext();

  // 🧠 SENIOR LOGIC: 100% Dynamic Category Extraction with Image Overrides
  const dynamicCategories = useMemo(() => {
    if (!products || products.length === 0) return [];

    const catMap = {};

    products.forEach((p) => {
      if (!p.category) return;
      const cText = p.category;
      const cLower = cText.toLowerCase();

      if (!catMap[cLower]) {
        catMap[cLower] = {
          text: cText,
          // 🟢 Check if we have a custom image, otherwise fallback to the product image
          image:
            CUSTOM_CATEGORY_IMAGES[cLower] ||
            p.image?.[0] ||
            "https://via.placeholder.com/150",
          count: 0,
        };
      }
      catMap[cLower].count++;
    });

    // Convert to Array and Sort by highest product count (Most Popular First)
    return Object.values(catMap).sort((a, b) => b.count - a.count);
  }, [products]);

  // --- FUTURISTIC ANIMATION VARIANTS ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 80, damping: 14 },
    },
  };

  // ⏳ Loading Skeleton state
  if (!products || products.length === 0) {
    return (
      <section className="mx-4 md:mx-16 lg:mx-32">
        <div className="w-48 h-10 bg-gray-200 animate-pulse rounded-full mb-10"></div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="min-w-[160px] h-[220px] bg-gray-100 animate-pulse rounded-[2.5rem]"
            ></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-4 md:mx-16 lg:mx-32 relative">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 relative z-10 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-[#4A76AC] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-sm">
            <Sparkles size={14} /> Categories Populaires
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explorer les Categories
          </h2>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 font-bold group transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-900/20"
        >
          Voir tout{" "}
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </motion.button>
      </div>

      {/* --- FUTURISTIC GRID / SCROLL AREA --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex md:grid md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 overflow-x-auto pb-10 scrollbar-hide snap-x snap-mandatory px-2 md:px-0 -mx-2 md:mx-0"
      >
        {dynamicCategories.map((category, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -10 }}
            onClick={() => {
              navigate(`/products/${category.text.toLowerCase()}`);
              window.scrollTo(0, 0);
            }}
            className="group relative min-w-[160px] md:min-w-[180px] h-[220px] md:h-[240px] rounded-[2.5rem] cursor-pointer snap-center bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Decorative Background Curve */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"></div>
            <div className="absolute top-0 w-full h-1/2 bg-indigo-50/50 group-hover:bg-indigo-100/50 transition-colors duration-500 rounded-b-[3rem]"></div>

            {/* Premium Circular Image Frame */}
            <div className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-white shadow-md border-4 border-white mb-5 group-hover:scale-110 transition-transform duration-500 ease-out group-hover:rotate-3">
              <img
                src={category.image}
                alt={category.text}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Futuristic Bottom Label */}
            <div className="relative z-20 px-4 text-center w-full">
              <p className="text-slate-800 font-extrabold text-sm md:text-base tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                {category.text}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- MOBILE CTA BUTTON --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="md:hidden mt-2"
      >
        <button
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="w-full py-4 bg-slate-900 text-white rounded-[2rem] font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xl shadow-slate-900/20"
        >
          Explorer toute les Categories <ArrowRight size={16} />
        </button>
      </motion.div>
    </section>
  );
};

export default Categories;
