import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, MessageSquare, Mail, Phone, MapPin, 
  CheckCircle, Loader, Headset, Zap 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';

const Contact = () => {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return addNotification('error', "Fill all required fields!");

    setLoading(true);
    try {
      // 🚀 SYNC WITH ADMIN PANEL: Saving to 'contact_messages'
      await addDoc(collection(db, "contact_messages"), {
        ...formData,
        userId: auth.currentUser?.uid || "GUEST",
        status: "unread",
        timestamp: serverTimestamp()
      });

      setSubmitted(true);
      addNotification('success', "Message transmitted to HQ!");
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (err) {
      console.error(err);
      addNotification('error', "Transmission failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />

      {/* Hero Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rosePink/10 blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <div className="pt-32 px-4 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-6xl md:text-8xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-600 uppercase tracking-tighter"
          >
            CONTACT HQ
          </motion.h1>
          <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4 uppercase">Direct Line to Zyro Command Center</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* --- INFO CARDS --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:border-rosePink/50 transition-all group">
              <div className="p-3 bg-rosePink/10 rounded-2xl w-fit mb-4 text-rosePink group-hover:scale-110 transition-transform">
                <Mail size={24}/>
              </div>
              <h3 className="font-gaming font-black text-white italic uppercase mb-2">Email Ops</h3>
              <p className="text-gray-400 text-sm">zyro.esports.7@gmail.com</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all group">
              <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                <MessageSquare size={24}/>
              </div>
              <h3 className="font-gaming font-black text-white italic uppercase mb-2">WhatsApp Hub</h3>
              <p className="text-gray-400 text-sm">+91 82732 64725</p>
            </div>

            <div className="bg-rosePink/5 border border-rosePink/20 p-8 rounded-[3rem] relative overflow-hidden">
                <Zap className="absolute -right-4 -bottom-4 text-rosePink/10" size={120}/>
                <h4 className="font-gaming font-black text-rosePink italic mb-2">PRIORITY SUPPORT</h4>
                <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">GOD PASS holders get instant DM support and priority query resolution.</p>
            </div>
          </div>

          {/* --- CONTACT FORM --- */}
          <div className="lg:col-span-8">
            <div className="bg-[#080808] p-8 md:p-12 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
              {submitted ? (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
                  <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48}/>
                  </div>
                  <h2 className="text-3xl font-gaming font-black text-white italic mb-4">MESSAGE RECEIVED!</h2>
                  <p className="text-gray-500 uppercase tracking-widest text-xs">Our team will contact you shortly via email or WhatsApp.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-10 text-rosePink font-black text-xs uppercase border-b border-rosePink">Send another report</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="contact-label">Commander Name</label>
                      <input type="text" className="contact-input" placeholder="YOUR NAME" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})}/>
                    </div>
                    <div className="space-y-2">
                      <label className="contact-label">Email Frequency</label>
                      <input type="email" className="contact-input" placeholder="EMAIL ADDRESS" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})}/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="contact-label">Subject</label>
                    <select className="contact-input" value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})}>
                      <option>General Inquiry</option>
                      <option>Payment Issue</option>
                      <option>Tournament Complaint</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="contact-label">Operational Intelligence (Message)</label>
                    <textarea className="contact-input h-40 resize-none pt-4" placeholder="DESCRIBE YOUR ISSUE OR QUERY..." value={formData.message} onChange={e=>setFormData({...formData, message: e.target.value})}></textarea>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-rosePink to-purple-600 text-white font-gaming font-black text-lg rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_rgba(244,63,94,0.3)] flex items-center justify-center gap-3 uppercase italic"
                  >
                    {loading ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}
                    {loading ? "TRANSMITTING..." : "SEND MESSAGE TO HQ"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .contact-label { font-size: 10px; font-weight: 900; color: #555; text-transform: uppercase; margin-left: 12px; display: block; letter-spacing: 0.1em; }
        .contact-input { width: 100%; background: #000; border: 1px solid #1a1a1a; padding: 1.2rem; border-radius: 1.2rem; font-size: 0.8rem; font-weight: 800; color: #fff; outline: none; transition: 0.3s; text-transform: uppercase; }
        .contact-input:focus { border-color: #f43f5e; background: #050505; }
      `}</style>
    </div>
  );
};

export default Contact;