import React from "react";
import { assets, footerLinks } from "../assets/assets";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ChevronRight,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8 font-outfit mt-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* 🟢 Main Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          {/* 1. Brand Section */}
          <div className="lg:col-span-2 pr-0 lg:pr-12">
            <img
              className="w-36 mb-6 object-contain"
              src={assets.logo}
              alt="horizon shop"
            />
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              Platforme de vente et livraison de nouvelle génération de produits
               apportant des produits neufs et essentiels pour
              le quotidiens directement à votre porte avec suivi en temps réel
              et vitesse inégalée.
            </p>

            {/* Interactive Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#4A76AC] hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#4A76AC] hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#4A76AC]  hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#4A76AC] hover:shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* 2. Dynamic Links */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-black text-[#3d618c] text-lg mb-6 tracking-wide">
                {section.title}
              </h3>
              <ul className="space-y-4">
                {section.links.map((link, i) => (
                  <li key={i} className="overflow-hidden">
                    <a
                      href={link.url}
                      className="text-slate-500 text-sm font-medium hover:text-[#4A76AC] transition-all duration-300 flex items-center gap-2 group"
                    >
                      {/* 🟢 Animated Chevron on Hover */}
                      <ChevronRight
                        size={14}
                        className="text-transparent group-hover:text-[#4A76AC] transition-colors -ml-4 group-hover:ml-0"
                      />
                      <span className="transform transition-transform duration-300 group-hover:translate-x-1">
                        {link.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* 3. Contact Info with Icons */}
          <div className="lg:col-span-1">
            <h3 className="font-black text-[#3d618c] text-lg mb-6 tracking-wide">
              Contacts
            </h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-slate-500 text-sm font-medium group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <Phone
                    size={14}
                    className="text-slate-400 group-hover:text-[#3d618c] transition-colors"
                  />
                </div>
                <span className="mt-1.5 group-hover:text-emerald-600 transition-colors">
                  +237 690 31 63 94
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-500 text-sm font-medium group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <Mail
                    size={14}
                    className="text-slate-400 group-hover:text-[#3d618c] transition-colors"
                  />
                </div>
                <span className="mt-1.5 group-hover:text-emerald-600 transition-colors">
                  contact@horizonshop.com
                </span>
              </li>
              <li className="flex items-start gap-3 text-slate-500 text-sm font-medium group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <MapPin
                    size={14}
                    className="text-slate-400 group-hover:text-[#3d618c] transition-colors"
                  />
                </div>
                <span className="mt-1.5 leading-relaxed group-hover:text-[#3d618c] transition-colors">
                  Yaoundé, Cameroun
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* 🟢 Copyright & Credits Section */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()}{" "}
            <span className="font-black text-slate-800">horizon shop</span>.
            Tous droits réservés.
          </p>

          {/* Your Developer Badge! */}
          {
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <span> by </span>
              <a
                href="https://mail.google.com/mail/u/0/?hl=en#inbox?compose=new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-black hover:text-emerald-700 transition-colors"
              >
                horizon shop
              </a>
            </div>
          }
        </div>
      </div>
    </footer>
  );
};

export default Footer;
