import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, ExternalLink, Globe, Zap, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';

const Contact = () => {
  return (
    <div className="min-h-screen bg-voidBlack text-white pb-20">
      <Navbar />

      <div className="pt-32 px-4 max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        
        {/* --- LEFT: INFO --- */}
        <div className="lg:w-1/3 space-y-6">
            <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }} className="text-5xl md:text-7xl font-gaming font-black italic uppercase leading-none text-transparent bg-clip-text bg-gradient-to-br from-rosePink to-purple-600">
                HQ LINE
            </motion.h1>
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">24/7 Deployment Support</p>

            <div className="space-y-4 pt-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4 group hover:border-rosePink/30 transition-all">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><MessageCircle/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Direct HQ Link</p>
                        <a href="https://wa.me/91XXXXXXXXXX" className="text-white font-gaming hover:text-green-500 flex items-center gap-2">WHATSAPP CHAT <ExternalLink size={12}/></a>
                    </div>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Mail/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Encryption Mail</p>
                        <p className="text-white font-gaming">support@zyroesports.com</p>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT: FORM --- */}
        <div className="flex-1">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-panel-dark p-10 rounded-[3rem] border border-white/10 relative">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={100} className="text-rosePink"/></div>
                <h2 className="text-3xl font-gaming font-black uppercase italic mb-8">Send Data Signal</h2>
                
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="text" placeholder="WARRIOR NAME" className="contact-input" />
                        <input type="email" placeholder="ENCRYPTION EMAIL" className="contact-input" />
                    </div>
                    <select className="contact-input">
                        <option>PURCHASE ISSUE</option>
                        <option>MATCH DISPUTE</option>
                        <option>RANK ERROR</option>
                        <option>OTHER SIGNALS</option>
                    </select>
                    <textarea rows="5" placeholder="TRANSMIT MESSAGE..." className="contact-input resize-none"></textarea>
                    
                    <button className="w-full py-5 bg-gradient-to-r from-rosePink to-purple-600 rounded-2xl font-black uppercase tracking-[0.3em] italic hover:scale-105 transition-all shadow-[0_0_30px_#f43f5e]">
                        INITIALIZE TRANSMISSION
                    </button>
                </form>
            </motion.div>
        </div>
      </div>

      <style>{`
        .contact-input {
            width: 100%;
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            padding: 1.2rem 1.5rem;
            border-radius: 1.5rem;
            font-size: 0.8rem;
            font-weight: 700;
            color: white;
            outline: none;
            transition: 0.3s;
        }
        .contact-input:focus {
            border-color: #f43f5e;
            background: rgba(244, 63, 94, 0.05);
        }
        select option {
            background: #050505;
        }
      `}</style>
    </div>
  );
};

export default Contact;