import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Swords, Trophy, Users, Zap, Trash2, 
  CheckCircle, Eye, Plus, Edit3, Save, 
  Upload, RefreshCw, Ban, X, Map, Skull, Settings, Layers, Bell, CreditCard, MessageSquare
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { 
  collection, getDocs, addDoc, deleteDoc, doc, 
  updateDoc, query, orderBy, where, serverTimestamp, getDoc, writeBatch 
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

// 🔐 SECURITY: ADMIN LIST
const ADMIN_EMAILS = [
  "raushanritik30891@gmail.com", 
  "zyro.esports.7@gmail.com", 
  "admin@zyro.com"
];

const Admin = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('matches'); // matches, create, subs, leader
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [matches, setMatches] = useState([]);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [leaderboardTeams, setLeaderboardTeams] = useState([]);

  // ✅ ERROR FIX: Define isEditing State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Match Form State (Detailed)
  const [matchForm, setMatchForm] = useState({
    title: '', category: 'BR', map: 'Bermuda', matchCount: 1, time: '', fee: '', type: 'Squad',
    headshotOnly: false, totalSlots: 48, filledSlots: 0,
    prizePool: '', rank1: '', rank2: '', rank3: '', perKill: '', status: 'OPEN',
    rules: '1. No Emulator allowed\n2. Screenshot mandatory\n3. ID/Pass 10 mins before start.' 
  });

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);

  // AI & Manual States
  const [scanning, setScanning] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: "", kills: "", points: "" });
  const [lbFilter, setLbFilter] = useState({ lobby: "15", type: "WEEKLY" });

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const checkAdmin = auth.onAuthStateChanged((user) => {
      if (user && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
        fetchAdminData();
      } else {
        addNotification('error', "Access Denied");
        navigate('/'); 
      }
    });
    return () => checkAdmin();
  }, []);

  useEffect(() => {
    if (activeTab === 'leader') fetchLeaderboard();
  }, [activeTab, lbFilter]);

  // --- DATA FETCHING ---
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const matchSnap = await getDocs(query(collection(db, "matches"), orderBy("timestamp", "desc")));
      setMatches(matchSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const subSnap = await getDocs(query(collection(db, "subscriptions"), where("status", "==", "Pending")));
      setPendingSubs(subSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const histSnap = await getDocs(query(collection(db, "match_history"), orderBy("timestamp", "desc")));
      setMatchHistory(histSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const fetchLeaderboard = async () => {
    const q = query(
        collection(db, "leaderboard"), 
        where("lobby", "==", lbFilter.lobby),
        where("type", "==", lbFilter.type),
        orderBy("points", "desc")
    );
    const snap = await getDocs(q);
    setLeaderboardTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // --- 2. MATCH OPERATIONS ---
  
  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    if (!matchForm.title || !matchForm.time) return addNotification('error', "Title & Time Required!");

    setLoading(true);
    try {
      if (isEditing && editId) {
        // UPDATE EXISTING
        await updateDoc(doc(db, "matches", editId), {
          ...matchForm,
          filledSlots: Number(matchForm.filledSlots),
          totalSlots: Number(matchForm.totalSlots)
        });
        addNotification('success', "Match Updated");
        setIsEditing(false); setEditId(null);
      } else {
        // CREATE NEW
        await addDoc(collection(db, "matches"), { 
          ...matchForm, 
          timestamp: serverTimestamp(),
          filledSlots: Number(matchForm.filledSlots),
          totalSlots: Number(matchForm.totalSlots),
          slotList: []
        });
        addNotification('success', "Match Created");
      }
      
      // Reset Form
      setMatchForm({
        title: '', category: 'BR', map: 'Bermuda', matchCount: 1, time: '', fee: '', type: 'Squad',
        headshotOnly: false, totalSlots: 48, filledSlots: 0,
        prizePool: '', rank1: '', rank2: '', rank3: '', perKill: '', status: 'OPEN',
        rules: '1. No Emulator allowed\n2. Screenshot mandatory\n3. ID/Pass 10 mins before start.' 
      });
      fetchAdminData();
      setActiveTab('matches');
    } catch (e) { addNotification('error', "Failed"); }
    setLoading(false);
  };

  const handleEditClick = (match) => {
    setMatchForm(match);
    setIsEditing(true);
    setEditId(match.id);
    setActiveTab('create'); 
    window.scrollTo(0,0);
    addNotification('info', `Editing: ${match.title}`);
  };

  const handleUpdateSlots = async (matchId, newCount) => {
    setMatches(prev => prev.map(m => m.id === matchId ? {...m, filledSlots: newCount} : m));
    try { await updateDoc(doc(db, "matches", matchId), { filledSlots: Number(newCount) }); } catch (e) {}
  };

  // --- DELETE & CANCEL MATCH LOGIC ---
  const handleCancelMatch = async () => {
    if (!matchToDelete) return;
    if (!window.confirm(`CANCEL "${matchToDelete.title}"? Will enable refunds.`)) return;

    try {
        const q = query(collection(db, "bookings"), where("tournamentId", "==", matchToDelete.id), where("status", "==", "approved"));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);

        snapshot.forEach((docSnap) => {
            batch.update(doc(db, "bookings", docSnap.id), { 
                status: 'refund_pending', 
                prizeAmount: matchToDelete.fee || 0,
                adminMessage: "Match Cancelled. Upload QR for refund."
            });
        });

        batch.update(doc(db, "matches", matchToDelete.id), { status: 'Cancelled', slotList: [] });
        await batch.commit();
        
        addNotification('success', `Cancelled. Refunds enabled for ${snapshot.size} players.`);
        setShowDeleteModal(false); setMatchToDelete(null); fetchAdminData();
    } catch (error) { addNotification('error', "Cancel Failed"); }
  };

  const processForceDelete = async () => {
    if (!matchToDelete) return;
    if (!window.confirm("⚠️ PERMANENT DELETE?")) return;
    try {
        await deleteDoc(doc(db, "matches", matchToDelete.id));
        addNotification('success', "Match Deleted.");
        setShowDeleteModal(false); setMatchToDelete(null); fetchAdminData();
    } catch (error) { addNotification('error', "Delete Failed"); }
  };

  // --- 3. SUBSCRIPTION OPERATIONS ---
  const handleApproveSub = async (sub) => {
    if(!window.confirm("Approve User?")) return;
    try {
      const userRef = doc(db, "users", sub.userId);
      const userSnap = await getDoc(userRef);
      const points = userSnap.exists() ? (userSnap.data().points || 0) : 0;
      await updateDoc(userRef, { isPremium: true, points: points + Number(sub.pointsAwarded), planType: sub.plan, subscriptionExpiry: sub.expiry });
      await updateDoc(doc(db, "subscriptions", sub.id), { status: "Approved" });
      addNotification('success', "User Approved");
      fetchAdminData();
    } catch (e) { addNotification('error', "Error"); }
  };

  const handleRejectSub = async (sub) => {
    const reason = prompt("Reason:", "Invalid Payment");
    if (!reason) return;
    await updateDoc(doc(db, "subscriptions", sub.id), { status: "Rejected", rejectionReason: reason });
    fetchAdminData();
  };

  // --- 4. 🔥 GOOGLE CLOUD VISION API (OCR) ---
  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // ⚠️ PASTE YOUR API KEY HERE
    const API_KEY = "YOUR_GOOGLE_CLOUD_VISION_API_KEY_HERE"; 
    
    if (API_KEY.includes("YOUR_GOOGLE")) return addNotification('error', "Set API Key in Code!");

    setScanning(true);
    addNotification('info', "Scanning with Cloud Vision...");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        // 
        const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requests: [{
                        image: { content: base64Data },
                        features: [{ type: "TEXT_DETECTION" }]
                    }]
                })
            });

            const data = await response.json();
            const text = data.responses[0].fullTextAnnotation?.text;

            if (!text) throw new Error("No text found in image.");

            // Basic Parsing Logic
            const lines = text.split('\n');
            const extractedData = [];
            const positionPoints = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0]; 

            lines.forEach((line) => {
                const parts = line.trim().split(/\s+/);
                const lastPart = parts[parts.length - 1];
                if (!isNaN(lastPart)) {
                    const kills = parseInt(lastPart);
                    const name = parts.slice(0, parts.length - 1).join(' ');
                    if (name.length > 2) {
                        const rankIdx = extractedData.length;
                        const pts = (positionPoints[rankIdx] || 0) + kills;
                        extractedData.push({ name, kills, points: pts });
                    }
                }
            });

            if (extractedData.length === 0) throw new Error("Could not parse leaderboard format.");

            const matchId = `MATCH-${Date.now()}`;
            const batch = writeBatch(db);
            extractedData.forEach(team => {
                batch.set(doc(collection(db, "leaderboard")), { 
                    ...team, matchId, lobby: lbFilter.lobby, type: lbFilter.type, updatedAt: serverTimestamp() 
                });
            });
            batch.set(doc(db, "match_history", matchId), {
                matchId, lobby: lbFilter.lobby, type: lbFilter.type, teamCount: extractedData.length, timestamp: serverTimestamp()
            });

            await batch.commit();
            addNotification('success', `Parsed ${extractedData.length} teams.`);
            fetchLeaderboard();

        } catch (err) {
            console.error("Vision Error:", err);
            addNotification('error', "Scan Failed. Try Manual Entry.");
        }
        setScanning(false);
    };
  };

  const handleManualAdd = async () => {
    if(!manualForm.name) return;
    await addDoc(collection(db, "leaderboard"), { ...manualForm, kills: Number(manualForm.kills), points: Number(manualForm.points), lobby: lbFilter.lobby, type: lbFilter.type, matchId: `MANUAL-${Date.now()}` });
    setManualModal(false); setManualForm({ name: "", kills: "", points: "" }); fetchLeaderboard();
  };

  const handleDeleteTeam = async (id) => {
      if(window.confirm("Delete entry?")) { await deleteDoc(doc(db, "leaderboard", id)); fetchLeaderboard(); }
  };

  const handleRevertMatch = async (matchId) => {
    if(!window.confirm("Revert points?")) return;
    const q = query(collection(db, "leaderboard"), where("matchId", "==", matchId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, "match_history", matchId));
    await batch.commit();
    addNotification('success', "Reverted.");
    fetchAdminData(); fetchLeaderboard();
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20">
      <Navbar />

      <div className="pt-24 px-4 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel-dark p-6 rounded-[2rem] border border-rosePink/20 sticky top-28">
            <h2 className="font-gaming font-black italic text-lg uppercase mb-6 flex items-center gap-2"><ShieldCheck className="text-rosePink"/> COMMAND</h2>
            <nav className="space-y-2">
              {[{ id: 'matches', label: 'DASHBOARD', icon: <Layers size={18}/> }, { id: 'create', label: 'CREATE MATCH', icon: <Plus size={18}/> }, { id: 'subs', label: 'APPROVALS', icon: <Zap size={18}/> }, { id: 'leader', label: 'LEADERBOARD', icon: <Trophy size={18}/> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-rosePink text-white' : 'text-gray-500 hover:bg-white/5'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
            <button onClick={() => navigate('/')} className="w-full mt-8 flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[10px] uppercase text-gray-500 hover:text-white bg-white/5"><Eye size={18}/> VIEW SITE</button>
          </div>
        </div>

        {/* MAIN */}
        <div className="lg:col-span-10">
          <AnimatePresence mode="wait">
            
            {/* 1. MANAGE MATCHES */}
            {activeTab === 'matches' && (
              <motion.div key="matches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel-dark p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
                        <div className="bg-blue-500/10 p-4 rounded-full text-blue-500"><Swords size={32}/></div>
                        <div><p className="text-gray-500 text-[10px] font-bold uppercase">Matches</p><h2 className="text-3xl font-gaming font-black">{matches.filter(m => m.status === 'OPEN').length}</h2></div>
                    </div>
                    <div className="glass-panel-dark p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
                        <div className="bg-yellow-500/10 p-4 rounded-full text-yellow-500"><Bell size={32}/></div>
                        <div><p className="text-gray-500 text-[10px] font-bold uppercase">Pending</p><h2 className="text-3xl font-gaming font-black">{pendingSubs.length}</h2></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {matches.map(m => (
                    <div key={m.id} className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 flex flex-col xl:flex-row gap-6 items-center hover:border-white/10 transition-all">
                      <div className="flex-1 w-full">
                        <div className="flex gap-2 mb-2"><span className="text-[9px] font-black px-2 py-0.5 rounded bg-green-500/10 text-green-500">{m.status}</span><span className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded uppercase">{m.category} • {m.type}</span></div>
                        <h4 className="text-xl font-gaming font-black text-white">{m.title}</h4>
                        <div className="flex gap-4 text-[10px] text-gray-500 font-bold uppercase mt-2"><span className="flex items-center gap-1"><Map size={12}/> {m.map}</span><span className="text-rosePink flex items-center gap-1"><Users size={12}/> {m.filledSlots}/{m.totalSlots}</span></div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => handleEditClick(m)} className="p-3 bg-[#121212] rounded-xl hover:bg-blue-500/10 hover:text-blue-400 border border-white/5"><Edit3 size={18}/></button>
                         <button onClick={() => { setMatchToDelete(m); setShowDeleteModal(true); }} className="p-3 bg-[#121212] rounded-xl hover:bg-red-500/10 hover:text-red-500 border border-white/5"><Trash2 size={18}/></button>
                      </div>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 w-full xl:w-64">
                        <div className="flex justify-between text-[8px] font-black uppercase text-gray-400 mb-2"><span>Occupancy</span><span className="text-rosePink">{m.filledSlots} / {m.totalSlots}</span></div>
                        <input type="range" min="0" max={m.totalSlots} value={m.filledSlots} onChange={(e) => handleUpdateSlots(m.id, e.target.value)} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-rosePink"/>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. CREATE / EDIT MATCH */}
            {activeTab === 'create' && (
                <div className="max-w-4xl mx-auto bg-[#080808] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rosePink to-transparent"></div>
                    <h2 className="text-2xl font-gaming font-black text-white mb-8 flex items-center gap-3 border-b border-white/10 pb-4">
                        {isEditing ? <Edit3 className="text-yellow-500"/> : <Plus className="text-rosePink"/>}
                        {isEditing ? "EDIT TOURNAMENT" : "DEPLOY NEW TOURNAMENT"}
                    </h2>
                    <form onSubmit={handleMatchSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Category</label>
                                <select className="admin-input" value={matchForm.category} onChange={(e) => { const newCat = e.target.value; setMatchForm({ ...matchForm, category: newCat, type: newCat === 'CS' ? '4v4' : 'Squad', totalSlots: newCat === 'CS' ? 2 : 48 }); }}>
                                    <option value="BR">Battle Royale</option><option value="CS">Clash Squad</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Format</label>
                                <select className="admin-input" value={matchForm.type} onChange={e => setMatchForm({...matchForm, type: e.target.value})}>
                                    {matchForm.category === 'CS' ? <><option value="1v1">1v1</option><option value="2v2">2v2</option><option value="4v4">4v4</option></> : <><option value="Solo">Solo</option><option value="Duo">Duo</option><option value="Squad">Squad</option></>}
                                </select>
                            </div>
                        </div>
                        {matchForm.category === 'CS' && (
                            <div onClick={() => setMatchForm({...matchForm, headshotOnly: !matchForm.headshotOnly})} className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition ${matchForm.headshotOnly ? 'bg-red-900/20 border-red-500' : 'bg-black border-white/20'}`}>
                                <span className="font-bold text-white text-xs flex items-center gap-2"><Skull size={16} className={matchForm.headshotOnly ? 'text-red-500' : 'text-gray-500'}/> HEADSHOT ONLY MODE</span>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${matchForm.headshotOnly ? 'bg-red-500' : 'bg-gray-700'}`}><div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${matchForm.headshotOnly ? 'left-4.5' : 'left-0.5'}`}></div></div>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-6">
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Title</label><input type="text" className="admin-input" placeholder="e.g. Weekly Scrims #5" value={matchForm.title} onChange={e=>setMatchForm({...matchForm, title: e.target.value})}/></div>
                            <div><label className="text-[10px] text-gray-500 font-bold uppercase ml-1 mb-1 block">Time</label><input type="datetime-local" className="admin-input" value={matchForm.time} onChange={e=>setMatchForm({...matchForm, time: e.target.value})}/></div>
                        </div>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-4">
                            <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-rosePink uppercase tracking-widest">Economy & Slots</span></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="text-[9px] text-gray-500 block mb-1">SLOTS</label><input type="number" className="admin-input" value={matchForm.totalSlots} onChange={e => setMatchForm({...matchForm, totalSlots: Number(e.target.value)})}/></div>
                                <div><label className="text-[9px] text-gray-500 block mb-1">ENTRY ₹</label><input type="number" className="admin-input" value={matchForm.fee} onChange={e => setMatchForm({...matchForm, fee: e.target.value})}/></div>
                                <div><label className="text-[9px] text-gray-500 block mb-1">POOL ₹</label><input type="number" className="admin-input" value={matchForm.prizePool} onChange={e => setMatchForm({...matchForm, prizePool: e.target.value})}/></div>
                            </div>
                            <input type="number" placeholder="Per Kill Prize ₹" className="admin-input text-[10px] mt-2" value={matchForm.perKill} onChange={e=>setMatchForm({...matchForm, perKill: e.target.value})}/>
                        </div>
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <label className="text-[10px] font-bold text-gray-400 mb-2 block flex items-center gap-2"><Settings size={12}/> RULES</label>
                            <textarea className="w-full h-24 bg-black border border-white/20 rounded-xl p-3 text-white text-xs font-mono focus:border-rosePink outline-none" value={matchForm.rules} onChange={e => setMatchForm({...matchForm, rules: e.target.value})}></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-gradient-to-r from-rosePink to-purple-600 rounded-xl font-black uppercase tracking-widest hover:scale-[1.01] transition-all shadow-lg flex items-center justify-center gap-2">
                                {loading ? <RefreshCw className="animate-spin"/> : <Save size={18}/>} {isEditing ? "UPDATE MATCH" : "LAUNCH"}
                            </button>
                            {isEditing && <button type="button" onClick={()=>{setIsEditing(false); setActiveTab('matches');}} className="px-8 bg-white/10 rounded-xl font-black uppercase text-xs hover:bg-white/20">CANCEL</button>}
                        </div>
                    </form>
                </div>
            )}

            {/* 3. SUBSCRIPTIONS */}
            {activeTab === 'subs' && (
                <div className="glass-panel-dark p-8 rounded-[2.5rem] border border-white/10 min-h-[500px]">
                    <h3 className="text-2xl font-gaming font-black mb-8 uppercase italic flex gap-2"><Zap className="text-yellow-500"/> Pending ({pendingSubs.length})</h3>
                    <div className="grid gap-4">
                        {pendingSubs.map(sub => (
                            <div key={sub.id} className="bg-black/60 p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-6">
                                <img src={sub.screenshot} className="w-20 h-28 object-cover rounded-xl border border-white/10 cursor-pointer" onClick={()=>window.open(sub.screenshot)}/>
                                <div className="flex-1 text-sm">
                                    <p className="font-bold text-white">{sub.fullName}</p>
                                    <p className="text-yellow-500 font-bold">{sub.plan} • {sub.amount}</p>
                                    <p className="text-gray-500">{sub.whatsappNo}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={()=>handleApproveSub(sub)} className="px-6 py-3 bg-green-500 text-black rounded-xl font-black text-xs">APPROVE</button>
                                    <button onClick={()=>handleRejectSub(sub)} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-xs">REJECT</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. LEADERBOARD & CLOUD VISION */}
            {activeTab === 'leader' && (
              <div className="space-y-8">
                <div className="glass-panel-dark p-8 rounded-[2.5rem] border border-white/10">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <select className="admin-input w-32" value={lbFilter.lobby} onChange={e=>setLbFilter({...lbFilter, lobby: e.target.value})}><option value="15">Lobby 15</option><option value="25">Lobby 25</option></select>
                        <select className="admin-input w-32" value={lbFilter.type} onChange={e=>setLbFilter({...lbFilter, type: e.target.value})}><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option></select>
                        <button onClick={()=>setManualModal(true)} className="px-6 bg-white/10 rounded-xl font-black text-xs flex items-center gap-2"><Plus size={16}/> MANUAL</button>
                    </div>
                    <label className={`block w-full h-40 border-2 border-dashed ${scanning ? 'border-rosePink bg-rosePink/5' : 'border-white/10 hover:border-white/30'} rounded-[2rem] flex flex-col items-center justify-center cursor-pointer`}>
                        {scanning ? <RefreshCw className="animate-spin text-rosePink"/> : <Upload className="text-gray-500"/>}
                        <span className="mt-4 font-black uppercase text-xs text-gray-400">{scanning ? "CLOUD VISION API PROCESSING..." : "DROP SCREENSHOT HERE"}</span>
                        <input type="file" className="hidden" onChange={handleAIScan} disabled={scanning}/>
                    </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-2">
                        {leaderboardTeams.map((t, i) => (
                            <div key={t.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center group">
                                <div className="flex gap-4"><span className="text-gray-500 font-gaming">#{i+1}</span><span className="font-bold text-white">{t.name}</span></div>
                                <div className="flex gap-4"><span className="text-rosePink font-bold">{t.points} PTS</span><button onClick={()=>handleDeleteTeam(t.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={14}/></button></div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-gaming text-white uppercase italic">History</h4>
                        {matchHistory.map(log => (
                            <div key={log.id} className="bg-black/60 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                <div><p className="text-xs text-gray-400">{log.teamCount} Teams</p><p className="text-[10px] text-gray-600">{new Date(log.timestamp?.toDate()).toLocaleDateString()}</p></div>
                                <button onClick={()=>handleRevertMatch(log.matchId)} className="text-red-500 hover:text-white text-xs font-bold">REVERT</button>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* DELETE MODAL */}
      <AnimatePresence>
      {showDeleteModal && matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
            <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-[#1a1a1a] border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h3 className="font-bold text-white mb-2 text-xl flex items-center gap-2"><Trash2 className="text-red-500"/> MANAGE MATCH</h3>
                <p className="text-gray-400 text-sm mb-6">Action for: <span className="text-white font-bold">{matchToDelete.title}</span></p>
                <div className="flex flex-col gap-3">
                    <button onClick={handleCancelMatch} className="bg-orange-500 text-black py-3 rounded-lg font-bold hover:bg-orange-400 flex items-center justify-center gap-2">🚫 CANCEL & REFUND</button>
                    <button onClick={processForceDelete} className="bg-red-600/20 text-red-500 border border-red-500/50 py-3 rounded-lg font-bold hover:bg-red-600 hover:text-white">🗑️ FORCE DELETE (NO REFUND)</button>
                    <button onClick={() => {setShowDeleteModal(false); setMatchToDelete(null);}} className="text-gray-500 text-sm mt-2 hover:text-white">Close</button>
                </div>
            </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* MANUAL MODAL */}
      {manualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
            <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl w-full max-w-md">
                <div className="flex justify-between mb-6"><h3 className="font-gaming font-black text-white">MANUAL ENTRY</h3><button onClick={()=>setManualModal(false)}><X/></button></div>
                <div className="space-y-4">
                    <input type="text" placeholder="TEAM NAME" className="admin-input" value={manualForm.name} onChange={e=>setManualForm({...manualForm, name: e.target.value})}/>
                    <input type="number" placeholder="KILLS" className="admin-input" value={manualForm.kills} onChange={e=>setManualForm({...manualForm, kills: e.target.value})}/>
                    <input type="number" placeholder="POINTS" className="admin-input" value={manualForm.points} onChange={e=>setManualForm({...manualForm, points: e.target.value})}/>
                    <button onClick={handleManualAdd} className="w-full py-3 bg-rosePink text-white font-black rounded-xl">ADD</button>
                </div>
            </div>
        </div>
      )}

      <style>{`
        .admin-input { width: 100%; background: #0a0a0a; border: 1px solid #333; padding: 1rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 700; color: white; outline: none; text-transform: uppercase; }
        .admin-input:focus { border-color: #f43f5e; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default Admin;