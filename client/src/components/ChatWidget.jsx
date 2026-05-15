import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatWidget = () => {
  const { token, axios, user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchChat = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("/api/chat/my-chat");
      if (data.success && data.chat) setMessages(data.chat.messages);
    } catch (error) {
      console.error(error);
    }
  };

  // 🟢 CRITICAL FIX: Accepts text directly for Quick Replies & uses FormData
  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    // Optimistic UI Update
    const tempMsg = { sender: "user", text: textToSend, createdAt: Date.now() };
    setMessages((prev) => [...prev, tempMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 🟢 The fix! Sending as FormData so backend Multer doesn't crash
      const formData = new FormData();
      formData.append("text", textToSend);

      const { data } = await axios.post("/api/chat/send", formData);

      if (data.success) {
        fetchChat();
      }
    } catch (error) {
      console.error("Send failed");
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchChat();
      const interval = setInterval(fetchChat, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, token]);

  // 🟢 Listen for external requests (like "Report Issue" from MyOrders)
  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail && e.detail.text) {
        // Wait briefly for smooth open, then send the message
        setTimeout(() => handleSend(e.detail.text), 500);
      }
    };
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  if (!user || user.role !== "user") return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-outfit">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white w-80 h-[420px] rounded-2xl shadow-2xl border border-gray-200 flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-green-600 p-4 text-white flex justify-between items-center shadow-md z-10">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    horizon shop
                  </h3>
                  <p className="text-[10px] text-green-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"></span>{" "}
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-green-700 p-1 rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/80 flex flex-col gap-4 relative hide-scrollbar">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-70">
                  <Bot size={40} className="mb-2" />
                  <p className="text-center text-sm">
                    System Ready. Say hello to begin. ✨
                  </p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.sender === "user" ? "bg-green-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"}`}
                  >
                    {msg.text}
                  </div>

                  {/* 🟢 NEW: Render Quick Replies in the Widget! */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.quickReplies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(reply)}
                          className="px-2.5 py-1.5 bg-white text-green-700 text-[10px] font-bold rounded-lg border border-green-100 hover:bg-green-50 transition shadow-sm"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-gray-400 mt-1 px-1 font-medium">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <motion.div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                    />
                    <motion.div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="pb-2" />
            </div>

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center z-10"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-green-500 focus:bg-white transition-all"
                placeholder="Type a message..."
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-2xl shadow-green-600/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95 border-2 border-white"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default ChatWidget;
