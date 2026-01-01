import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader, Zap } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Welcome Captain! I am Zyro AI. Ask me about Passes, Rules, or Tournaments." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 🧠 GEMINI AI LOGIC ---
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // --- CONTEXT INJECTION (AI Ko Train Karna) ---
        // Hum AI ko bata rahe hain ki wo kaun hai aur prices kya hain
        const context = `
            You are ZYRO AI, the official assistant for Zyro Esports Platform.
            Keep answers SHORT, COOL, and GAMER-STYLE.
            
            Key Info:
            1. SCOUT PASS: ₹49 (10 Points, Priority ID).
            2. WARRIOR PASS: ₹99 (20 Points, Direct Slot).
            3. GOD MODE: ₹199 (30 Points, Free Cap, Grand Final Slot).
            4. Points System: 100 Points = Free Match.
            5. Owner/Admin: Captain Zyro.
            6. Support: Available via WhatsApp on Profile page.
            
            User Question: ${input}
        `;

        const result = await model.generateContent(context);
        const response = await result.response;
        const botText = response.text();

        setMessages(prev => [...prev, { role: 'bot', text: botText }]);

    } catch (error) {
        console.error("Chat Error:", error);
        setMessages(prev => [...prev, { role: 'bot', text: "Server Overload! Try again later." }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-body">
      
      {/* --- CHAT WINDOW --- */}
      <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="mb-4 w-80 md:w-96 bg-voidBlack border border-rosePink/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[500px]"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-rosePink to-purple-900 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-full"><Bot size={18} className="text-white"/></div>
                        <div>
                            <h3 className="font-gaming font-bold text-white text-sm">ZYRO ASSISTANT</h3>
                            <div className="flex items-center gap-1 text-[10px] text-white/80">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/80">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-xs md:text-sm ${
                                msg.role === 'user' 
                                ? 'bg-rosePink text-white rounded-br-none' 
                                : 'bg-gray-800 text-gray-200 border border-white/10 rounded-bl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-gray-900 border-t border-white/10 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about prices, rules..." 
                        className="flex-1 bg-black border border-white/20 rounded-full px-4 py-2 text-sm text-white focus:border-rosePink focus:outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading}
                        className="p-2 bg-rosePink text-white rounded-full hover:bg-rosePink/80 transition-colors disabled:opacity-50"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- FLOATING TRIGGER BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-tr from-rosePink to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_#f43f5e] border-2 border-white/20 relative group"
      >
        <AnimatePresence mode='wait'>
            {isOpen ? <X size={28} className="text-white"/> : <MessageSquare size={28} className="text-white"/>}
        </AnimatePresence>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-rosePink blur-md opacity-50 animate-pulse -z-10"></div>
        
        {/* Tooltip */}
        {!isOpen && (
            <span className="absolute right-16 bg-white text-black text-xs font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                AI Help
            </span>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;