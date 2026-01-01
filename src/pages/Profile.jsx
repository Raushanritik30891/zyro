import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Trophy, Star, Zap, Edit3, Camera, Lock, 
  Award, Crown, Save, X, Loader, Sparkles, Hash, 
  Users, Gift, Target, CheckCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwhttjvop/image/upload"; 
const UPLOAD_PRESET = "zyro esports"; 

const Profile = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    gameUID: "",
    teamName: "",
    photoURL: "",
    teamLogo: "",
    teamMembers: ["", "", "", ""] // 4 other members
  });

  // Points system
  const POINTS_PACKAGES = [
    { id: 1, price: 49, points: 150, label: "Basic" },
    { id: 2, price: 99, points: 250, label: "Pro" },
    { id: 3, price: 199, points: 500, label: "Premium" }
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setFormData({
            displayName: data.displayName || "",
            gameUID: data.gameUID || "",
            teamName: data.teamName || "",
            photoURL: data.photoURL || "",
            teamLogo: data.teamLogo || "",
            teamMembers: data.teamMembers || ["", "", "", ""]
          });
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchData();
      else setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Helpers
  const isLocked = () => {
    if (!userData?.lastProfileUpdate) return false;
    const lastUpdate = userData.lastProfileUpdate.toDate();
    return Math.ceil((new Date() - lastUpdate) / (1000 * 60 * 60 * 24)) < 14;
  };

  const getDaysRemaining = () => {
    if (!userData?.lastProfileUpdate) return 0;
    const lastUpdate = userData.lastProfileUpdate.toDate();
    const unlockDate = new Date(lastUpdate);
    unlockDate.setDate(unlockDate.getDate() + 14);
    const diff = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleImageUpload = async (e, type = "photo") => {
    const file = e.target.files[0];
    if (!file) return;
    setSaving(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET);
      const res = await fetch(CLOUDINARY_URL, { method: "POST", body: data });
      const fileData = await res.json();
      
      if (type === "teamLogo") {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { teamLogo: fileData.secure_url });
        setFormData(prev => ({ ...prev, teamLogo: fileData.secure_url }));
      } else {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: fileData.secure_url });
        setFormData(prev => ({ ...prev, photoURL: fileData.secure_url }));
      }
      addNotification('success', "Image updated!");
    } catch (err) {
      addNotification('error', "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSyncProfile = async () => {
    if (isLocked()) return addNotification('error', `Locked for ${getDaysRemaining()} days`);
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        ...formData,
        lastProfileUpdate: serverTimestamp()
      });
      setUserData(prev => ({ ...prev, ...formData }));
      setEditMode(false);
      addNotification('success', "Profile updated!");
    } catch (err) { 
      addNotification('error', "Error saving"); 
    }
    setSaving(false);
  };

  const handlePurchasePoints = async (pkg) => {
    setSaving(true);
    try {
      const newPoints = (userData?.points || 0) + pkg.points;
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        points: newPoints
      });
      setUserData(prev => ({ ...prev, points: newPoints }));
      addNotification('success', `+${pkg.points} points added!`);
    } catch (err) {
      addNotification('error', "Purchase failed");
    }
    setSaving(false);
  };

  const handleRedeem = () => {
    if ((userData?.points || 0) >= 500) {
      addNotification('success', "Premium activated! Cap unlocked!");
      updateDoc(doc(db, "users", auth.currentUser.uid), {
        isPremium: true,
        points: (userData?.points || 0) - 500
      });
      setUserData(prev => ({ ...prev, isPremium: true, points: prev.points - 500 }));
    } else {
      addNotification('error', "Need 500 points to redeem");
    }
  };

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-rosePink border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 max-w-6xl mx-auto">
        {/* Main Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 mb-8">
          
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-rosePink to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-black overflow-hidden">
                  <img 
                    src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                    className="w-full h-full object-cover"
                    alt="Profile"
                  />
                </div>
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-rosePink rounded-full cursor-pointer hover:scale-110 transition">
                <Camera size={18} />
                <input type="file" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-4xl font-bold">{userData?.displayName || "No Name"}</h1>
                {userData?.isPremium && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold flex items-center gap-1">
                    <Crown size={14} /> PREMIUM
                  </span>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-rosePink">
                  <Hash size={16} />
                  <span className="font-mono">{userData?.gameUID || "NO UID"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span>{userData?.teamName || "No Team"}</span>
                </div>
              </div>

              {/* Points Meter */}
              <div className="max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Warrior Points</span>
                  <span className="font-bold text-xl">{userData?.points || 0}<span className="text-sm text-rosePink ml-1">pts</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((userData?.points || 0) / 500) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-rosePink to-purple-600"
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0</span>
                  <span>500 for Premium</span>
                </div>
                
                {/* Points Purchase Buttons */}
                <div className="flex gap-2 mt-4">
                  {POINTS_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchasePoints(pkg)}
                      disabled={saving}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold flex-1 transition"
                    >
                      ₹{pkg.price} (+{pkg.points})
                    </button>
                  ))}
                </div>
                
                {/* Redeem Button */}
                <button
                  onClick={handleRedeem}
                  disabled={(userData?.points || 0) < 500}
                  className={`w-full mt-4 py-3 rounded-xl font-bold transition ${(userData?.points || 0) >= 500 ? 'bg-gradient-to-r from-rosePink to-purple-600 hover:opacity-90' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                >
                  {(userData?.points || 0) >= 500 ? '🎁 REDEEM PREMIUM + CAP' : 'Need 500 points to redeem'}
                </button>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex justify-end">
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="px-6 py-2 border border-gray-700 hover:border-rosePink rounded-xl flex items-center gap-2 transition">
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => setEditMode(false)} className="px-6 py-2 border border-gray-700 hover:border-red-500 rounded-xl">
                  Cancel
                </button>
                <button onClick={handleSyncProfile} disabled={saving} className="px-6 py-2 bg-rosePink hover:bg-rosePink/80 rounded-xl flex items-center gap-2">
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Team Info & Logo */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-rosePink" />
              <h2 className="text-2xl font-bold">Team Details</h2>
            </div>
            
            {/* Team Logo Upload */}
            <div className="mb-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                    {formData.teamLogo ? (
                      <img src={formData.teamLogo} className="w-full h-full object-cover" alt="Team Logo" />
                    ) : (
                      <span className="text-gray-500">Logo</span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700">
                    <Camera size={14} />
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, "teamLogo")} />
                  </label>
                </div>
                <div className="flex-1">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={e => setFormData({...formData, teamName: e.target.value})}
                      placeholder="Team Name"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-lg font-bold"
                    />
                  ) : (
                    <h3 className="text-3xl font-bold">{userData?.teamName || "No Team Name"}</h3>
                  )}
                  <p className="text-gray-400 mt-2">Add team logo and name</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            {isLocked() && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                <Lock size={20} className="text-red-500" />
                <div>
                  <p className="font-bold text-sm">Profile Locked</p>
                  <p className="text-xs text-gray-400">Changes allowed in {getDaysRemaining()} days</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Team Members */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="text-blue-500" />
                <h2 className="text-2xl font-bold">Team Members</h2>
              </div>
              <span className="text-sm text-gray-400">5/5 Slots</span>
            </div>

            {/* Self */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rosePink to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden">
                    <img src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} className="w-full h-full object-cover" alt="You" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{userData?.displayName || "You"}</p>
                  <p className="text-sm text-gray-400">Leader • {userData?.gameUID || "UID"}</p>
                </div>
                <span className="px-3 py-1 bg-rosePink/20 text-rosePink rounded-full text-xs font-bold">YOU</span>
              </div>
            </div>

            {/* Other Members (4) */}
            <div className="space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamMembers[index] || ""}
                      onChange={e => {
                        const newMembers = [...formData.teamMembers];
                        newMembers[index] = e.target.value;
                        setFormData({...formData, teamMembers: newMembers});
                      }}
                      placeholder={`Member ${index + 1} Name & UID`}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                      disabled={isLocked()}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{formData.teamMembers[index] || `Empty Slot ${index + 1}`}</p>
                        {formData.teamMembers[index] && (
                          <p className="text-xs text-gray-400">Add UID in edit mode</p>
                        )}
                      </div>
                      {!formData.teamMembers[index] && (
                        <span className="text-xs text-gray-500">Empty</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <p className="text-sm text-gray-500 mt-4">
                Enter member names with UID (e.g., "PlayerName#1234")
              </p>
            )}
          </div>
        </motion.div>

        {/* Achievements Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-yellow-500" />
              <h2 className="text-2xl font-bold">Achievements</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${(userData?.points || 0) >= 150 ? 'border-green-500/50 bg-green-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
                <div className="text-2xl mb-2">🎟️</div>
                <p className="font-bold text-sm">Free Pass</p>
                <p className="text-xs text-gray-400">150 points</p>
                {(userData?.points || 0) >= 150 && (
                  <CheckCircle size={16} className="text-green-500 mt-2" />
                )}
              </div>
              
              <div className={`p-4 rounded-xl border ${(userData?.points || 0) >= 500 ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
                <div className="text-2xl mb-2">🧢</div>
                <p className="font-bold text-sm">Zyro Cap</p>
                <p className="text-xs text-gray-400">500 points</p>
                {(userData?.points || 0) >= 500 && (
                  <CheckCircle size={16} className="text-yellow-500 mt-2" />
                )}
              </div>
              
              <div className={`p-4 rounded-xl border ${userData?.isPremium ? 'border-purple-500/50 bg-purple-500/10' : 'border-gray-700 bg-gray-800/30'}`}>
                <div className="text-2xl mb-2">⭐</div>
                <p className="font-bold text-sm">Premium</p>
                <p className="text-xs text-gray-400">Redeem at 500</p>
                {userData?.isPremium && (
                  <CheckCircle size={16} className="text-purple-500 mt-2" />
                )}
              </div>
              
              <div className="p-4 rounded-xl border border-gray-700 bg-gray-800/30">
                <div className="text-2xl mb-2">🏆</div>
                <p className="font-bold text-sm">Coming Soon</p>
                <p className="text-xs text-gray-400">More rewards</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;