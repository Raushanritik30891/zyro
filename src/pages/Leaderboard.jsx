import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Zap, Crown, Trash2, Loader, Calendar, 
  History, RotateCcw, AlertCircle, CheckCircle2, 
  Plus, Edit3, Save, X 
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
  const [activeLobby, setActiveLobby] = useState('15'); 
  const [timeframe, setTimeframe] = useState('WEEKLY'); 
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); 
  const [teams, setTeams] = useState([]);
  
  // --- ADMIN/AI STATES ---
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState(""); // 🟢 Progress Status Text
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);

  // --- MANUAL EDIT STATES ---
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null); // If null, means NEW entry
  const [manualForm, setManualForm] = useState({ name: "", kills: "", points: "" });

  // --- 🔐 AUTH SECURITY ---
  useEffect(() => {
    const checkAdmin = auth.onAuthStateChanged((user) => {
      const admins = ["ritikraushan@gmail.com", "admin@zyroesports.com"];
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
        orderBy("points", "desc")
      );
      const snap = await getDocs(q);
      setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Index Missing?", e); }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "match_history"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setHistoryData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  // --- 🤖 AI VISION INTEGRATION (Enhanced Progress) ---
  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setScanStatus("Analyzing Image..."); // 🟡 Step 1

    const matchId = `MATCH-${Date.now()}`;

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64 = reader.result.split(',')[1];
        
        setScanStatus("Extracting Data..."); // 🟡 Step 2
        const result = await model.generateContent([
          `Extract FF leaderboard. JSON Array: [{"name":string,"kills":number,"points":number}].`,
          { inlineData: { data: base64, mimeType: file.type } }
        ]);

        const extracted = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
        
        setScanStatus(`Uploading ${extracted.length} Teams...`); // 🟡 Step 3
        const batch = writeBatch(db);

        extracted.forEach(t => {
          const docRef = doc(collection(db, "leaderboard"));
          batch.set(docRef, { 
            ...t, 
            lobby: activeLobby, 
            type: timeframe, 
            matchId: matchId, 
            updatedAt: serverTimestamp() 
          });
        });

        const historyRef = doc(db, "match_history", matchId);
        batch.set(historyRef, {
          matchId,
          lobby: activeLobby,
          type: timeframe,
          teamCount: extracted.length,
          timestamp: serverTimestamp()
        });

        await batch.commit();
        setScanStatus("Done!"); 
        alert("POINTS UPDATED SUCCESSFULLY!");
        fetchLeaderboard();
        fetchHistory();
      };
    } catch (err) { alert("AI Interference! Try Manual Add."); }
    setScanning(false);
    setScanStatus("");
  };

  // --- 📝 MANUAL ADD / EDIT LOGIC ---
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
    if (!manualForm.name || !manualForm.points) return alert("Fill Details");

    try {
      if (editingTeam) {
        // Update Existing
        await updateDoc(doc(db, "leaderboard", editingTeam.id), {
          name: manualForm.name,
          kills: Number(manualForm.kills),
          points: Number(manualForm.points)
        });
      } else {
        // Create New
        await addDoc(collection(db, "leaderboard"), {
          ...manualForm,
          kills: Number(manualForm.kills),
          points: Number(manualForm.points),
          lobby: activeLobby,
          type: timeframe,
          matchId: `MANUAL-${Date.now()}`,
          updatedAt: serverTimestamp()
        });
      }
      setShowManualModal(false);
      fetchLeaderboard();
    } catch (e) { alert("Save Error"); }
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm("Delete this team entry?")) {
      await deleteDoc(doc(db, "leaderboard", id));
      fetchLeaderboard();
    }
  };

  // --- 🔄 REVERT LOGIC ---
  const handleRevertMatch = async (matchId) => {
    if (!window.confirm("CAUTION: This will erase all points from this match. Proceed?")) return;
    setLoading(true);
    try {
      const q = query(collection(db, "leaderboard"), where("matchId", "==", matchId));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref)); 
      batch.delete(doc(db, "match_history", matchId));
      await batch.commit();
      alert("MATCH REVERTED. TIMELINE RESTORED.");
      fetchLeaderboard();
      fetchHistory();
    } catch (e) { alert("Revert Failed!"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />

      <div className="pt-32 pb-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-rosePink/5 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="text-6xl md:text-9xl font-gaming font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-rosePink via-white to-purple-600"
        >
          RANKINGS
        </motion.h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        
        {/* --- CONTROL CENTER --- */}
        <div className="glass-panel-dark p-4 rounded-[2.5rem] border border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6 shadow-2xl mb-12">
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 w-full lg:w-auto">
            {['WEEKLY', 'MONTHLY'].map(t => (
              <button key={t} onClick={() => setTimeframe(t)} className={`flex-1 lg:flex-none px-10 py-3 rounded-xl font-black text-xs transition-all ${timeframe === t ? 'bg-rosePink text-white shadow-lg shadow-rosePink/20' : 'text-gray-500 hover:text-white'}`}>{t}</button>
            ))}
          </div>

          <div className="flex gap-2">
            {['15', '25', '35'].map(l => (
              <button key={l} onClick={() => setActiveLobby(l)} className={`px-6 py-3 rounded-xl font-gaming text-xs border transition-all ${activeLobby === l ? 'border-rosePink text-rosePink bg-rosePink/10' : 'border-white/5 text-gray-500 hover:border-white/20'}`}>LOBBY {l}</button>
            ))}
          </div>

          {isAdmin && (
            <div className="flex gap-3 w-full lg:w-auto">
              <button onClick={() => setShowHistory(!showHistory)} className="flex-1 lg:flex-none px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <History size={16}/> Logs
              </button>
              
              {/* Manual Add Button */}
              <button onClick={() => openManualModal()} className="flex-1 lg:flex-none px-6 py-3 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
                <Plus size={16}/> Add
              </button>

              {/* AI Upload Button */}
              <label className="flex-1 lg:flex-none px-8 py-3 bg-yellow-500 text-black rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all shadow-lg shadow-yellow-500/20 relative overflow-hidden">
                {scanning ? <Loader className="animate-spin" size={16}/> : <Zap size={16} fill="currentColor"/>}
                {scanning ? (scanStatus || "Scanning...") : "AI Upload"}
                <input type="file" className="hidden" onChange={handleAIScan} disabled={scanning} />
              </label>
            </div>
          )}
        </div>

        {/* --- REVERT LOGS OVERLAY --- */}
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-12 overflow-hidden">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                    <h3 className="text-xl font-gaming font-black mb-6 uppercase italic text-yellow-500 flex items-center gap-3"><AlertCircle/> Match Submission Logs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {historyData.map(log => (
                            <div key={log.id} className="bg-black/60 p-5 rounded-2xl border border-white/5 flex justify-between items-center group">
                                <div>
                                    <p className="text-[10px] font-black text-rosePink uppercase">Lobby {log.lobby} • {log.type}</p>
                                    <p className="text-xs font-bold text-gray-300 mt-1">{log.teamCount} Teams Processed</p>
                                    <p className="text-[9px] text-gray-600 uppercase mt-1">{new Date(log.timestamp?.toDate()).toLocaleString()}</p>
                                </div>
                                <button onClick={() => handleRevertMatch(log.matchId)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                    <RotateCcw size={18}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MANUAL ENTRY MODAL --- */}
        <AnimatePresence>
          {showManualModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-gaming font-black italic uppercase text-white">{editingTeam ? "Edit Score" : "Manual Entry"}</h3>
                        <button onClick={() => setShowManualModal(false)} className="bg-white/5 p-2 rounded-full hover:bg-white/20"><X size={16}/></button>
                    </div>
                    <div className="space-y-4">
                        <input type="text" placeholder="TEAM NAME" value={manualForm.name} onChange={e=>setManualForm({...manualForm, name: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm font-bold text-white outline-none focus:border-rosePink"/>
                        <div className="flex gap-4">
                            <input type="number" placeholder="KILLS" value={manualForm.kills} onChange={e=>setManualForm({...manualForm, kills: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm font-bold text-white outline-none focus:border-rosePink"/>
                            <input type="number" placeholder="TOTAL POINTS" value={manualForm.points} onChange={e=>setManualForm({...manualForm, points: e.target.value})} className="w-full bg-black/50 border border-white/10 p-3 rounded-xl text-sm font-bold text-white outline-none focus:border-rosePink"/>
                        </div>
                        <button onClick={handleManualSave} className="w-full py-3 bg-rosePink text-white font-black uppercase rounded-xl hover:bg-rosePink/80 transition-all flex items-center justify-center gap-2">
                            <Save size={16}/> {editingTeam ? "Update Data" : "Add to Board"}
                        </button>
                    </div>
                </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- RANKINGS --- */}
        {loading ? (
          <div className="py-40 text-center flex flex-col items-center gap-4">
            <Loader size={64} className="animate-spin text-rosePink opacity-20" />
            <p className="font-gaming tracking-[0.3em] text-gray-600 uppercase">Syncing Database...</p>
          </div>
        ) : teams.length > 0 ? (
          <div className="space-y-20">
            {/* Podium */}
            <div className="flex justify-center items-end gap-2 md:gap-12 px-4">
               {teams[1] && <PodiumItem team={teams[1]} rank={2} color="text-slate-400" aura="rgba(148,163,184,0.1)" />}
               {teams[0] && <PodiumItem team={teams[0]} rank={1} color="text-yellow-400" isWinner aura="rgba(234,179,8,0.2)" />}
               {teams[2] && <PodiumItem team={teams[2]} rank={3} color="text-orange-700" aura="rgba(194,65,12,0.1)" />}
            </div>

            {/* Table */}
            <div className="max-w-5xl mx-auto space-y-4">
              {teams.slice(3).map((team, i) => (
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} key={team.id} className="grid grid-cols-12 items-center bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-rosePink/30 transition-all group">
                   <div className="col-span-1 font-gaming text-gray-500 italic">#{i + 4}</div>
                   <div className="col-span-6 font-black uppercase text-sm tracking-widest">{team.name}</div>
                   <div className="col-span-2 text-center font-bold text-gray-500">{team.kills} <span className="text-[9px]">KILLS</span></div>
                   <div className="col-span-2 text-right font-gaming text-2xl text-rosePink">{team.points}</div>
                   
                   {/* ADMIN ACTIONS */}
                   {isAdmin && (
                       <div className="col-span-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => openManualModal(team)} className="text-blue-400 hover:text-white"><Edit3 size={16}/></button>
                           <button onClick={() => handleDeleteTeam(team.id)} className="text-red-500 hover:text-white"><Trash2 size={16}/></button>
                       </div>
                   )}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-40 text-center opacity-30 uppercase font-black tracking-[0.5em]">No Battle Data Found</div>
        )}
      </div>
    </div>
  );
};

const PodiumItem = ({ team, rank, color, isWinner, aura }) => (
  <div className={`flex flex-col items-center ${isWinner ? 'scale-110 z-10' : 'scale-90'}`}>
    {isWinner && <Crown size={56} className="text-yellow-400 mb-3 animate-bounce drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />}
    <div className={`w-24 h-24 md:w-36 md:h-36 rounded-full border-4 border-current bg-black flex items-center justify-center mb-4 ${color} relative`} style={{ boxShadow: `0 0 40px ${aura}` }}>
        <span className="text-5xl font-black">{rank}</span>
    </div>
    <div className={`bg-gradient-to-t from-black to-white/5 border-t-2 border-current w-32 md:w-56 h-40 md:h-60 rounded-t-[3rem] p-6 text-center flex flex-col justify-end ${color}`}>
        <h4 className="text-[10px] md:text-xs font-black uppercase tracking-tighter text-white mb-2 truncate">{team.name}</h4>
        <p className="text-3xl md:text-5xl font-gaming">{team.points}</p>
        <span className="text-[9px] font-black uppercase mt-2 opacity-50 tracking-widest">{team.kills} KILLS</span>
    </div>
  </div>
);

export default Leaderboard;