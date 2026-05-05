import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  User,
  Loader,
  Camera,
  RefreshCcw,
  X,
  Power,
  Clock,
  Bot,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Contact = () => {
  const { axios, token, setShowUserLogin, t } = useAppContext();
  const [chatData, setChatData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Refs for scrolling and auto-focusing
  const chatContainerRef = useRef(null);
  const isInitialLoad = useRef(true);

  // 1. Force Page to Top on Load (outside of the chat box)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch Chat
  const fetchChat = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("/api/chat/my-chat");
      if (data.success && data.chat) {
        setChatData(data.chat);
        setMessages(data.chat.messages);
      }
    } catch (error) {
      console.error("Chat Error", error);
    }
  };

  // 🟢 SMART SCROLLING: Smoothly glides to the bottom when new messages arrive
  const scrollToBottom = (behavior = "smooth") => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: behavior,
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      // 🟢 BUG FIX: Corrected variable name from isFirstLoad to isInitialLoad
      scrollToBottom(isInitialLoad.current ? "instant" : "smooth");
      isInitialLoad.current = false;
    }
  }, [messages]);

  // Send Message
  const handleSend = async (textToSend = input) => {
    if ((!textToSend.trim() && !image) || chatData?.status === "closed") return;

    const formData = new FormData();
    formData.append("text", textToSend);
    if (image) formData.append("image", image);

    // Optimistic UI Update
    if (textToSend) {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: textToSend, createdAt: Date.now() },
      ]);
    }

    setInput("");
    setImage(null);
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      await axios.post("/api/chat/send", formData);
      fetchChat();
    } catch (error) {
      toast.error(t.support.failedSendMessage);
    }
  };

  // Actions
  const handleStatusChange = async (status) => {
    try {
      const { data } = await axios.post("/api/chat/status", { status });
      if (data.success) {
        fetchChat();
        toast.success(
          status === "closed"
            ? t.support.chatEndedSecurely
            : t.support.chatReopened,
        );
      }
    } catch (error) {
      toast.error(t.support.actionFailed);
    }
  };

  const handleNewChat = async () => {
    if (!confirm(t.support.startNewConversation)) return;
    try {
      const { data } = await axios.post("/api/chat/new");
      if (data.success) {
        fetchChat();
        toast.success(t.support.newSupportTicketOpened);
      }
    } catch (error) {
      toast.error(t.support.failedStartNewChat);
    }
  };

  // Polling interval to check for Admin replies
  useEffect(() => {
    if (token) {
      setLoadingChat(true);
      fetchChat().finally(() => setLoadingChat(false));
      const interval = setInterval(fetchChat, 3000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const isClosed = chatData?.status === "closed";

  return (
    <div className="font-outfit pt-8 pb-20 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="text-center py-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-extrabold text-[#4A76AC]0 mb-2"
        >
          {t.support.horizonBusinessSupport}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-500 font-medium"
        >
          Nous sommes là pour vous aider. Contactez notre équipe de support
          prioritaire.
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* 🟢 LEFT: Contact Info Cards */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
            <img
              className="w-full h-48 object-cover rounded-[1.2rem] group-hover:scale-105 transition-transform duration-500"
              src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop"
              alt="Contact Support Team"
            />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                <MapPin size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Nous visitez
                </h3>
                {/*
                <p className="text-sm text-slate-500 leading-relaxed mt-1">
                   102,
                  <br />
                  Mandvi, Surat - 394160, Gujarat
                </p> */}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                <Phone size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Nos contacts
                </h3>
                <p className="text-sm text-slate-500 mt-1">+237 694858557</p>
                <p className="text-xs text-slate-400 font-medium">
                  24h/24, 7j/7
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <Mail size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Email</h3>
                <p className="text-sm text-slate-500 mt-1">
                  support@horizonbusiness.com
                </p>
                {/* <p className="text-xs text-slate-400 font-medium">
                  We reply within 24hrs
                </p> */}
              </div>
            </div>
          </div>
        </div>

        {/* 🟢 RIGHT: Advanced Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-[650px] relative">
            {/* 1. Chat Header */}
            <div
              className={`p-5 flex items-center justify-between border-b transition-colors ${isClosed ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${isClosed ? "bg-slate-200 text-slate-500" : "bg-gradient-to-br from-green-500 to-emerald-600 text-white"}`}
                >
                  <Bot size={24} />
                  {!isClosed && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3
                    className={`font-black text-lg ${isClosed ? "text-slate-500" : "text-slate-900"}`}
                  >
                    {isClosed ? "Ticket Closed" : " Chat direct"}
                  </h3>
                  <p
                    className={`text-xs font-bold flex items-center gap-1.5 ${isClosed ? "text-slate-400" : "text-green-600"}`}
                  >
                    {isClosed ? "Archived Session" : "Reponse instantané"}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {token && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2.5 rounded-xl border transition-all ${showHistory ? "bg-slate-800 text-white border-slate-800" : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"}`}
                    title="Chat History"
                  >
                    <Clock size={18} />
                  </button>
                  {isClosed ? (
                    <button
                      onClick={handleNewChat}
                      className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition active:scale-95 flex items-center gap-2"
                    >
                      <RefreshCcw size={16} /> Nouveau Chat
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange("closed")}
                      className="p-2.5 bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 rounded-xl transition active:scale-95"
                      title="End Chat"
                    >
                      <Power size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 2. Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-slate-50/80 relative hide-scrollbar"
            >
              {!token ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                  <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center text-green-600 shadow-md mb-6">
                    <User size={36} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    Se connecter pour le Chat
                  </h3>
                  <p className="text-slate-500 max-w-xs mb-8 font-medium">
                    Acces direct au chat et se connecter pour voir les anciens
                    discussions
                  </p>
                  <button
                    onClick={() => setShowUserLogin(true)}
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                  >
                    S'enregistrer / Se connnecter
                  </button>
                </div>
              ) : loadingChat ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader className="animate-spin text-green-600" size={32} />
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 z-10">
                      <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                        <Bot size={28} className="text-green-500" />
                      </div>
                      <p className="font-bold text-slate-600">Aucun message</p>
                      <p className="text-sm font-medium mt-1">
                        Taper salut pour commencer une discussions
                      </p>
                    </div>
                  )}

                  {messages.map((msg, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={index}
                      className={`flex flex-col max-w-[85%] z-10 ${msg.sender === "user" ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <div
                        className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap leading-relaxed font-medium
                                                ${
                                                  msg.sender === "user"
                                                    ? "bg-slate-900 text-white rounded-tr-sm"
                                                    : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm"
                                                }`}
                      >
                        {msg.image && (
                          <div className="mb-3 overflow-hidden rounded-xl bg-slate-100 border border-slate-200/50">
                            <img
                              src={msg.image}
                              alt="attachment"
                              className="w-full h-auto object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                              onClick={() => window.open(msg.image, "_blank")}
                            />
                          </div>
                        )}

                        {msg.text?.startsWith("🤖") && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <Bot size={12} />
                            </div>
                            <span className="font-black text-[10px] text-green-600 uppercase tracking-widest">
                              Assistant Virtuel
                            </span>
                          </div>
                        )}

                        <p>{msg.text?.replace("🤖", "")}</p>

                        <p
                          className={`text-[9px] mt-2 font-bold ${msg.sender === "user" ? "text-slate-400 text-right" : "text-slate-400 text-left"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Quick Replies */}
                      {msg.quickReplies &&
                        msg.quickReplies.length > 0 &&
                        !isClosed && (
                          <div className="flex flex-wrap gap-2 mt-2 ml-1">
                            {msg.quickReplies.map((reply, i) => (
                              <button
                                key={i}
                                onClick={() => handleSend(reply)}
                                className="px-3 py-1.5 bg-white text-green-700 text-xs font-bold rounded-xl border border-green-100 hover:bg-green-50 transition-colors shadow-sm"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                    </motion.div>
                  ))}
                </>
              )}
            </div>

            {/* 3. Input Area */}
            {token && (
              <div
                className={`p-4 bg-white border-t border-slate-100 z-20 ${isClosed ? "opacity-60 pointer-events-none" : ""}`}
              >
                {/* Highly Visible Image Attachment Preview */}
                {image && (
                  <div className="flex items-center justify-between mb-4 bg-slate-50 border border-slate-200 p-2 pl-3 rounded-xl w-full shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          Image Attaché
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                          {image.name}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setImage(null)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-3 items-center"
                >
                  <label className="cursor-pointer p-3 rounded-full bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm">
                    <Camera size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setImage(e.target.files[0])}
                    />
                  </label>

                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-full px-6 py-3.5 outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all text-sm font-medium placeholder:text-slate-400"
                      type="text"
                      placeholder={
                        isClosed
                          ? "ce ticket a été fermé."
                          : image
                            ? "Ajouter une description (optional)..."
                            : "Entrer votre message..."
                      }
                      disabled={isClosed}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={(!input.trim() && !image) || isClosed}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-3.5 rounded-full transition-all shadow-md active:scale-95 border-2 border-transparent"
                  >
                    <Send
                      size={18}
                      className={input.trim() || image ? "translate-x-0.5" : ""}
                    />
                  </button>
                </form>
              </div>
            )}

            {/* 4. History Overlay */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-0 bg-white z-30 flex flex-col"
                >
                  <div className="bg-slate-900 text-white p-5 flex justify-between items-center shadow-md">
                    <h3 className="font-black flex items-center gap-2 text-lg">
                      <Clock size={20} className="text-blue-400" /> Chat
                      Archiver
                    </h3>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1.5 hover:bg-white/20 rounded-full transition active:scale-95"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 hide-scrollbar">
                    {(!chatData?.archived ||
                      chatData.archived.length === 0) && (
                      <div className="text-center mt-20 opacity-50">
                        <History
                          size={48}
                          className="mx-auto mb-4 text-slate-400"
                        />
                        <p className="font-bold text-slate-500">
                          Aucun past actif trouvé.
                        </p>
                      </div>
                    )}
                    {chatData?.archived?.map((session, i) => (
                      <div
                        key={i}
                        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">
                            Resolu
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(session.closedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {session.messages.slice(-3).map((m, j) => (
                            <div
                              key={j}
                              className="flex gap-2 items-start text-sm"
                            >
                              <span
                                className={`font-black text-[10px] uppercase tracking-widest mt-1 shrink-0 ${m.sender === "user" ? "text-slate-400" : "text-green-600"}`}
                              >
                                {m.sender === "user" ? "You:" : "Bot:"}
                              </span>
                              <p className="text-slate-600 font-medium leading-relaxed line-clamp-2">
                                {m.text || "📸 Image Attachment"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
