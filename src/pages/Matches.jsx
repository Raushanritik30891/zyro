import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Map, Clock, Trophy, Users, Zap, Crown, 
  MessageCircle, Calendar, ShieldCheck, AlertCircle 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- 🔐 AUTH & DATA SYNC ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get Live Matches
        const q = query(collection(db, "matches"), orderBy("timestamp", "desc"));
        const matchSnap = await getDocs(q);
        setMatches(matchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // 2. Get User Premium Status
        auth.onAuthStateChanged(async (user) => {
          if (user) {
            const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists()) setUserData(userSnap.data());
          }
        });
      } catch (err) { console.error("Sync Error:", err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- 📲 AUTOMATED WHATSAPP BOOKING ---
  const handleBook = (match) => {
    if (!auth.currentUser) return alert("Please Login to join the battle!");

    const isPremium = userData?.isPremium;
    const finalFee = isPremium ? "FREE (God Mode Active)" : `₹${match.fee}`;
    
    // Auto-Generated Message
    const text = `*🔥 BATTLE JOIN REQUEST 🔥*%0A%0A` +
                 `Player: ${auth.currentUser.displayName}%0A` +
                 `Match: ${match.title}%0A` +
                 `Map: ${match.map} (${match.type})%0A` +
                 `Time: ${match.time}%0A` +
                 `Status: ${isPremium ? '💎 PREMIUM WARRIOR' : '⚔️ Free Agent'}%0A` +
                 `Fee Payable: ${finalFee}%0A%0A` +
                 `Requesting slot confirmation...`;

    // Replace with your Admin Number
    const adminNumber = "919876543210"; 
    window.open(`https://wa.me/${adminNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 selection:bg-rosePink selection:text-white">
      <Navbar />

      {/* --- 🌌 CINEMATIC HERO HEADER --- */}
      <div className="relative pt-32 pb-16 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[url('https://wallpapers.com/images/hd/free-fire-battlegrounds-4k-j8w9q8z8q8z8q8z8.jpg')] bg-cover opacity-10 blur-sm pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#020202] via-transparent to-[#020202]"></div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10 px-4">
            <h1 className="text-5xl md:text-8xl font-gaming font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-600 mb-2">
                WAR ZONE
            </h1>
            <p className="text-gray-500 font-gaming text-[10px] md:text-xs tracking-[0.4em] uppercase flex items-center justify-center gap-2">
                <Swords size={14} className="text-rosePink"/> Live Battle Schedule <Swords size={14} className="text-rosePink"/>
            </p>
        </motion.div>
      </div>

      {/* --- ⚔️ MATCH LIST --- */}
      <div className="max-w-6xl mx-auto px-4 space-y-8 relative z-10">
        
        {loading ? (
            <div className="py-40 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-rosePink border-t-transparent rounded-full animate-spin"></div>
                <p className="font-gaming text-gray-500 tracking-widest text-xs uppercase">Loading Battle Data...</p>
            </div>
        ) : matches.length > 0 ? (
            <AnimatePresence>
                {matches.map((match) => (
                    <motion.div 
                        key={match.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-rosePink/40 transition-all duration-500"
                    >
                        {/* Status Strip */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${match.status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'} transition-all`}></div>

                        <div className="flex flex-col lg:flex-row">
                            
                            {/* --- LEFT: INFO --- */}
                            <div className="p-8 lg:p-10 flex-1 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden">
                                {/* Background Glow */}
                                <div className="absolute -left-20 -top-20 w-64 h-64 bg-rosePink/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-rosePink/20 transition-all"></div>

                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center min-w-[100px] backdrop-blur-md">
                                    <Clock className="mx-auto mb-2 text-rosePink" size={24}/>
                                    <div className="text-xl font-gaming font-black text-white">{match.time}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Start Time</div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-3xl font-gaming font-black text-white uppercase italic tracking-tight">{match.title}</h3>
                                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${match.status === 'OPEN' ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-red-500/30 text-red-500 bg-red-500/10'}`}>
                                            {match.status}
                                        </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-4 text-xs font-bold text-gray-400">
                                        <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg"><Map size={14} className="text-blue-400"/> {match.map}</span>
                                        <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg"><Users size={14} className="text-yellow-400"/> {match.type}</span>
                                        <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg"><Trophy size={14} className="text-rosePink"/> Pool: ₹{match.prize}</span>
                                        <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-lg"><ShieldCheck size={14} className="text-purple-400"/> Lobby {match.lobby}</span>
                                    </div>

                                    {/* SLOTS PROGRESS */}
                                    <div className="w-full max-w-sm mt-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-1">
                                            <span>Squads Joined</span>
                                            <span className="text-white">{match.filledSlots} / {match.totalSlots}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${(match.filledSlots / match.totalSlots) * 100}%` }} 
                                                className={`h-full ${match.filledSlots >= match.totalSlots ? 'bg-red-500' : 'bg-rosePink'}`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- RIGHT: ACTION --- */}
                            <div className="bg-white/5 p-8 lg:w-[320px] flex flex-col justify-center items-center gap-4 border-l border-white/5 relative">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Entry Fee</p>
                                    {userData?.isPremium ? (
                                        <div className="flex flex-col items-center">
                                            <span className="text-gray-600 line-through text-xs decoration-rosePink">₹{match.fee}</span>
                                            <span className="text-yellow-400 font-gaming font-black text-3xl flex items-center gap-2 animate-pulse">
                                                FREE <Crown size={24} fill="currentColor"/>
                                            </span>
                                            <p className="text-[9px] text-yellow-500/80 font-bold mt-1 uppercase tracking-widest">God Mode Active</p>
                                        </div>
                                    ) : (
                                        <div className="text-white font-gaming font-black text-4xl">₹{match.fee}</div>
                                    )}
                                </div>

                                {match.status === 'OPEN' && match.filledSlots < match.totalSlots ? (
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleBook(match)}
                                        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${userData?.isPremium ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-yellow-500/20' : 'bg-rosePink text-white hover:bg-rosePink/80 shadow-rosePink/20'}`}
                                    >
                                        <Zap size={16} fill="currentColor"/> {userData?.isPremium ? "Instant Join" : "Book Slot"}
                                    </motion.button>
                                ) : (
                                    <button disabled className="w-full py-4 bg-white/5 text-gray-500 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed border border-white/5">
                                        {match.filledSlots >= match.totalSlots ? "HOUSE FULL" : "REGISTRATION CLOSED"}
                                    </button>
                                )}
                                
                                {userData?.isPremium && (
                                    <div className="absolute top-4 right-4">
                                        <span className="relative flex h-3 w-3">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        ) : (
            <div className="text-center py-32 opacity-40">
                <AlertCircle size={64} className="mx-auto mb-4 text-gray-600"/>
                <h3 className="text-xl font-gaming font-black text-gray-500 uppercase">No Active Battlezones</h3>
                <p className="text-xs text-gray-600 mt-2 uppercase tracking-widest">Stay tuned for deployment</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Matches;