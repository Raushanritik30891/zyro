import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Map, Clock, Users, Trophy, ChevronRight, 
  Gamepad2, Calendar, MessageCircle, AlertCircle,
  Zap, Target, Crown, DollarSign, BookOpen, Star,
  Shield, Users as TeamIcon, Hash, Phone, Send, Eye,
  Search, MessageSquare, TrendingUp, Award
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, onSnapshot } from 'firebase/firestore';

// ⚠️ Apna WhatsApp Number yahan dalein (Country code ke saath)
const WHATSAPP_NUMBER = "918273264725"; // Replace with your number

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
    
🌟 *SLOT BOOKING REQUEST* 🌟
I want to join this tournament! 
Please book my slot and send payment details.
    
⌚ Request Time: ${currentTime}
    
#ZyroEsports #FreeFire #Tournament`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // View Details
  const handleViewDetails = (match) => {
    setActiveMatch(match);
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
        
        {/* SIMPLE HEADER */}
        <motion.div 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Tournaments
            </span>
          </h1>
          <p className="text-gray-400">Join exciting Free Fire tournaments and win prizes</p>
        </motion.div>

        {/* 🔍 SEARCH AND FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tournaments..."
                className="w-full bg-black/60 border border-gray-800 p-3 pl-10 rounded-xl text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18}/>
            </div>
          </div>

          <div className="flex bg-black/60 p-1 rounded-xl border border-gray-800">
            {['ALL', 'BR', 'CS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-bold text-white">{sortedMatches.length}</div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-bold text-green-400">
              {sortedMatches.filter(m => m.status === 'OPEN').length}
            </div>
            <div className="text-xs text-gray-400">Open</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-bold text-yellow-400">
              {sortedMatches.filter(m => m.featured).length}
            </div>
            <div className="text-xs text-gray-400">Featured</div>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-gray-800 text-center">
            <div className="text-xl font-bold text-blue-400">
              {sortedMatches.filter(m => m.category === 'BR').length}
            </div>
            <div className="text-xs text-gray-400">BR</div>
          </div>
        </div>

        {/* TOURNAMENT CARDS */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading tournaments...</p>
          </div>
        ) : sortedMatches.length === 0 ? (
          <div className="text-center py-20 bg-black/30 rounded-2xl border border-gray-800">
            <AlertCircle className="mx-auto mb-4 text-gray-600" size={48}/>
            <h3 className="text-xl font-bold text-gray-500 mb-2">No tournaments found</h3>
            <p className="text-gray-600">
              {searchQuery ? `No results for "${searchQuery}"` : 'Check back soon for new tournaments'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all group"
              >
                {/* CARD HEADER */}
                <div className="p-5 border-b border-gray-800">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-xs px-2 py-1 rounded ${match.category === 'BR' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {match.category}
                      </span>
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${match.status === 'OPEN' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {match.status}
                      </span>
                    </div>
                    {match.featured && (
                      <Star className="text-yellow-500" size={16}/>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 group-hover:text-orange-400 transition-all">
                    {match.title}
                  </h3>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Map size={14}/> {match.map}
                    </span>
                    <span>•</span>
                    <span>{match.type}</span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Date</div>
                      <div className="font-medium">
                        {new Date(match.time).toLocaleDateString('en-IN', { 
                          day: 'numeric',
                          month: 'short'
                        })}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Time</div>
                      <div className="font-medium text-yellow-400">
                        {new Date(match.time).toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-400">Prize</div>
                      <div className="text-lg font-bold text-green-400">₹{match.prizePool}</div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg text-center">
                      <div className="text-sm text-gray-400">Entry</div>
                      <div className="text-lg font-bold">₹{match.entryFee}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Slots</span>
                      <span>{match.filledSlots || 0}/{match.totalSlots}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${((match.filledSlots || 0) / match.totalSlots) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {match.perKill > 0 && (
                    <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 p-3 rounded-lg text-center mb-4">
                      <div className="text-sm text-gray-400">Per Kill</div>
                      <div className="text-lg font-bold text-yellow-400">₹{match.perKill}</div>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="p-5 border-t border-gray-800 space-y-3">
                  <button 
                    onClick={() => handleBookSlot(match)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18}/>
                    Book Now
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleViewDetails(match)}
                      className="py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={16}/>
                      Details
                    </button>
                    <button 
                      onClick={() => handleBookSlot(match)}
                      className="py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign size={16}/>
                      Payment
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* WHATSAPP FLOATING BUTTON - Position Adjusted */}
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
          className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all"
        >
          <MessageSquare className="text-white" size={24}/>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
        </motion.button>

        {/* HELP MESSAGE */}
        <div className="mt-12 text-center">
          <div className="inline-block p-5 bg-black/40 border border-gray-800 rounded-xl max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="text-green-500" size={20}/>
              <div className="text-left">
                <h4 className="font-bold">Need Help?</h4>
                <p className="text-sm text-gray-400">Click WhatsApp button for instant support</p>
              </div>
            </div>
            <button 
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-sm rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={16}/>
              Chat with Manager
            </button>
          </div>
        </div>
      </div>

      {/* MATCH DETAILS MODAL */}
      <AnimatePresence>
        {activeMatch && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 p-6 rounded-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Tournament Details</h3>
                <button 
                  onClick={() => setActiveMatch(null)} 
                  className="p-1 hover:bg-gray-800 rounded"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">{activeMatch.title}</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">Type</div>
                      <div>{activeMatch.category} • {activeMatch.type}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Map</div>
                      <div>{activeMatch.map}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Match Count</div>
                      <div>{activeMatch.matchCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <div className={activeMatch.status === 'OPEN' ? 'text-green-400' : 'text-yellow-400'}>
                        {activeMatch.status}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <h4 className="font-bold mb-3">Prize Distribution</h4>
                  <div className="space-y-2">
                    {activeMatch.rank1 > 0 && (
                      <div className="flex justify-between items-center p-2 bg-yellow-500/10 rounded">
                        <span>🥇 1st Prize</span>
                        <span className="font-bold">₹{activeMatch.rank1}</span>
                      </div>
                    )}
                    {activeMatch.rank2 > 0 && (
                      <div className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                        <span>🥈 2nd Prize</span>
                        <span>₹{activeMatch.rank2}</span>
                      </div>
                    )}
                    {activeMatch.rank3 > 0 && (
                      <div className="flex justify-between items-center p-2 bg-orange-500/10 rounded">
                        <span>🥉 3rd Prize</span>
                        <span>₹{activeMatch.rank3}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <button 
                    onClick={() => handleBookSlot(activeMatch)}
                    className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:scale-[1.02] transition-all"
                  >
                    Book Slot on WhatsApp
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