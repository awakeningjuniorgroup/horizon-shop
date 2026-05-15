import React from "react";
import { useAppContext } from "../context/AppContext";
import { ShieldBan, LogOut, Mail } from "lucide-react";

const Banned = () => {
  const { logout } = useAppContext();

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4 font-outfit">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden text-center">
        <div className="bg-red-600 p-6 flex justify-center">
          <ShieldBan className="text-white w-20 h-20" />
        </div>

        <div className="p-8 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">Compte suspendu</h1>
          <p className="text-gray-500">
            Votre compte a ete suspendu a cause de la violation de notre
            communaute. Votre acces a horizon shopizon shopizon shopizon shop
            est prohibé
          </p>
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-left">
            <h3 className="text-red-800 font-bold text-sm uppercase mb-2">
              Pourquoi est-il suspendu?
            </h3>
            <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
              <li>Acte suspecte detectée</li>
              <li>Violation de nos conditions d'utilisation</li>
              <li>Plusieurs rapports de d'autres client</li>
            </ul>
          </div>

          <div className="pt-4 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-[#6FD3C1] text-white py-3 rounded-xl font-bold hover:bg-[#5ab8a6] transition-colors">
              <Mail size={18} /> Contact pour le support
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 py-3 rounded-xl transition-colors"
            >
              <LogOut size={18} /> se deconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banned;
