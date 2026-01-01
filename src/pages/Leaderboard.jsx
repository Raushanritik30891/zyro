import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, Crown, Trash2, Loader, Calendar, 
  History, RotateCcw, AlertCircle, CheckCircle2, 
  Plus, Edit3, Save, X, Users, Sword, Target, 
  Star, Flame, Shield, Skull, Award, Medal,
  ChevronUp, ChevronDown, TrendingUp, BarChart3,
  Download, Filter, Eye, EyeOff, RefreshCw,
  BarChart2, PieChart, LineChart, GitBranch
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
    totalKills: 0,
    avgPoints: 0,
    highestPoints: 0,
    totalPoints: 0
  });

  // --- MANUAL EDIT STATES ---
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
      
      // Calculate stats
      const totalKills = allTeams.reduce((sum, t) => sum + (t.kills || 0), 0);
      const totalPoints = allTeams.reduce((sum, t) => sum + (t.points || 0), 0);
      const highestPoints = allTeams[0]?.points || 0;
      
      setStats({
        totalKills,
        avgPoints: allTeams.length > 0 ? Math.round(totalPoints / allTeams.length) : 0,
        highestPoints,
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

  // --- 🤖 AI VISION (GEMINI) ---
  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const API_KEY = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx";
    if(!API_KEY || API_KEY.includes("AIzaSy") === false) {
      alert("🔑 API Key Missing! Contact Admin.");
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
        const result = await model.generateContent([
          `Extract Free Fire leaderboard with top 10 teams. Return JSON: [{"name":string,"kills":number,"points":number}]. Only top 10 teams.`,
          { inlineData: { data: base64, mimeType: file.type } }
        ]);

        const text = result.response.text();
        const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1);
        const extracted = JSON.parse(jsonStr).slice(0, 10);
        
        setScanStatus(`🚀 Uploading ${extracted.length} Teams...`);
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
            ...t, 
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
        alert(`🏆 TOP 10 UPDATED! ${extracted.length} teams added to Lobby ${activeLobby}.`);
        fetchLeaderboard();
        fetchHistory();
      };
    } catch (err) { 
      console.error(err); 
      alert("❌ AI Scan Failed. Try Manual Add."); 
    }
    setScanning(false);
    setScanStatus("");
  };

  // --- 📝 MANUAL ADD / EDIT ---
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
    if (!manualForm.name || !manualForm.points) return alert("⚠️ Fill Details");

    try {
      if (editingTeam) {
        await updateDoc(doc(db, "leaderboard", editingTeam.id), {
          name: manualForm.name,
          kills: Number(manualForm.kills),
          points: Number(manualForm.points),
          updatedAt: serverTimestamp()
        });
        alert("✅ Team updated!");
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
        alert("✅ Team added!");
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

  const handleRevertMatch = async (matchId) => {
    if (!window.confirm("Revert points for this match?")) return;
    setLoading(true);
    try {
      const q = query(collection(db, "leaderboard"), where("matchId", "==", matchId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref)); 
      batch.delete(doc(db, "match_history", matchId));
      await batch.commit();
      alert("🔄 MATCH REVERTED.");
      fetchLeaderboard();
      fetchHistory();
    } catch (e) { alert("❌ Revert Failed!"); }
    setLoading(false);
  };

  const exportData = () => {
    const data = showAllTeams ? teams : top10Teams;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leaderboard_lobby_${activeLobby}_${timeframe}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert(`📥 ${data.length} teams exported`);
  };

  // --- 🏆 RANK BADGE COLORS ---
  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: 'from-yellow-600 to-yellow-400', text: 'text-black', icon: <Crown size={16} /> };
    if (rank === 2) return { bg: 'from-gray-400 to-gray-300', text: 'text-black', icon: <Medal size={16} /> };
    if (rank === 3) return { bg: 'from-orange-700 to-orange-500', text: 'text-white', icon: <Award size={16} /> };
    if (rank <= 5) return { bg: 'from-purple-600 to-purple-400', text: 'text-white', icon: <Star size={16} /> };
    if (rank <= 10) return { bg: 'from-blue-600 to-blue-400', text: 'text-white', icon: <Target size={16} /> };
    return { bg: 'from-gray-800 to-gray-600', text: 'text-gray-400', icon: null };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans pb-20 overflow-x-hidden">
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
      </div>

      <div className="pt-32 pb-12 text-center relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-8xl font-bold italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-500 to-black mb-4"
        >
          TEAMS RANKINGS
        </motion.h1>
        <motion.p 
          initial={{ y: 10, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 font-medium uppercase tracking-widest"
        >
          TOP 10 LEGENDS • SUPREME DOMINANCE
        </motion.p>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* --- CONTROL CENTER --- */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 p-6 rounded-3xl border border-red-600/30 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-2xl mb-12 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="flex bg-black/60 p-1.5 rounded-2xl border border-gray-800">
              {['WEEKLY', 'MONTHLY'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setTimeframe(t)} 
                  className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${timeframe === t ? 'bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              {['35', '45', '55'].map(l => (
                <button 
                  key={l} 
                  onClick={() => setActiveLobby(l)} 
                  className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all ${activeLobby === l ? 'border-red-600 text-red-500 bg-red-600/10 shadow-lg shadow-red-600/20' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
                >
                  🎮 LOBBY {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto">
            <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-gray-800">
              <button 
                onClick={() => setShowAllTeams(!showAllTeams)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                {showAllTeams ? <EyeOff size={16}/> : <Eye size={16}/>}
                {showAllTeams ? 'Top 10' : 'All Teams'}
              </button>
              <button 
                onClick={exportData}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg"
              >
                <Download size={16}/> Export
              </button>
            </div>

            {isAdmin && (
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowHistory(!showHistory)} 
                  className="px-6 py-3 bg-black/60 border border-gray-800 rounded-xl text-sm font-bold uppercase flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                >
                  <History size={16}/> Logs
                </button>
                
                <button 
                  onClick={() => openManualModal()} 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 border border-blue-500/30 text-white rounded-xl text-sm font-bold uppercase flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  <Plus size={16}/> Add
                </button>

                <label className={`px-8 py-3 bg-gradient-to-r from-yellow-600 to-red-600 text-black rounded-xl font-bold text-sm uppercase flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all shadow-lg shadow-red-600/20 relative overflow-hidden ${scanning ? 'opacity-80' : ''}`}>
                  {scanning ? <Loader className="animate-spin" size={16}/> : <Zap size={16} fill="currentColor"/>}
                  {scanning ? (scanStatus || "Scanning...") : "📸 AI Upload"}
                  <input type="file" className="hidden" onChange={handleAIScan} disabled={scanning} />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Teams', value: teams.length, color: 'text-red-500', icon: <Users className="text-red-500" size={20}/> },
            { label: 'Total Kills', value: stats.totalKills, color: 'text-yellow-500', icon: <Sword className="text-yellow-500" size={20}/> },
            { label: 'Avg Points', value: stats.avgPoints, color: 'text-blue-500', icon: <BarChart2 className="text-blue-500" size={20}/> },
            { label: 'Highest Score', value: stats.highestPoints, color: 'text-green-500', icon: <TrendingUp className="text-green-500" size={20}/> },
          ].map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-900/80 to-black/80 p-5 rounded-2xl border border-gray-800 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                {stat.icon}
                <span className="text-xs text-gray-500 uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* --- RANKINGS --- */}
        {loading ? (
          <div className="py-40 text-center flex flex-col items-center gap-6">
            <div className="relative">
              <Loader size={80} className="animate-spin text-red-600 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="font-medium tracking-widest text-gray-600 uppercase">Syncing Database...</p>
          </div>
        ) : (showAllTeams ? teams : top10Teams).length > 0 ? (
          <div className="space-y-12">
            {/* TOP 3 PODIUM */}
            {(showAllTeams ? teams : top10Teams).length >= 3 && (
              <div className="flex justify-center items-end gap-6 md:gap-12 px-4 relative">
                {/* 2nd Place */}
                {[1, 0, 2].map((posIndex, displayIndex) => {
                  const team = (showAllTeams ? teams : top10Teams)[posIndex];
                  if (!team) return null;
                  
                  const podiumStyles = [
                    { height: 'h-48 md:h-56', color: 'from-gray-700 to-gray-900', border: 'border-gray-400' },
                    { height: 'h-56 md:h-64', color: 'from-yellow-600 to-yellow-800', border: 'border-yellow-400' },
                    { height: 'h-44 md:h-52', color: 'from-orange-800 to-orange-900', border: 'border-orange-600' }
                  ];
                  
                  return (
                    <motion.div 
                      key={team.id}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: displayIndex * 0.1 }}
                      className={`flex flex-col items-center ${displayIndex === 1 ? 'scale-110 z-10' : 'scale-90'}`}
                    >
                      {displayIndex === 1 && (
                        <div className="relative mb-6">
                          <Crown size={48} className="text-yellow-400 animate-pulse drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                          <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30"></div>
                        </div>
                      )}
                      
                      <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full border-4 ${podiumStyles[displayIndex].border} bg-gradient-to-br ${podiumStyles[displayIndex].color} flex items-center justify-center mb-4 shadow-2xl`}>
                        <span className="text-4xl font-black text-white">#{posIndex + 1}</span>
                      </div>
                      
                      <div className={`bg-gradient-to-t ${podiumStyles[displayIndex].color} border-t-4 ${podiumStyles[displayIndex].border} w-32 md:w-48 ${podiumStyles[displayIndex].height} rounded-t-[3rem] p-6 text-center flex flex-col justify-end`}>
                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-tighter text-white mb-3 truncate">
                          {team.name}
                        </h4>
                        <p className="text-3xl md:text-5xl font-black text-white">{team.points}</p>
                        <span className="text-xs font-medium uppercase mt-3 opacity-50 tracking-widest">
                          ⚔️ {team.kills} KILLS
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* TEAMS TABLE */}
            <div className="max-w-5xl mx-auto">
              <div className="mb-8 text-center">
                <h3 className="text-3xl font-bold uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-yellow-500">
                  {showAllTeams ? 'ALL TEAMS' : 'TOP 10 LEGENDS'}
                </h3>
                <p className="text-gray-400 text-sm mt-2">
                  {showAllTeams ? `${teams.length} teams total` : `Rank 4-10 • Lobby ${activeLobby} • ${timeframe}`}
                </p>
              </div>
              
              <div className="space-y-4">
                {(showAllTeams ? teams.slice(3) : top10Teams.slice(3)).map((team, i) => {
                  const rank = i + 4;
                  const badge = getRankBadge(rank);
                  
                  return (
                    <motion.div 
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }} 
                      whileInView={{ opacity: 1, x: 0 }} 
                      viewport={{ once: true }}
                      className="bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 p-6 rounded-2xl hover:border-red-600/30 hover:bg-gray-900/30 transition-all group backdrop-blur-sm"
                    >
                      <div className="grid grid-cols-12 items-center gap-4">
                        {/* RANK */}
                        <div className="col-span-1">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.bg} ${badge.text} flex items-center justify-center font-black text-lg shadow-lg`}>
                            {badge.icon ? (
                              <div className="flex items-center gap-1">
                                {badge.icon}
                                <span>{rank}</span>
                              </div>
                            ) : (
                              rank
                            )}
                          </div>
                        </div>
                        
                        {/* TEAM NAME */}
                        <div className="col-span-5">
                          <div className="font-bold uppercase text-lg tracking-widest text-white group-hover:text-red-400 transition-all flex items-center gap-3">
                            <Users size={16} className="text-gray-600" />
                            {team.name}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Sword size={12} /> {team.kills} KILLS
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Target size={12} /> Lobby {team.lobby}
                            </span>
                          </div>
                        </div>
                        
                        {/* POINTS */}
                        <div className="col-span-3 text-center">
                          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">
                            {team.points}
                          </div>
                          <div className="text-xs uppercase text-gray-500 tracking-widest">POINTS</div>
                        </div>
                        
                        {/* PER KILL */}
                        <div className="col-span-2 text-center">
                          <div className="text-lg font-bold text-gray-300">
                            {Math.round((team.points / team.kills) * 10) / 10 || 0}
                          </div>
                          <div className="text-xs uppercase text-gray-500 tracking-widest">PTS/KILL</div>
                        </div>
                        
                        {/* ADMIN ACTIONS */}
                        {isAdmin && (
                          <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => openManualModal(team)} 
                              className="p-2 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                            >
                              <Edit3 size={16}/>
                            </button>
                            <button 
                              onClick={() => handleDeleteTeam(team.id)} 
                              className="p-2 bg-red-600/10 text-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-40 text-center">
            <div className="inline-block p-10 bg-gradient-to-br from-black to-gray-900 border border-red-600/20 rounded-3xl">
              <Trophy className="mx-auto mb-8 text-gray-700" size={80} />
              <p className="opacity-30 uppercase font-bold tracking-widest mb-3">NO BATTLE DATA</p>
              <p className="text-gray-600 mb-8">Upload screenshot or wait for matches</p>
              {isAdmin && (
                <button 
                  onClick={() => openManualModal()} 
                  className="px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 rounded-xl font-bold uppercase text-lg hover:shadow-lg hover:shadow-red-600/20 transition-all"
                >
                  + Add First Team
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODALS and other components remain same... */}
      {/* Add your existing modal code here */}
      
    </div>
  );
};

export default Leaderboard;