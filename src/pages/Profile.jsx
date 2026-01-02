import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Trophy, Star, Zap, Edit3, Camera, Lock, 
  Award, Crown, Save, X, Loader, Sparkles, Hash, 
  Users, Gift, Target, CheckCircle, Upload, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwhttjvop/image/upload"; 
const UPLOAD_PRESET = "zyro esports"; 

const Profile = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    gameUID: "",
    teamName: "",
    photoURL: "",
    teamLogo: "",
    teamMembers: ["", "", "", ""]
  });

  // Points system
  const POINTS_PACKAGES = [
    { id: 1, price: 49, points: 150, label: "Basic" },
    { id: 2, price: 99, points: 250, label: "Pro" },
    { id: 3, price: 199, points: 500, label: "Premium" }
  ];

  // ✅ FIXED: Fetch user data properly
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("User data loaded:", data);
          setUserData(data);
          setFormData({
            displayName: data.displayName || user.displayName || "",
            gameUID: data.gameUID || "",
            teamName: data.teamName || "",
            photoURL: data.photoURL || user.photoURL || "",
            teamLogo: data.teamLogo || "",
            teamMembers: data.teamMembers || ["", "", "", ""]
          });
        } else {
          // Create user document if doesn't exist
          console.log("Creating new user document");
          const newUserData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            gameUID: "",
            teamName: "",
            teamLogo: "",
            teamMembers: ["", "", "", ""],
            points: 0,
            isPremium: false,
            createdAt: serverTimestamp(),
            lastProfileUpdate: null
          };
          
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
          setFormData({
            displayName: newUserData.displayName,
            gameUID: newUserData.gameUID,
            teamName: newUserData.teamName,
            photoURL: newUserData.photoURL,
            teamLogo: newUserData.teamLogo,
            teamMembers: newUserData.teamMembers
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        addNotification('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, addNotification]);

  // ✅ FIXED: Check if profile is locked
  const isLocked = () => {
    if (!userData?.lastProfileUpdate) return false;
    
    try {
      const lastUpdate = userData.lastProfileUpdate.toDate ? 
        userData.lastProfileUpdate.toDate() : 
        new Date(userData.lastProfileUpdate);
      
      const daysSinceUpdate = Math.ceil((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
      return daysSinceUpdate < 14;
    } catch (error) {
      console.error("Error checking lock:", error);
      return false;
    }
  };

  // ✅ FIXED: Get days remaining
  const getDaysRemaining = () => {
    if (!userData?.lastProfileUpdate) return 0;
    
    try {
      const lastUpdate = userData.lastProfileUpdate.toDate ? 
        userData.lastProfileUpdate.toDate() : 
        new Date(userData.lastProfileUpdate);
      
      const unlockDate = new Date(lastUpdate);
      unlockDate.setDate(unlockDate.getDate() + 14);
      const diff = Math.ceil((unlockDate - new Date()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return 0;
    }
  };

  // ✅ FIXED: Image upload function
  const handleImageUpload = async (e, type = "photo") => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      addNotification('error', 'Please select an image file');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", "zyro-esports/profiles");
      
      console.log("Uploading image to Cloudinary...");
      
      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const fileData = await response.json();
      console.log("Cloudinary response:", fileData);
      
      if (!fileData.secure_url) {
        throw new Error('No URL returned from Cloudinary');
      }
      
      const updateData = {};
      const fieldName = type === "teamLogo" ? "teamLogo" : "photoURL";
      updateData[fieldName] = fileData.secure_url;
      
      // Update in Firebase
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserData(prev => ({ ...prev, [fieldName]: fileData.secure_url }));
      setFormData(prev => ({ ...prev, [fieldName]: fileData.secure_url }));
      
      addNotification('success', `${type === "teamLogo" ? 'Team logo' : 'Profile picture'} updated successfully!`);
      
    } catch (error) {
      console.error("Image upload error:", error);
      addNotification('error', `Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  // ✅ FIXED: Save profile function
  const handleSaveProfile = async () => {
    if (isLocked()) {
      addNotification('error', `Profile is locked for ${getDaysRemaining()} more days`);
      return;
    }

    // Validate required fields
    if (!formData.displayName.trim()) {
      addNotification('error', 'Please enter your display name');
      return;
    }

    if (!formData.gameUID.trim()) {
      addNotification('error', 'Please enter your Game UID');
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userRef = doc(db, "users", user.uid);
      
      const updateData = {
        displayName: formData.displayName.trim(),
        gameUID: formData.gameUID.trim(),
        teamName: formData.teamName.trim(),
        teamMembers: formData.teamMembers,
        lastProfileUpdate: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log("Updating user data:", updateData);
      
      await updateDoc(userRef, updateData);
      
      // Update local state
      setUserData(prev => ({
        ...prev,
        ...updateData
      }));
      
      setEditMode(false);
      addNotification('success', 'Profile updated successfully!');
      
    } catch (error) {
      console.error("Error saving profile:", error);
      addNotification('error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED: Purchase points function
  const handlePurchasePoints = async (pkg) => {
    if (!auth.currentUser) {
      addNotification('error', 'Please login first');
      navigate('/login');
      return;
    }

    setSaving(true);
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const currentPoints = userData?.points || 0;
      const newPoints = currentPoints + pkg.points;
      
      await updateDoc(userRef, {
        points: newPoints,
        lastPurchase: serverTimestamp()
      });
      
      // Update local state
      setUserData(prev => ({ 
        ...prev, 
        points: newPoints 
      }));
      
      addNotification('success', `Successfully purchased ${pkg.points} points!`);
      
    } catch (error) {
      console.error("Purchase error:", error);
      addNotification('error', 'Failed to process purchase');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED: Redeem premium function
  const handleRedeemPremium = async () => {
    if (!auth.currentUser) {
      addNotification('error', 'Please login first');
      navigate('/login');
      return;
    }

    const currentPoints = userData?.points || 0;
    
    if (currentPoints < 500) {
      addNotification('error', 'You need 500 points to redeem premium');
      return;
    }

    setSaving(true);
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const newPoints = currentPoints - 500;
      
      await updateDoc(userRef, {
        points: newPoints,
        isPremium: true,
        premiumSince: serverTimestamp(),
        lastRedemption: serverTimestamp()
      });
      
      // Update local state
      setUserData(prev => ({ 
        ...prev, 
        points: newPoints,
        isPremium: true
      }));
      
      addNotification('success', '🎉 Premium activated successfully! Tournament cap unlocked!');
      
    } catch (error) {
      console.error("Redeem error:", error);
      addNotification('error', 'Failed to redeem premium');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIXED: Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FIXED: Handle team member changes
  const handleTeamMemberChange = (index, value) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index] = value;
    setFormData(prev => ({
      ...prev,
      teamMembers: newMembers
    }));
  };

  // ✅ FIXED: Refresh profile data
  const handleRefreshProfile = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
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
      addNotification('success', 'Profile refreshed!');
    } catch (error) {
      console.error("Refresh error:", error);
      addNotification('error', 'Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-rosePink border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="pt-24 px-4 max-w-6xl mx-auto">
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button 
            onClick={handleRefreshProfile}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Main Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8 mb-8"
        >
          
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
            {/* Profile Photo Section */}
            <div className="relative">
              <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-black overflow-hidden border-2 border-gray-800">
                  <img 
                    src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                    className="w-full h-full object-cover"
                    alt="Profile"
                    onError={(e) => {
                      e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`;
                    }}
                  />
                </div>
              </div>
              <label className="absolute bottom-2 right-2 p-2 bg-rose-500 hover:bg-rose-600 rounded-full cursor-pointer transition shadow-lg">
                {uploading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e, "photo")}
                  accept="image/*"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Profile Info */}
            <div className="text-center lg:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="text-3xl md:text-4xl font-bold bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 min-w-[300px]"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold">{userData?.displayName || "No Name"}</h1>
                )}
                
                {userData?.isPremium && (
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold flex items-center gap-1">
                    <Crown size={14} /> PREMIUM
                  </span>
                )}
              </div>
              
              {/* Game UID */}
              <div className="mb-6">
                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Hash size={16} className="text-rose-500" />
                    <input
                      type="text"
                      value={formData.gameUID}
                      onChange={(e) => handleInputChange('gameUID', e.target.value)}
                      className="font-mono bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 flex-1"
                      placeholder="Enter your Game UID"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500 mb-4">
                    <Hash size={16} />
                    <span className="font-mono">{userData?.gameUID || "NO UID"}</span>
                  </div>
                )}
              </div>

              {/* Points System */}
              <div className="max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Warrior Points</span>
                  <span className="font-bold text-xl">{userData?.points || 0}<span className="text-sm text-rose-500 ml-1">pts</span></span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((userData?.points || 0) / 500) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 to-purple-600"
                  />
                </div>
                
                {/* Points Purchase Buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {POINTS_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => handlePurchasePoints(pkg)}
                      disabled={saving}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold flex-1 min-w-[100px] transition disabled:opacity-50"
                    >
                      ₹{pkg.price} (+{pkg.points})
                    </button>
                  ))}
                </div>
                
                {/* Redeem Premium Button */}
                <button
                  onClick={handleRedeemPremium}
                  disabled={(userData?.points || 0) < 500 || saving}
                  className={`w-full py-3 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    (userData?.points || 0) >= 500 
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90' 
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {saving ? (
                    <Loader size={16} className="animate-spin mx-auto" />
                  ) : (userData?.points || 0) >= 500 ? (
                    '🎁 REDEEM PREMIUM + CAP'
                  ) : (
                    `Need ${500 - (userData?.points || 0)} more points`
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end">
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                className="px-6 py-3 border border-gray-700 hover:border-rose-500 rounded-xl flex items-center gap-2 transition"
                disabled={isLocked()}
              >
                {isLocked() ? (
                  <>
                    <Lock size={16} /> Locked for {getDaysRemaining()} days
                  </>
                ) : (
                  <>
                    <Edit3 size={16} /> Edit Profile
                  </>
                )}
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setEditMode(false);
                    // Reset form to current user data
                    setFormData({
                      displayName: userData?.displayName || "",
                      gameUID: userData?.gameUID || "",
                      teamName: userData?.teamName || "",
                      photoURL: userData?.photoURL || "",
                      teamLogo: userData?.teamLogo || "",
                      teamMembers: userData?.teamMembers || ["", "", "", ""]
                    });
                  }} 
                  className="px-6 py-3 border border-gray-700 hover:border-red-500 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="px-6 py-3 bg-rose-500 hover:bg-rose-600 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          
          {/* Team Info & Logo */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-rose-500" />
              <h2 className="text-2xl font-bold">Team Details</h2>
            </div>
            
            {/* Team Logo Upload */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden">
                    {formData.teamLogo ? (
                      <img 
                        src={formData.teamLogo} 
                        className="w-full h-full object-cover" 
                        alt="Team Logo"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100/1f2937/ffffff?text=LOGO";
                        }}
                      />
                    ) : (
                      <span className="text-gray-500">Logo</span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-full cursor-pointer transition">
                    {uploading ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Camera size={14} />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, "teamLogo")}
                      accept="image/*"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <div className="flex-1 w-full">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={(e) => handleInputChange('teamName', e.target.value)}
                      placeholder="Team Name"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-lg font-bold"
                    />
                  ) : (
                    <h3 className="text-2xl md:text-3xl font-bold">{userData?.teamName || "No Team Name"}</h3>
                  )}
                  <p className="text-gray-400 mt-2">Add team logo and name</p>
                </div>
              </div>
            </div>

            {/* Lock Notice */}
            {isLocked() && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                <Lock size={20} className="text-red-500" />
                <div>
                  <p className="font-bold text-sm">Profile Update Locked</p>
                  <p className="text-xs text-gray-400">
                    You can edit your profile again in {getDaysRemaining()} days
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Team Members */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="text-blue-500" />
                <h2 className="text-2xl font-bold">Team Members</h2>
              </div>
              <span className="text-sm text-gray-400">5/5 Slots</span>
            </div>

            {/* Team Leader (You) */}
            <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden">
                    <img 
                      src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                      className="w-full h-full object-cover" 
                      alt="You" 
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{userData?.displayName || "You"}</p>
                  <p className="text-sm text-gray-400">Leader • {userData?.gameUID || "No UID"}</p>
                </div>
                <span className="px-3 py-1 bg-rose-500/20 text-rose-500 rounded-full text-xs font-bold">LEADER</span>
              </div>
            </div>

            {/* Other Team Members */}
            <div className="space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamMembers[index] || ""}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      placeholder={`Member ${index + 1} Name & UID`}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 disabled:opacity-50"
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
                          <p className="text-xs text-gray-400">Member</p>
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
                💡 Enter member names with UID (e.g., "PlayerName#123456789")
              </p>
            )}
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="mt-8"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-yellow-500" />
              <h2 className="text-2xl font-bold">Achievements</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl border ${
                (userData?.points || 0) >= 150 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-gray-700 bg-gray-800/30'
              }`}>
                <div className="text-2xl mb-2">🎟️</div>
                <p className="font-bold text-sm">Free Pass</p>
                <p className="text-xs text-gray-400">150 points</p>
                {(userData?.points || 0) >= 150 && (
                  <CheckCircle size={16} className="text-green-500 mt-2" />
                )}
              </div>
              
              <div className={`p-4 rounded-xl border ${
                (userData?.points || 0) >= 500 
                  ? 'border-yellow-500/50 bg-yellow-500/10' 
                  : 'border-gray-700 bg-gray-800/30'
              }`}>
                <div className="text-2xl mb-2">🧢</div>
                <p className="font-bold text-sm">Zyro Cap</p>
                <p className="text-xs text-gray-400">500 points</p>
                {(userData?.points || 0) >= 500 && (
                  <CheckCircle size={16} className="text-yellow-500 mt-2" />
                )}
              </div>
              
              <div className={`p-4 rounded-xl border ${
                userData?.isPremium 
                  ? 'border-purple-500/50 bg-purple-500/10' 
                  : 'border-gray-700 bg-gray-800/30'
              }`}>
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