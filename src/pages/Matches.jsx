import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Map, Clock, Users, Trophy, ChevronRight, 
  Gamepad2, Calendar, MessageCircle, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar'; // Global Navbar
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

// ⚠️ SETUP: Apna WhatsApp Number yahan dalein (Country code ke saath)
const WHATSAPP_NUMBER = "919876543210"; 

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, BR, CS

  // --- 🔥 FETCH MATCHES ---
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Sirf wahi matches layenge jo 'OPEN' hain
        const q = query(
          collection(db, "matches"), 
          where("status", "==", "OPEN"),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);
        const matchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMatches(matchesData);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter Logic
  const filteredMatches = matches.filter(m => filter === 'ALL' || m.category === filter);

  // WhatsApp Redirect Logic
  const handleJoin = (match) => {
    const message = `Hello Zyro! I want to join the tournament:%0A%0A🏆 *${match.title}*%0A🗺️ Map: ${match.map}%0A🕒 Time: ${match.time}%0A💰 Entry: ₹${match.entryFee}%0A%0APlease book my slot!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rosePink/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full"></div>
      </div>

      <div className="pt-32 px-4 max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <motion.h1 
              initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="text-4xl md:text-6xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-500 uppercase tracking-tighter"
            >
              LIVE WARZONES
            </motion.h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">Select your battleground</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {['ALL', 'BR', 'CS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${filter === tab ? 'bg-rosePink text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {tab === 'BR' ? 'Battle Royale' : tab === 'CS' ? 'Clash Squad' : 'All Events'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-rosePink border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredMatches.length === 0 && (
                <div className="col-span-full text-center py-20 opacity-30">
                  <AlertCircle size={60} className="mx-auto mb-4"/>
                  <p className="font-gaming uppercase tracking-widest">No Active Battles in this Sector</p>
                </div>
              )}

              {filteredMatches.map((match, i) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden group hover:border-rosePink/50 transition-all shadow-2xl"
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Open</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Gamepad2 size={12}/> {match.category} • {match.type}
                    </p>
                    <h3 className="text-2xl font-gaming font-black text-white italic uppercase leading-none mb-1">{match.title}</h3>
                    <p className="text-xs font-bold text-rosePink uppercase tracking-wider">{match.map}</p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Schedule</p>
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Calendar size={14} className="text-rosePink"/> 
                        {new Date(match.time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-white mt-1">
                        <Clock size={14} className="text-rosePink"/> 
                        {new Date(match.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-gray-500 font-bold uppercase mb-1">Prize Pool</p>
                      <div className="flex items-center gap-2 text-xl font-gaming font-black text-green-500 italic">
                        <Trophy size={18}/> ₹{match.prizePool}
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1">Entry: ₹{match.entryFee}</p>
                    </div>
                  </div>

                  {/* Join Button */}
                  <button 
                    onClick={() => handleJoin(match)}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-500 text-black font-gaming font-black text-lg uppercase rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3"
                  >
                    <MessageCircle size={20} fill="black"/> JOIN VIA WHATSAPP
                  </button>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;