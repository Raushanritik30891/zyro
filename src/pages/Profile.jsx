import React, { useState, useEffect } from 'react';
// Icons Import
import { User, Shield, Lock, Save, Award, Clock, Phone, MessageCircle, HelpCircle, Coins, Gift, Zap, Crown, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase'; // DB import kiya
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [saving, setSaving] = useState(false);  // Saving state

  // Points & Stats
  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState({ tier: "IRON", tierColor: "text-gray-400", daysLeft: 0, rank: "Unranked" });
  
  // Team Data
  const [teamData, setTeamData] = useState({
    teamName: "",
    whatsapp: "",
    players: [
        { uid: "", role: "IGL" }, 
        { uid: "", role: "Rusher" }, 
        { uid: "", role: "Sniper" }, 
        { uid: "", role: "Support" }, 
        { uid: "", role: "Sub" }
    ]
  });
  
  const [isLocked, setIsLocked] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid); // Load Data from DB
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // --- 🔥 1. LOAD DATA FROM FIRESTORE ---
  const loadUserData = async (uid) => {
    try {
        // A. Fetch Team Data
        const teamRef = doc(db, "teams", uid);
        const teamSnap = await getDoc(teamRef);

        if (teamSnap.exists()) {
            const data = teamSnap.data();
            setTeamData(data.teamData);
            setIsLocked(data.isLocked || false);
            
            // Lock Timer Check
            if (data.isLocked && data.lockDate) {
                const lockTime = new Date(data.lockDate);
                const now = new Date();
                const diffDays = Math.ceil((now - lockTime) / (1000 * 60 * 60 * 24));
                if (diffDays > 15) { 
                    setIsLocked(false); // Auto unlock after 15 days
                    // Optional: Update DB to unlock
                }
            }
        } else {
            // First time user? Set default name
            setTeamData(prev => ({ ...prev, teamName: "My New Team" }));
        }

        // B. Fetch Points (User Data)
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            const uData = userSnap.data();
            setPoints(uData.points || 0);
            calculateStats(uData); // Calculate Rank based on DB data
        }

    } catch (error) {
        console.error("Error loading data:", error);
    }
  };

  // --- 📊 CALCULATE STATS ---
  const calculateStats = (uData) => {
    const buys = uData.purchaseCount || 0;
    let currentTier = "IRON";
    let color = "text-gray-400";
    
    if (buys > 10) { currentTier = "CONQUEROR"; color = "text-yellow-400"; }
    else if (buys > 5) { currentTier = "DIAMOND"; color = "text-cyan-400"; }
    else if (buys > 0) { currentTier = "GOLD"; color = "text-orange-400"; }

    setStats({
        tier: currentTier,
        tierColor: color,
        daysLeft: 7, // Mock for now, connect to real expiry later
        rank: buys > 0 ? `#${Math.floor(Math.random() * 500) + 1}` : "Unranked"
    });
  };

  // --- 💾 2. SAVE DATA TO FIRESTORE ---
  const handleSaveRoster = async (lock = false) => {
    if (!user) return;
    setSaving(true);
    
    try {
        const teamRef = doc(db, "teams", user.uid);
        
        const payload = {
            teamData: teamData,
            updatedAt: new Date().toISOString(),
            isLocked: lock,
            lockDate: lock ? new Date().toISOString() : null,
            captainName: user.displayName,
            captainEmail: user.email
        };

        await setDoc(teamRef, payload, { merge: true });
        
        if (lock) setIsLocked(true);
        setShowConfirm(false);
        alert(lock ? "Roster LOCKED Successfully! Good luck." : "Roster Saved Successfully!");
        
    } catch (error) {
        console.error("Error saving roster:", error);
        alert("Save Failed! Check internet connection.");
    }
    setSaving(false);
  };

  // --- 🎁 REDEEM LOGIC (DB UPDATE) ---
  const handleRedeem = async (cost, rewardName) => {
    if (points >= cost) {
      const confirmRedeem = window.confirm(`Burn ${cost} Points for ${rewardName}?`);
      if (confirmRedeem) {
        const newBalance = points - cost;
        setPoints(newBalance);
        
        // Update DB
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { points: newBalance }, { merge: true });

        alert(`SUCCESS! You claimed: ${rewardName}.\nDetails sent to WhatsApp.`);
      }
    } else {
      alert(`Insufficient Points! Need ${cost - points} more.`);
    }
  };

  // Input Handlers
  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...teamData.players];
    newPlayers[index][field] = value;
    setTeamData({ ...teamData, players: newPlayers });
  };

  const handleLogout = async () => { await signOut(auth); navigate('/login'); };

  if (loading) return <div className="min-h-screen bg-voidBlack flex items-center justify-center text-rosePink font-gaming animate-pulse">CONNECTING TO HQ...</div>;

  return (
    <div className="min-h-screen bg-voidBlack text-white font-body pb-20">
      <Navbar />

      <div className="pt-28 pb-10 px-4">
         
         {/* --- HERO PROFILE CARD --- */}
         <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Avatar */}
            <div className="glass-panel-dark rounded-3xl p-6 flex flex-col items-center justify-center border border-rosePink/20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-rosePink/5 blur-3xl pointer-events-none"></div>
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-r from-rosePink to-purple-900 mb-4 shadow-lg">
                    <img src={user?.photoURL} className="w-full h-full rounded-full border-4 border-black object-cover" alt="Profile"/>
                </div>
                <h2 className="text-xl font-gaming font-black uppercase">{user?.displayName}</h2>
                <div className={`text-xs font-bold mt-2 px-3 py-1 rounded border ${stats.tierColor.replace('text-', 'border-')} ${stats.tierColor}`}>
                    {stats.tier} MEMBER
                </div>
                <button onClick={handleLogout} className="mt-4 px-6 py-2 border border-white/10 hover:bg-white/5 rounded-full text-xs font-bold">LOGOUT</button>
            </div>

            {/* REWARDS VAULT */}
            <div className="md:col-span-2 glass-panel-dark rounded-3xl p-8 border-2 border-yellow-500/30 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-yellow-500/20 w-32 h-32 blur-[50px] pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-yellow-400 font-gaming font-black text-2xl flex items-center gap-2">
                            <Coins className="animate-bounce" /> ZYRO VAULT
                        </h3>
                        <p className="text-gray-400 text-sm">Use points to claim Free Passes.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-black text-white">{points}</div>
                        <div className="text-xs text-gray-500 uppercase font-bold">Balance</div>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => handleRedeem(100, "FREE MATCH")} disabled={points < 100} className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${points >= 100 ? 'bg-yellow-500 text-black border-yellow-400 hover:scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-gray-600 grayscale'}`}>
                        <Gift size={20} className="mb-1"/><span className="font-black text-xs">100 PTS</span>
                    </button>
                    <button onClick={() => handleRedeem(300, "WEEKLY PASS")} disabled={points < 300} className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${points >= 300 ? 'bg-orange-500 text-white border-orange-400 hover:scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-gray-600 grayscale'}`}>
                        <Zap size={20} className="mb-1"/><span className="font-black text-xs">300 PTS</span>
                    </button>
                    <button onClick={() => handleRedeem(500, "GOD MODE")} disabled={points < 500} className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${points >= 500 ? 'bg-rosePink text-white border-rosePink hover:scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-gray-600 grayscale'}`}>
                        <Crown size={20} className="mb-1"/><span className="font-black text-xs">500 PTS</span>
                    </button>
                </div>
            </div>
         </div>

         {/* --- TEAM FORM (SAVES TO DB) --- */}
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 glass-panel-dark p-6 rounded-2xl border-t-4 border-rosePink">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-gaming font-bold flex items-center gap-2"><Shield className="text-rosePink"/> SQUAD CONFIG</h2>
                    {isLocked && <span className="text-red-500 text-xs font-bold bg-red-500/10 px-2 py-1 rounded">LOCKED</span>}
                    {saving && <span className="text-rosePink text-xs font-bold animate-pulse flex items-center gap-1"><Loader size={12} className="animate-spin"/> SAVING...</span>}
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input disabled={isLocked} value={teamData.teamName} onChange={(e)=>setTeamData({...teamData, teamName: e.target.value})} type="text" className="bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-rosePink" placeholder="Team Name"/>
                        <div className="relative">
                            <input disabled={isLocked} value={teamData.whatsapp} onChange={(e)=>setTeamData({...teamData, whatsapp: e.target.value})} type="text" className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 pl-10" placeholder="WhatsApp No."/>
                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500"/>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {teamData.players.map((player, idx) => (
                            <div key={idx} className="flex gap-2">
                                <div className="w-20 bg-white/5 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    {idx === 0 ? "IGL" : idx === 4 ? "SUB" : `P${idx+1}`}
                                </div>
                                <input disabled={isLocked} type="text" placeholder="UID / IGN" value={player.uid} onChange={(e) => handlePlayerChange(idx, 'uid', e.target.value)} className="flex-1 bg-black/50 border border-white/10 rounded p-2 text-sm text-white focus:border-rosePink"/>
                                <select disabled={isLocked} value={player.role} onChange={(e) => handlePlayerChange(idx, 'role', e.target.value)} className="bg-black/50 border border-white/10 rounded px-2 text-xs text-rosePink font-bold outline-none">
                                    <option>Rusher</option><option>Sniper</option><option>IGL</option><option>Support</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        {!isLocked && !showConfirm ? (
                            <button onClick={() => handleSaveRoster(false)} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg mb-2 flex justify-center gap-2">
                                <Save size={18}/> SAVE DRAFT
                            </button>
                        ) : null}
                        
                        {!isLocked ? (
                            !showConfirm ? (
                                <button onClick={()=>setShowConfirm(true)} className="w-full py-3 bg-rosePink hover:bg-rosePink/80 text-white font-black rounded-lg shadow-lg flex justify-center gap-2">
                                    <Lock size={18}/> SAVE & LOCK ROSTER
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => handleSaveRoster(true)} className="flex-1 py-3 bg-red-600 font-bold rounded">CONFIRM LOCK</button>
                                    <button onClick={()=>setShowConfirm(false)} className="flex-1 py-3 bg-gray-700 font-bold rounded">CANCEL</button>
                                </div>
                            )
                        ) : (
                            <button disabled className="w-full py-3 bg-gray-800 text-gray-500 font-bold rounded cursor-not-allowed">LOCKED (15 DAYS)</button>
                        )}
                    </div>
                </div>
            </div>

            {/* Help Section */}
            <div className="glass-panel-dark p-6 rounded-2xl border border-white/10 h-fit">
                <h3 className="text-white font-bold flex items-center gap-2 mb-4"><HelpCircle size={18} className="text-blue-400"/> SUPPORT</h3>
                <button className="w-full py-3 bg-green-600/20 text-green-400 border border-green-500/50 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center gap-2 font-bold mb-3 transition-colors">
                    <MessageCircle size={18}/> WhatsApp Admin
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Profile;