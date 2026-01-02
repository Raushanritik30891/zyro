import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, Crown, Trash2, Loader, 
  History, Medal, Award, Users, Sword, Target, 
  Star, Eye, EyeOff, Download, Plus, Edit3, X, 
  TrendingUp, BarChart2, CheckCircle2, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { 
  collection, getDocs, doc, query, orderBy, 
  writeBatch, where, deleteDoc, serverTimestamp, updateDoc, addDoc 
} from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Leaderboard = () => {
  // --- CORE STATES ---
  const [activeLobby, setActiveLobby] = useState('35');
  const [timeframe, setTimeframe] = useState('WEEKLY'); 
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [teams, setTeams] = useState([]);
  const [top10Teams, setTop10Teams] = useState([]);
  const [showAllTeams, setShowAllTeams] = useState(false);
  
  // --- ADMIN/AI STATES ---
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(""); 
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    totalKills: 0, avgPoints: 0, highestPoints: 0, totalPoints: 0
  });

  // --- MODAL STATES ---
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); 
  const [manualForm, setManualForm] = useState({ name: "", kills: "", points: "" });

  // --- 🔐 AUTH SECURITY ---
  useEffect(() => {
    const checkAdmin = auth.onAuthStateChanged((user) => {
      const admins = ["raushanritik30891@gmail.com", "ritikraushan@gmail.com", "admin@zyro.com"];
      if (user && admins.includes(user.email)) setIsAdmin(true);
    });
    return () => checkAdmin();
  }, []);

  // --- 📡 DATA SYNC ---
  useEffect(() => {
    fetchLeaderboard();
    if (isAdmin) fetchHistory();
  }, [activeLobby, timeframe, isAdmin]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "leaderboard"), 
        where("lobby", "==", activeLobby),
        where("type", "==", timeframe),
        orderBy("points", "desc"),
        orderBy("kills", "desc")
      );
      const snap = await getDocs(q);
      const allTeams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeams(allTeams);
      setTop10Teams(allTeams.slice(0, 10));
      
      const totalKills = allTeams.reduce((sum, t) => sum + (t.kills || 0), 0);
      const totalPoints = allTeams.reduce((sum, t) => sum + (t.points || 0), 0);
      
      setStats({
        totalKills,
        avgPoints: allTeams.length > 0 ? Math.round(totalPoints / allTeams.length) : 0,
        highestPoints: allTeams[0]?.points || 0,
        totalPoints
      });
    } catch (e) { 
      console.error("Fetch error:", e);
      setTeams([]);
      setTop10Teams([]);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "match_history"), orderBy("timestamp", "desc"), where("lobby", "==", activeLobby));
      const snap = await getDocs(q);
      setHistoryData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  // --- 🤖 AI VISION (GEMINI) - Robust Error Handling Added ---
  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ⚠️ Replace with your actual key logic or env variable
    const API_KEY = ""; 
    
    if(!API_KEY || !API_KEY.startsWith("AIzaSy")) {
      alert("🔑 API Key Missing or Invalid! Contact Admin.");
      return;
    }

    setScanning(true);
    setScanStatus("🔍 Analyzing Image...");
    const matchId = `MATCH-${Date.now()}`;

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
        setScanStatus("📝 Extracting Data...");
        // Updated prompt for better JSON reliability
        const result = await model.generateContent([
          `Extract Free Fire leaderboard. Return ONLY a valid JSON array of objects. 
           Format: [{"name": "Team Name", "kills": 10, "points": 50}].
           Strictly top 10 teams only. No markdown, no extra text.`,
          { inlineData: { data: base64, mimeType: file.type } }
        ]);

        const text = result.response.text();
        // Safe JSON parsing
        const cleanedText = text.replace(/```json|```/g, '').trim(); 
        const jsonStart = cleanedText.indexOf('[');
        const jsonEnd = cleanedText.lastIndexOf(']') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) throw new Error("Invalid AI Response");
        
        const extracted = JSON.parse(cleanedText.substring(jsonStart, jsonEnd)).slice(0, 10);
        
        setScanStatus(`🚀 Saving ${extracted.length} Teams...`);
        const batch = writeBatch(db);

        // Clear existing for this lobby/type
        const clearQ = query(
          collection(db, "leaderboard"), 
          where("lobby", "==", activeLobby), 
          where("type", "==", timeframe)
        );
        const existingSnap = await getDocs(clearQ);
        existingSnap.docs.forEach(doc => batch.delete(doc.ref));

        // Add new teams
        extracted.forEach((t, index) => {
          const docRef = doc(collection(db, "leaderboard"));
          batch.set(docRef, { 
            name: t.name,
            kills: Number(t.kills) || 0,
            points: Number(t.points) || 0,
            lobby: activeLobby, 
            type: timeframe, 
            matchId, 
            updatedAt: serverTimestamp(),
            rank: index + 1,
            timestamp: serverTimestamp(),
            source: 'AI_SCAN'
          });
        });

        const historyRef = doc(db, "match_history", matchId);
        batch.set(historyRef, {
          matchId,
          lobby: activeLobby,
          type: timeframe,
          teamCount: extracted.length,
          timestamp: serverTimestamp(),
          source: 'AI_SCAN'
        });

        await batch.commit();
        setScanStatus("✅ Done!"); 
        alert(`🏆 TOP 10 UPDATED! ${extracted.length} teams added.`);
        fetchLeaderboard();
        fetchHistory();
      };
    } catch (err) { 
      console.error(err); 
      alert("❌ AI Scan Failed. Please try manual entry or a clearer image."); 
    }
    setScanning(false);
    setScanStatus("");
  };

  // --- CRUD OPERATIONS ---
  const openManualModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setManualForm({ name: team.name, kills: team.kills, points: team.points });
    } else {
      setEditingTeam(null);
      setManualForm({ name: "", kills: "", points: "" });
    }
    setShowManualModal(true);
  };

  const handleManualSave = async () => {
    if (!manualForm.name || !manualForm.points) return alert("⚠️ Please fill Team Name and Points");

    try {
      if (editingTeam) {
        await updateDoc(doc(db, "leaderboard", editingTeam.id), {
          name: manualForm.name,
          kills: Number(manualForm.kills),
          points: Number(manualForm.points),
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "leaderboard"), {
          ...manualForm,
          kills: Number(manualForm.kills),
          points: Number(manualForm.points),
          lobby: activeLobby,
          type: timeframe,
          matchId: `MANUAL-${Date.now()}`,
          updatedAt: serverTimestamp(),
          source: 'MANUAL',
          timestamp: serverTimestamp()
        });
      }
      setShowManualModal(false);
      fetchLeaderboard();
    } catch (e) { alert("❌ Save Error"); }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm("Delete this team entry?")) {
      await deleteDoc(doc(db, "leaderboard", id));
      fetchLeaderboard();
    }
  };

  const exportData = () => {
    const data = showAllTeams ? teams : top10Teams;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaderboard_lobby_${activeLobby}_${timeframe}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-300', icon: <Crown size={14} /> };
    if (rank === 2) return { bg: 'bg-gray-300', text: 'text-black', border: 'border-gray-100', icon: <Medal size={14} /> };
    if (rank === 3) return { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-400', icon: <Award size={14} /> };
    return { bg: 'bg-gray-800', text: 'text-gray-300', border: 'border-gray-700', icon: <span className="text-xs font-bold">#{rank}</span> };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 overflow-x-hidden selection:bg-red-500/30">
      <Navbar />

      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-900/20 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 pt-24 px-4 max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-2"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
              Overall Standings
            </span>
          </motion.h1>
          <p className="text-gray-400 text-sm md:text-base tracking-widest uppercase font-medium">
            Lobby {activeLobby} • {timeframe} Rankings
          </p>
        </div>

        {/* --- MOBILE OPTIMIZED CONTROLS --- */}
        <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-md border-y border-white/10 py-3 -mx-4 px-4 mb-8">
          <div className="flex flex-col gap-3 max-w-7xl mx-auto">
            {/* Filters Row */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
              <div className="flex bg-gray-900/80 rounded-lg p-1 border border-white/5 shrink-0">
                {['WEEKLY', 'MONTHLY'].map(t => (
                  <button 
                    key={t} onClick={() => setTimeframe(t)} 
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              
              <div className="h-6 w-[1px] bg-white/10 shrink-0"></div>

              <div className="flex gap-2 shrink-0">
                {['35', '45', '55'].map(l => (
                  <button 
                    key={l} onClick={() => setActiveLobby(l)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${activeLobby === l ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-gray-800 bg-gray-900 text-gray-400'}`}
                  >
                    LOBBY {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                 <button 
                  onClick={() => setShowAllTeams(!showAllTeams)}
                  className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-white/5 hover:border-white/20 transition-all"
                >
                  {showAllTeams ? <EyeOff size={14}/> : <Eye size={14}/>}
                  <span className="hidden sm:inline">{showAllTeams ? 'Top 10' : 'View All'}</span>
                </button>
                <button onClick={exportData} className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs font-medium flex items-center gap-2 border border-white/5 hover:border-blue-500/50 transition-all">
                  <Download size={14} className="text-blue-400"/>
                </button>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                   <button onClick={() => setShowHistory(true)} className="p-2 bg-gray-800 rounded-lg border border-white/5">
                      <History size={16} />
                   </button>
                   <button onClick={() => openManualModal()} className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-600/20">
                      <Plus size={16} />
                   </button>
                   <label className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-red-600 rounded-lg text-xs font-bold uppercase cursor-pointer shadow-lg shadow-red-600/20 ${scanning ? 'opacity-50' : ''}`}>
                      {scanning ? <Loader className="animate-spin" size={14}/> : <Zap size={14} fill="currentColor"/>}
                      <span>{scanning ? "Scanning" : "AI Scan"}</span>
                      <input type="file" className="hidden" onChange={handleAIScan} disabled={scanning} />
                   </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- STATS GRID (Mobile: 2x2, Desktop: 4x1) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Teams', value: teams.length, icon: <Users size={16} className="text-gray-400"/> },
            { label: 'Total Kills', value: stats.totalKills, icon: <Sword size={16} className="text-red-400"/> },
            { label: 'Avg Pts', value: stats.avgPoints, icon: <BarChart2 size={16} className="text-blue-400"/> },
            { label: 'High Score', value: stats.highestPoints, icon: <TrendingUp size={16} className="text-green-400"/> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gray-900/40 border border-white/5 p-3 rounded-xl flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                {stat.icon} {stat.label}
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* --- MAIN CONTENT --- */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader size={40} className="text-red-500 animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest text-gray-500 animate-pulse">Syncing Database...</p>
          </div>
        ) : (showAllTeams ? teams : top10Teams).length > 0 ? (
          <div className="space-y-8">
            
            {/* --- PODIUM (Responsive) --- */}
            {(showAllTeams ? teams : top10Teams).length >= 3 && (
              <div className="relative pt-8 pb-4">
                <div className="flex items-end justify-center gap-2 md:gap-6">
                  {/* Rank 2 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-400 bg-gray-800 flex items-center justify-center mb-2 shadow-lg relative z-10">
                      <span className="text-xl font-bold text-gray-200">2</span>
                    </div>
                    <div className="bg-gradient-to-t from-gray-800 to-gray-900 w-24 md:w-32 h-28 md:h-40 rounded-t-lg border-t-4 border-gray-400 flex flex-col justify-end p-2 text-center">
                      <p className="text-xs font-bold truncate w-full text-gray-300">{(showAllTeams ? teams : top10Teams)[1]?.name}</p>
                      <p className="text-lg font-black text-white">{(showAllTeams ? teams : top10Teams)[1]?.points}</p>
                    </div>
                  </div>

                  {/* Rank 1 (Center) */}
                  <div className="flex flex-col items-center -mx-2 z-20 pb-1">
                    <Crown size={32} className="text-yellow-400 mb-1 animate-bounce" fill="currentColor" />
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-500 bg-gray-800 flex items-center justify-center mb-2 shadow-2xl shadow-yellow-500/20">
                      <span className="text-3xl font-black text-yellow-500">1</span>
                    </div>
                    <div className="bg-gradient-to-t from-yellow-900/50 to-gray-900 w-28 md:w-40 h-36 md:h-52 rounded-t-lg border-t-4 border-yellow-500 flex flex-col justify-end p-2 text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-yellow-500/10 blur-xl"></div>
                      <p className="text-xs md:text-sm font-black uppercase truncate w-full text-yellow-100 relative z-10">{(showAllTeams ? teams : top10Teams)[0]?.name}</p>
                      <p className="text-2xl md:text-3xl font-black text-white relative z-10">{(showAllTeams ? teams : top10Teams)[0]?.points}</p>
                    </div>
                  </div>

                  {/* Rank 3 */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-orange-600 bg-gray-800 flex items-center justify-center mb-2 shadow-lg relative z-10">
                      <span className="text-xl font-bold text-orange-600">3</span>
                    </div>
                    <div className="bg-gradient-to-t from-orange-900/30 to-gray-900 w-24 md:w-32 h-24 md:h-32 rounded-t-lg border-t-4 border-orange-600 flex flex-col justify-end p-2 text-center">
                      <p className="text-xs font-bold truncate w-full text-gray-300">{(showAllTeams ? teams : top10Teams)[2]?.name}</p>
                      <p className="text-lg font-black text-white">{(showAllTeams ? teams : top10Teams)[2]?.points}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- LIST VIEW (Mobile Optimized) --- */}
            <div className="flex flex-col gap-3">
              {(showAllTeams ? teams : top10Teams).slice(3).map((team, i) => {
                const rank = i + 4;
                const badge = getRankBadge(rank);
                
                return (
                  <motion.div 
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="group relative bg-gray-900/60 border border-white/5 rounded-xl p-3 flex items-center justify-between overflow-hidden hover:border-red-500/30 transition-all"
                  >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 shrink-0 rounded-lg ${badge.bg} ${badge.border} border flex items-center justify-center shadow-lg`}>
                        <div className={badge.text}>{badge.icon}</div>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col min-w-0">
                        <h4 className="font-bold text-sm md:text-base text-gray-100 truncate pr-2">
                          {team.name}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">
                          <span className="flex items-center gap-1"><Sword size={10} /> {team.kills} Kills</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                          <span>{Math.round((team.points / (team.kills || 1)) * 10) / 10} K/P</span>
                        </div>
                      </div>
                    </div>

                    {/* Points & Actions */}
                    <div className="flex items-center gap-4 pl-2">
                      <div className="text-right">
                        <div className="text-xl font-black text-white leading-none">{team.points}</div>
                        <div className="text-[9px] text-gray-500 uppercase tracking-widest">PTS</div>
                      </div>

                      {isAdmin && (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => openManualModal(team)} className="p-1.5 bg-gray-800 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors"><Edit3 size={12}/></button>
                          <button onClick={() => handleDeleteTeam(team.id)} className="p-1.5 bg-gray-800 text-red-500 rounded hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={12}/></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-gray-800 rounded-3xl bg-gray-900/20">
            <Trophy className="mx-auto mb-4 text-gray-700" size={48} />
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No Data Available</p>
            <p className="text-gray-600 text-xs mt-1">Upload a screenshot to begin</p>
          </div>
        )}
      </div>

      {/* --- MANUAL ENTRY MODAL --- */}
      <AnimatePresence>
        {showManualModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white uppercase">{editingTeam ? 'Edit Team' : 'Add Team'}</h3>
                <button onClick={() => setShowManualModal(false)}><X className="text-gray-500 hover:text-white"/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Team Name</label>
                  <input 
                    type="text" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})}
                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none"
                    placeholder="e.g. Team Liquid"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Kills</label>
                    <input 
                      type="number" value={manualForm.kills} onChange={e => setManualForm({...manualForm, kills: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Points</label>
                    <input 
                      type="number" value={manualForm.points} onChange={e => setManualForm({...manualForm, points: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
                <button onClick={handleManualSave} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg uppercase tracking-wide transition-all mt-2">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
             <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                <h3 className="font-bold text-white uppercase flex items-center gap-2"><History size={18}/> Match History</h3>
                <button onClick={() => setShowHistory(false)}><X className="text-gray-500 hover:text-white"/></button>
              </div>
              <div className="overflow-y-auto p-4 space-y-3">
                {historyData.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No history found</p>
                ) : (
                  historyData.map(match => (
                    <div key={match.id} className="bg-black/50 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-bold mb-1">{match.matchId}</div>
                        <div className="text-sm font-medium text-white">
                          Lobby {match.lobby} • {match.type} • {match.teamCount} Teams
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {match.timestamp?.toDate().toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Add revert logic here if needed from original code */}
                        <div className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">{match.source}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Leaderboard;