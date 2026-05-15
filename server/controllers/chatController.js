import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Order from "../models/orderModel.js";
import { v2 as cloudinary } from "cloudinary";

// ==========================================
// 🤖 ASSISTANT : RÉPONSE IA (SUPPORT horizon shopizon shop)
// ==========================================
const getBotResponse = async (userId, text, hasImage) => {
    const lowerText = text ? text.toLowerCase() : "";
    const user = await User.findById(userId);
    
    // 🟢 Valeur de repli sécurisée
    const userName = user?.name ? user.name.split(' ')[0] : 'Cher client'; 
    
    let response = { text: "", quickReplies: [] };

    // 1. 📸 IMAGE REÇUE (Preuve de panne/dommage -> Prise en main Admin)
    if (hasImage) {
        response.text = "✨ **Données visuelles analysées.** 📸\nMerci d'avoir fourni cette preuve photographique. Je l'ai jointe en toute sécurité à votre dossier.\n\n🔄 **Activation du protocole humain...**\nVeuillez patienter. Je transmets directement cette preuve à notre équipe technique pour un examen immédiat. Votre satisfaction est notre priorité.";
        return response; // Pas de réponses rapides pour forcer l'attente de l'admin
    }

    // 2. 👋 MENU PRINCIPAL / SALUTATIONS
    if (['salut', 'bonjour', 'coucou', 'menu', 'retour', 'start', 'aide'].some(w => lowerText.includes(w))) {
        const hour = new Date().getHours();
        let greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

        response.text = `✨ **${greeting}, ${userName}.** Je suis l'**IA de Support horizon shop**.\n\nJe suis ici pour vous aider à suivre vos commandes, gérer vos livraisons ou traiter vos demandes de SAV. Comment puis-je vous aider ?`;
        response.quickReplies = ["📦 Suivre commande", "🚚 Retard livraison", "💔 Signaler panne", "💳 Politique de retour", "🔒 Sécurité compte", "👤 Agent humain"];
        return response;
    }

    // 3. 📦 SUIVI DE COMMANDE PRÉCIS
    if (['commande', 'suivi', 'statut', 'ou est', 'colis'].some(w => lowerText.includes(w))) {
        const lastOrder = await Order.findOne({ userId }).sort({ date: -1 });
        
        if (!lastOrder) {
            response.text = "✨ **Analyse de la base de données...**\nJ'ai analysé nos registres, mais aucune commande récente n'est associée à votre profil vérifié.\n\nSouhaitez-vous de l'aide pour un compte différent ou une commande ancienne ?";
            response.quickReplies = ["👤 Contacter Admin", "🔙 Menu Principal"];
        } else {
            const date = new Date(lastOrder.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
            
            response.text = `✨ **Télémétrie de commande en temps réel** \n\n**N° de commande :** \`#${lastOrder._id.slice(-8).toUpperCase()}\`\n**Date :** ${date}\n**Statut actuel :** \`${lastOrder.status.toUpperCase()}\`\n**Paiement :** ${lastOrder.payment ? '✅ SÉCURISÉ' : '⏳ EN ATTENTE'}\n\nNotre système indique que l'expédition suit son cours normal.`;
            response.quickReplies = ["🚚 C'est en retard", "💔 Signaler panne", "🔙 Menu Principal"];
        }
        return response;
    }

    // 4. 🚚 LOGIQUE DE RETARD DE LIVRAISON
    if (['retard', 'lent', 'livreur', 'pas reçu'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Analyse logistique initiée.**\nJe m'excuse si votre livraison semble retardée. Selon le flux logistique et les vérifications techniques, des délais mineurs peuvent survenir.\n\nSouhaitez-vous que je localise le livreur ou que j'escalade la demande au support logistique ?";
        response.quickReplies = ["📡 Localiser livreur", "👤 Escalader au support", "🔙 Menu Principal"];
        return response;
    }

    // Simulateur de Ping GPS
    if (['localiser', 'gps', 'ping'].some(w => lowerText.includes(w))) {
        response.text = "📡 **Localisation du livreur en cours...**\nSignal reçu. Votre colis est en cours d'acheminement. Veuillez consulter la carte en direct pour les mises à jour en temps réel.";
        response.quickReplies = ["✅ Parfait", "🔙 Menu Principal"];
        return response;
    }

    // 5. 💔 PRODUIT DÉFECTUEUX / PANNE (Électronique)
    if (['panne', 'casse', 'abîmé', 'defectueux', 'ne marche pas', 'problème', 'hs'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Signalement d'un défaut technique.**\nJe suis sincèrement désolé d'apprendre que votre matériel présente un défaut. Notre politique de garantie couvre les produits défectueux.\n\nPour déclencher un protocole de SAV rapide, veuillez utiliser l'icône 📷 **Appareil Photo** ci-dessous pour envoyer une photo ou une vidéo du problème.";
        return response;
    }

    // 6. 💳 ANNULATION / REMBOURSEMENT
    if (['remboursement', 'retour', 'argent', 'annuler'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Politique de Retour & Remboursement.**\n\n• **Commandes en cours :** Pour garantir une expédition rapide, une commande validée ne peut être annulée manuellement.\n• **SAV / Défauts :** Si le produit est défectueux, nous traiterons un remboursement ou échange après vérification visuelle.\n\nSouhaitez-vous ouvrir un ticket pour un remboursement manuel ?";
        response.quickReplies = ["👤 Ouvrir ticket", "🔙 Menu Principal"];
        return response;
    }

    // 7. 🔒 COMPTE & SÉCURITÉ
    if (['compte', 'password', 'mot de passe', 'connexion', 'sécurité'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Gestion de la Sécurité.**\nVotre profil horizon shop est protégé par un chiffrement de niveau entreprise.\n\nSi vous souhaitez réinitialiser vos accès, déconnectez-vous et cliquez sur 'Mot de passe oublié'. Si vous suspectez une intrusion, je peux verrouiller votre compte immédiatement.";
        response.quickReplies = ["👤 Admin Sécurité", "🔙 Menu Principal"];
        return response;
    }

    // 8. 👤 DEMANDE D'AGENT
    if (['agent', 'humain', 'personne', 'admin', 'conseiller'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Transfert vers un conseiller humain...**\nJe transmets votre dossier chiffré à un spécialiste technique. Un humain prendra le contrôle de cette discussion sous peu.";
        return response; 
    }

    // 9. ✅ CLÔTURE
    if (['merci', 'ok', 'bye', 'merci', 'au revoir', 'parfait'].some(w => lowerText.includes(w))) {
        response.text = "✨ **Session terminée.**\nCe fut un plaisir de vous aider, " + userName + ".\n\nL'intelligence horizon shop se met en veille. Bonne continuation ! 🌌";
        return response;
    }

    // 10. Fallback par défaut
    response.text = "✨ **Requête non reconnue.**\nJe n'ai pas pu analyser votre demande. Pourriez-vous reformuler ou utiliser l'un des boutons ci-dessous ?";
    response.quickReplies = ["👤 Contacter Admin", "🔙 Menu Principal"];
    return response;
};

// ==========================================
// 1. UTILISATEUR : ENVOI DE MESSAGE
// ==========================================
export const userSendMessage = async (req, res) => {
    try {
        const text = req.body?.text || ""; 
        const userId = req.userId;
        const imageFile = req.file; 

        let chat = await Chat.findOne({ userId });

        if (!chat) {
            chat = new Chat({ userId, messages: [] });
        }

        // 🟢 ARCHIVAGE AUTO : Si le ticket était fermé
        if (chat.status === 'closed') {
            if (chat.messages.length > 0) {
                chat.archived.push({
                    messages: chat.messages,
                    closedAt: Date.now()
                });
            }
            chat.messages = []; 
            chat.status = 'active'; 
        }

        let imageUrl = null;
        let messageText = text;

        if (imageFile) {
            const uploadRes = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            imageUrl = uploadRes.secure_url;
            messageText = text || "A envoyé une pièce jointe";
        }

        if (!messageText && !imageUrl) {
            return res.json({ success: false, message: "Impossible d'envoyer un message vide." });
        }

        chat.messages.push({ 
            sender: 'user', 
            text: messageText,
            image: imageUrl 
        });
        
        chat.lastUpdated = Date.now();
        chat.isReadByAdmin = false;
        chat.isReadByUser = true;

        const botReply = await getBotResponse(userId, messageText, !!imageUrl);

        if (botReply) {
            chat.messages.push({ 
                sender: 'admin', 
                text: botReply.text,
                quickReplies: botReply.quickReplies,
                createdAt: Date.now() + 100 
            });
            chat.isReadByUser = false; 
        }

        await chat.save();
        res.json({ success: true, chat });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ==========================================
// 2. CHANGER STATUT (Fermer / Rouvrir)
// ==========================================
export const toggleChatStatus = async (req, res) => {
    try {
        const { userId, status } = req.body; 
        const targetId = userId || req.userId; 

        const chat = await Chat.findOne({ userId: targetId });
        if (!chat) return res.json({ success: false, message: "Chat introuvable" });

        chat.status = status;

        chat.messages.push({
            sender: 'admin',
            text: status === 'closed' ? "🔒 **Ce ticket a été clôturé.**" : "🔓 **Ce ticket a été réouvert.**",
            createdAt: Date.now()
        });

        await chat.save();
        res.json({ success: true, chat });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==========================================
// 3. NOUVELLE CONVERSATION (Archive l'ancienne)
// ==========================================
export const startNewChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.userId });
        
        if (!chat) return res.json({ success: false, message: "Aucun historique à archiver" });

        if (chat.messages.length > 0) {
            chat.archived.push({
                messages: chat.messages,
                closedAt: Date.now()
            });
        }

        chat.messages = [];
        chat.status = 'active';
        chat.messages.push({ 
            sender: 'admin', 
            text: "🤖 **Nouvelle conversation démarrée.** \nEn quoi puis-je vous aider aujourd'hui ?", 
            createdAt: Date.now() 
        });
        
        await chat.save();
        res.json({ success: true, chat });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ... Les autres fonctions (getUserChat, getAllChats, adminReply) restent inchangées côté logique.

// ==========================================
// 4. GETTERS (User & Admin)
// ==========================================
export const getUserChat = async (req, res) => {
    try {
        const chat = await Chat.findOne({ userId: req.userId });
        if(chat) {
            chat.isReadByUser = true;
            await chat.save();
        }
        res.json({ success: true, chat: chat || { messages: [] } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getAllChats = async (req, res) => {
    try {
        const chats = await Chat.find({})
            .populate('userId', 'name email role')
            .sort({ lastUpdated: -1 });
        res.json({ success: true, chats });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ==========================================
// 5. ADMIN REPLY
// ==========================================
export const adminReply = async (req, res) => {
    try {
        const { userId, text } = req.body;
        
        const chat = await Chat.findOne({ userId });
        if (!chat) return res.json({ success: false, message: "Chat not found" });

        if (chat.status === 'closed') {
            return res.json({ success: false, message: "Ticket is closed. Please reopen it to reply." });
        }

        chat.messages.push({ 
            sender: 'admin', 
            text,
            adminId: req.userId 
        });
        
        chat.lastUpdated = Date.now();
        chat.isReadByAdmin = true;
        chat.isReadByUser = false; 

        await chat.save();
        res.json({ success: true, message: "Reply Sent" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};