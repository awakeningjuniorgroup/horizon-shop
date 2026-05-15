import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Smartphone,
  CreditCard,
  PackageCheck,
  Truck,
  MapPin,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Monitor,
  ChevronDown,
  ShoppingCart,
  Sofa,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🚀 horizon shopizon shop JOURNEY
// Couleurs : Bleu Logo (#4A76AC), Fond Blanc (#FFFFFF), Texte Slate (#1e293b)
const journeySteps = [
  {
    id: 1,
    title: "Explorez l'Innovation",
    description:
      "Parcourez notre catalogue premium : meubles, accesssoires de cuisine dernier cri. Trouvez le produit qui vous ressemble.",
    icon: <Sofa size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "CLIENT",
  },
  {
    id: 2,
    title: "Paiement Sécurisé",
    description:
      "Transaction ultra-rapide et cryptée. Plusieurs options de paiement disponibles pour acquérir vos nouveaux produits en toute sérénité.",
    icon: <CreditCard size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "CLIENT",
  },
  {
    id: 3,
    title: "Tests & Préparation",
    description:
      "Chaque produit horizon shop est rigoureusement testé par nos experts avant d'être emballé dans un packaging protecteur haute densité.",
    icon: <PackageCheck size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "HORIZON HQ",
  },
  {
    id: 4,
    title: "Expédition Express",
    description:
      "Votre commande quitte notre centre logistique. Un code de suivi unique est généré pour garantir une traçabilité totale de votre matériel.",
    icon: <Zap size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "LOGISTIQUE",
  },
  {
    id: 5,
    title: "Suivi Temps Réel",
    description:
      "Suivez le trajet de votre colis sur la carte. De notre entrepôt à votre bureau, restez informé de chaque étape de la livraison.",
    icon: <MapPin size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "LIVREUR",
  },
  {
    id: 6,
    title: "Déballez le Futur",
    description:
      "Réceptionnez votre commande, vérifiez l'intégrité de vos produits et profitez de la garantie horizon shopizon shop. Votre mise à niveau commence ici.",
    icon: <Cpu size={32} style={{ color: "#4A76AC" }} />,
    color: "bg-blue-50",
    role: "CLIENT",
  },
];

const About = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-white font-outfit overflow-hidden selection:bg-[#4A76AC]/20 selection:text-[#4A76AC]"
    >
      {/* 🌌 BACKGROUND BLOBS (Subtiles sur fond blanc) */}
      <motion.div
        style={{ y: bgY }}
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#4A76AC]/5 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-slate-100 blur-[100px]"></div>
      </motion.div>

      {/* 🔵 HERO SECTION */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
        className="relative w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center max-w-5xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4A76AC]/5 border border-[#4A76AC]/20 text-[#4A76AC] mb-8 cursor-pointer shadow-sm"
          >
            <ShoppingCart size={16} />
            <span className="text-sm font-semibold tracking-wide uppercase">
              Tout à petit prix
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Propulsez vous sur <br />
            <span style={{ color: "#4A76AC" }}>horizon  shop</span>
          </h1>

          <p className="mt-6 text-lg md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Votre partenaire de confiance pour les produits du quotidien.
            Performance, authenticité et service premium réunis dans une
            expérience unique.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="mt-10 px-8 py-4 bg-[#4A76AC] text-white text-lg font-bold rounded-2xl shadow-lg shadow-[#4A76AC]/20 flex items-center gap-3 hover:shadow-[#4A76AC]/40 transition-all"
          >
            Découvrir nos produits <ArrowRight size={20} />
          </motion.button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-xs font-bold tracking-widest uppercase">
            Découvrez notre processus
          </span>
          <ChevronDown size={24} style={{ color: "#4A76AC" }} />
        </motion.div>
      </motion.section>

      {/* 🔵 THE PROCESS (Timeline sur fond blanc) */}
      <section className="relative max-w-5xl mx-auto px-4 py-24 z-10">
        {/* Ligne de progression centrale */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-100 md:-translate-x-1/2 rounded-full overflow-hidden">
          <motion.div
            style={{
              scaleY: scrollYProgress,
              transformOrigin: "top",
              backgroundColor: "#4A76AC",
            }}
            className="w-full h-full"
          ></motion.div>
        </div>

        <div className="space-y-16 md:space-y-32">
          {journeySteps.map((step, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative flex flex-col md:flex-row items-center gap-8 md:gap-16 ${isEven ? "md:flex-row" : "md:flex-row-reverse"} pl-12 md:pl-0`}
              >
                {/* Noeud central */}
                <div
                  className="absolute left-[-11px] md:left-1/2 top-8 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-8 h-8 bg-white border-4 rounded-full flex items-center justify-center shadow-md z-20"
                  style={{ borderColor: "#4A76AC" }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "#4A76AC" }}
                  ></div>
                </div>

                <div className="flex-1 hidden md:block"></div>

                <div className="flex-1 w-full">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-[#4A76AC]/30 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-6 relative z-10">
                      {/* Carré icône doux */}
                      <div
                        className={`shrink-0 w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {step.icon}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="font-black text-xl"
                            style={{ color: "#4A76AC" }}
                          >
                            0{step.id}
                          </span>
                          <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold tracking-widest uppercase rounded-md">
                            {step.role}
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-500 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {/* Effet au survol */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#4A76AC]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 🔵 FOOTER CTA: Design Épuré */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-4 text-center relative overflow-hidden mt-10 z-10 m-4 md:m-8 rounded-[3rem] bg-slate-50 border border-slate-100"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#4A76AC]/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <ShieldCheck
            size={64}
            style={{ color: "#4A76AC" }}
            className="mb-6"
          />

          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            Prêt pour le{" "}
            <span style={{ color: "#4A76AC" }}>Niveau Supérieur ?</span>
          </h2>
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Rejoignez horizon shop. Profitez des dernières innovations avec une
            garantie certifiée et un support client expert.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/products");
            }}
            className="px-10 py-5 bg-[#4A76AC] hover:bg-[#3d618c] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#4A76AC]/20"
          >
            Équipez-vous maintenant <ArrowRight size={20} strokeWidth={2.5} />
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
};

export default About;
