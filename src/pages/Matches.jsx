import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Map, Clock, Users, Trophy, ChevronRight, 
  Gamepad2, Calendar, MessageCircle, AlertCircle,
  Zap, Target, Crown, DollarSign, BookOpen, Star,
  Shield, Users as TeamIcon, Hash, Phone, Send, Eye,
  Search // ✅ This should be imported correctly
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, onSnapshot } from 'firebase/firestore';

// ⚠️ Apna WhatsApp Number yahan dalein (Country code ke saath)
const WHATSAPP_NUMBER = "919876543210"; 

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, BR, CS
  const [activeMatch, setActiveMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- 🔥 REAL-TIME MATCHES FETCH ---
  useEffect(() => {
    setLoading(true);
    
    // Real-time listener for matches
    const q = query(
      collection(db, "matches"), 
      orderBy("timestamp", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matchesData = [];
      querySnapshot.forEach((doc) => {
        matchesData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log("Fetched matches:", matchesData.length); // Debug log
      setMatches(matchesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching matches:", error);
      setLoading(false);
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  // Filter Logic - Show only OPEN and UPCOMING matches
  const filteredMatches = matches.filter(match => {
    // Status filter - only show OPEN and UPCOMING
    if (match.status !== 'OPEN' && match.status !== 'UPCOMING') return false;
    
    // Category filter
    if (filter !== 'ALL' && match.category !== filter) return false;
    
    // Search filter
    if (searchQuery && !match.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort matches: OPEN first, then UPCOMING, then by time
  const sortedMatches = filteredMatches.sort((a, b) => {
    // Status priority: OPEN > UPCOMING
    const statusOrder = { 'OPEN': 1, 'UPCOMING': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    
    // Then by time (earliest first)
    return new Date(a.time) - new Date(b.time);
  });

  // WhatsApp Slot Booking
  const handleBookSlot = (match) => {
    const currentTime = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const message = `🔥 *ZYRO ESPORTS - TOURNAMENT BOOKING* 🔥
    
🆔 *Tournament ID:* ${match.id.slice(0, 8).toUpperCase()}
🎮 *Event:* ${match.title}
🏆 *Type:* ${match.category} • ${match.type}
🗺️ *Map:* ${match.map}
📅 *Date:* ${new Date(match.time).toLocaleDateString('en-IN')}
⏰ *Time:* ${new Date(match.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
💰 *Entry Fee:* ₹${match.entryFee}
🏅 *Prize Pool:* ₹${match.prizePool}
    
🌟 *SUPER SAIYAN SLOT REQUEST!* 🌟
Kamehameha! I want to join this tournament! 
Please book my slot and send payment details.
    
⚡ *Goku Style:* Let's go! I'm ready to fight!
    
⌚ Request Time: ${currentTime}
    
#ZyroEsports #FreeFire #Tournament`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // View Details
  const handleViewDetails = (match) => {
    setActiveMatch(match);
  };

  // Debug function to check data
  const debugMatches = () => {
    console.log("All matches:", matches);
    console.log("Filtered matches:", filteredMatches);
    console.log("Match statuses:", matches.map(m => ({ title: m.title, status: m.status })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans pb-20 overflow-x-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="pt-28 px-4 max-w-[1800px] mx-auto relative z-10">
        
        {/* HEADER */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12 relative"
        >
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-yellow-400 rounded-full"></div>
              <Star className="absolute inset-0 m-auto text-black" size={40}/>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              TOURNAMENT ARENA
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-bold uppercase tracking-[0.5em]">
            CHOOSE YOUR BATTLE • PROVE YOUR POWER
          </p>
        </motion.div>

        {/* 🔍 SEARCH AND FILTER BAR */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tournaments..."
                className="w-full bg-black/60 border border-gray-800 p-4 pl-12 rounded-2xl text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Using Search icon directly - if still error, use SearchCircle or SearchIcon */}
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20}/>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex bg-black/60 p-1.5 rounded-2xl border border-gray-800">
            {[
              { id: 'ALL', label: '🔥 ALL', icon: <Swords size={16}/> },
              { id: 'BR', label: '⚔️ BR', icon: <Target size={16}/> },
              { id: 'CS', label: '🛡️ CS', icon: <Shield size={16}/> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-6 py-3 rounded-xl font-black text-sm uppercase transition-all flex items-center gap-2 ${filter === tab.id ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* DEBUG BUTTON - Remove in production */}
          <button 
            onClick={debugMatches}
            className="px-4 py-2 bg-gray-800/50 text-xs text-gray-400 rounded-lg hover:bg-gray-700"
            title="Debug matches"
          >
            Debug
          </button>
        </div>

        {/* 📊 STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-black/40 p-4 rounded-2xl border border-gray-800">
            <div className="text-3xl font-black text-yellow-400">{sortedMatches.length}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Active Battles</div>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-gray-800">
            <div className="text-3xl font-black text-green-400">
              {sortedMatches.filter(m => m.status === 'OPEN').length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Open Now</div>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-gray-800">
            <div className="text-3xl font-black text-blue-400">
              {sortedMatches.filter(m => m.featured).length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Featured</div>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-gray-800">
            <div className="text-3xl font-black text-purple-400">
              {sortedMatches.filter(m => m.category === 'BR').length}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">BR Matches</div>
          </div>
        </div>

        {/* ⚔️ TOURNAMENT CARDS GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="text-yellow-400 animate-pulse" size={32}/>
              </div>
            </div>
            <p className="text-xl font-bold text-gray-400">Loading Tournaments...</p>
            <p className="text-sm text-gray-600 mt-2">Fetching latest battles</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full text-center py-32"
          >
            <div className="relative mb-8">
              <AlertCircle className="mx-auto text-gray-700" size={80}/>
              <div className="absolute -inset-8 bg-gray-900/50 blur-3xl rounded-full"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-600 mb-4">No Active Tournaments Found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {searchQuery ? `No tournaments found for "${searchQuery}"` : 
               `No ${filter === 'ALL' ? '' : filter + ' '}tournaments are currently active. Check back soon!`}
            </p>
            
            {/* DEBUG INFO */}
            {matches.length > 0 && (
              <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-gray-800 max-w-2xl mx-auto">
                <h4 className="text-lg font-bold mb-4">Debug Information:</h4>
                <div className="text-left space-y-2">
                  <p className="text-sm">Total matches in database: <span className="text-yellow-400">{matches.length}</span></p>
                  <p className="text-sm">Match statuses:</p>
                  <ul className="text-sm text-gray-400 space-y-1 ml-4">
                    {matches.map((m, i) => (
                      <li key={i}>• {m.title} - <span className={m.status === 'OPEN' ? 'text-green-400' : 'text-yellow-400'}>{m.status}</span></li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {sortedMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -10 }}
                  className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800 rounded-3xl overflow-hidden group hover:border-orange-500/50 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20 relative"
                >
                  {/* FEATURED BADGE */}
                  {match.featured && (
                    <div className="absolute -top-3 -right-3 z-20">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
                          <Crown className="text-black" size={24}/>
                        </div>
                        <div className="absolute -ins-2 bg-yellow-500/20 blur-md rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* STATUS BADGE */}
                  <div className="absolute top-6 left-6 z-10">
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${match.status === 'OPEN' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${match.status === 'OPEN' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        {match.status}
                      </div>
                    </div>
                  </div>

                  {/* CARD HEADER */}
                  <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-2 rounded-xl ${match.category === 'BR' ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                        {match.category === 'BR' ? <Target className="text-red-400" size={20}/> : <Shield className="text-blue-400" size={20}/>}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        {match.category} • {match.type}
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-2 group-hover:text-orange-400 transition-all line-clamp-2">
                      {match.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Map size={14}/> {match.map}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Hash size={14}/> {match.matchCount}
                      </span>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="p-6">
                    {/* SCHEDULE */}
                    <div className="mb-6 p-4 bg-black/40 rounded-2xl border border-gray-800">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="text-orange-400" size={20}/>
                        <span className="font-bold">Schedule</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Date</span>
                          <span className="font-medium">{new Date(match.time).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Time</span>
                          <span className="font-medium text-yellow-400">
                            {new Date(match.time).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PRIZE & SLOTS */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-black/40 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="text-yellow-500" size={18}/>
                          <span className="text-sm font-bold">Prize Pool</span>
                        </div>
                        <div className="text-2xl font-black text-green-400">₹{match.prizePool}</div>
                        <div className="text-xs text-gray-500 mt-1">Entry: ₹{match.entryFee}</div>
                      </div>
                      
                      <div className="p-4 bg-black/40 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TeamIcon className="text-blue-500" size={18}/>
                          <span className="text-sm font-bold">Slots</span>
                        </div>
                        <div className="text-2xl font-black text-white">
                          {match.filledSlots || 0}/{match.totalSlots}
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${((match.filledSlots || 0) / match.totalSlots) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* PER KILL BONUS */}
                    {match.perKill > 0 && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <Zap className="text-yellow-500 animate-pulse" size={20}/>
                          <div>
                            <p className="font-bold">Per Kill Bonus</p>
                            <p className="text-2xl font-black text-yellow-400">₹{match.perKill}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="p-6 border-t border-gray-800 space-y-3">
                    {/* PRIMARY BOOKING BUTTON */}
                    <button 
                      onClick={() => handleBookSlot(match)}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                    >
                      <MessageCircle className="group-hover/btn:animate-bounce" size={20}/>
                      <span>📞 BOOK SLOT VIA WHATSAPP</span>
                    </button>
                    
                    {/* SECONDARY ACTIONS */}
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleBookSlot(match)}
                        className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        <DollarSign size={16}/> PAYMENT
                      </button>
                      <button 
                        onClick={() => handleViewDetails(match)}
                        className="py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16}/> DETAILS
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* 📱 WHATSAPP FLOATING BUTTON */}
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all"
        >
          <Phone className="text-white" size={28}/>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        </motion.button>

        {/* 💬 HELP MESSAGE */}
        <div className="mt-16 text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-3xl max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl">
                <Send className="text-white" size={24}/>
              </div>
              <div className="text-left">
                <h4 className="text-xl font-bold">Need Instant Help?</h4>
                <p className="text-gray-400">Click WhatsApp button for instant tournament booking and payment support</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              <MessageCircle size={20}/> Chat with Tournament Manager
            </button>
          </div>
        </div>
      </div>

      {/* 🏆 MATCH DETAILS MODAL */}
      <AnimatePresence>
        {activeMatch && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-orange-500/30 p-8 rounded-3xl max-w-2xl w-full shadow-2xl shadow-orange-500/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  TOURNAMENT DETAILS
                </h3>
                <button 
                  onClick={() => setActiveMatch(null)} 
                  className="p-2 hover:bg-gray-800 rounded-full transition-all"
                >
                  <ChevronRight size={24}/>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Match Info */}
                <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                  <h4 className="text-xl font-bold mb-4">{activeMatch.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Category</p>
                      <p className="font-bold">{activeMatch.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Type</p>
                      <p className="font-bold">{activeMatch.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Map</p>
                      <p className="font-bold">{activeMatch.map}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Match Count</p>
                      <p className="font-bold">{activeMatch.matchCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className={`font-bold ${activeMatch.status === 'OPEN' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {activeMatch.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="font-bold">
                        {activeMatch.timestamp?.toDate ? 
                          new Date(activeMatch.timestamp.toDate()).toLocaleDateString() : 
                          'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prize Distribution */}
                {(activeMatch.rank1 > 0 || activeMatch.rank2 > 0 || activeMatch.rank3 > 0) && (
                  <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-3">
                      <Trophy className="text-yellow-500"/> Prize Distribution
                    </h4>
                    <div className="space-y-3">
                      {activeMatch.rank1 > 0 && (
                        <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-xl">
                          <span className="font-bold">🥇 Rank 1</span>
                          <span className="text-2xl font-black text-yellow-400">₹{activeMatch.rank1}</span>
                        </div>
                      )}
                      {activeMatch.rank2 > 0 && (
                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-xl">
                          <span className="font-bold">🥈 Rank 2</span>
                          <span className="text-xl font-bold text-gray-300">₹{activeMatch.rank2}</span>
                        </div>
                      )}
                      {activeMatch.rank3 > 0 && (
                        <div className="flex justify-between items-center p-3 bg-orange-500/10 rounded-xl">
                          <span className="font-bold">🥉 Rank 3</span>
                          <span className="text-xl font-bold text-orange-400">₹{activeMatch.rank3}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-800">
                  <button 
                    onClick={() => handleBookSlot(activeMatch)}
                    className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all"
                  >
                    Book Slot Now
                  </button>
                  <button 
                    onClick={() => setActiveMatch(null)}
                    className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Matches;