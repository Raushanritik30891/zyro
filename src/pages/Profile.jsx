import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Trophy, Star, Zap, Edit3, Camera, Lock, 
  Award, Crown, Save, X, Loader, Sparkles, Hash, 
  Users, Gift, Target, CheckCircle, Upload, RefreshCw,
  CreditCard, Info, DollarSign, Mail, Phone, Calendar,
  Clock, ExternalLink, Home, Settings, Package, Wallet,
  TrendingUp, BarChart, History, ChevronRight, AlertCircle,
  ShieldCheck, ZapOff, GitMerge, Gamepad2, Bell, Key,
  Heart, Gem, Rocket, Sparkle, Medal, BadgeCheck,
  Star as StarIcon, Flame, Target as TargetIcon,
  Award as AwardIcon, Shield as ShieldIcon,
  Battery, BatteryCharging, BatteryFull,
  TrendingUp as TrendingUpIcon, ShieldOff,
  CheckCircle2, XCircle, AlertTriangle,
  Flame as FlameIcon, Wind, Cloud, Sun,
  Moon, Sunrise, Sunset, CloudRain,
  CloudLightning, CloudSnow, Droplets,
  Thermometer, Umbrella, Waves,
  Sword, Download, Copy, Check
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp, 
  setDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwhttjvop/image/upload"; 
const UPLOAD_PRESET = "zyro esports"; 

const Profile = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [error, setError] = useState(null);
  const [confirmPurchase, setConfirmPurchase] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const [formData, setFormData] = useState({
    displayName: "",
    gameUID: "",
    teamName: "",
    photoURL: "",
    teamLogo: "",
    teamMembers: ["", "", "", ""]
  });

  const [paymentModal, setPaymentModal] = useState({
    show: false,
    package: null
  });

  // Premium Badges System
  const BADGES = {
    PREMIUM: {
      icon: <Crown className="w-4 h-4" />,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/30",
      label: "PREMIUM USER",
      description: "Tournament Cap Unlocked"
    },
    WARRIOR: {
      icon: <Sword className="w-4 h-4" />,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-gradient-to-r from-red-500/20 to-rose-500/20",
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      label: "WARRIOR",
      description: "100+ Points"
    },
    VETERAN: {
      icon: <ShieldCheck className="w-4 h-4" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      label: "VETERAN",
      description: "Active for 30+ days"
    },
    CHAMPION: {
      icon: <Trophy className="w-4 h-4" />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-r from-purple-500/20 to-pink-500/20",
      textColor: "text-purple-400",
      borderColor: "border-purple-500/30",
      label: "CHAMPION",
      description: "Tournament Winner"
    },
    ZYRO_ELITE: {
      icon: <Gem className="w-4 h-4" />,
      color: "from-emerald-500 to-green-500",
      bgColor: "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      label: "ZYRO ELITE",
      description: "Top 10 Leaderboard"
    },
    NEWBIE: {
      icon: <Sparkle className="w-4 h-4" />,
      color: "from-gray-500 to-gray-700",
      bgColor: "bg-gradient-to-r from-gray-500/20 to-gray-700/20",
      textColor: "text-gray-400",
      borderColor: "border-gray-500/30",
      label: "NEWBIE",
      description: "New User"
    }
  };

  const getUserBadges = () => {
    const badges = [];
    const points = userData?.points || 0;
    const isPremium = userData?.isPremium || false;
    const createdAt = userData?.createdAt;
    
    // Premium Badge
    if (isPremium) {
      badges.push(BADGES.PREMIUM);
    }
    
    // Warrior Badge
    if (points >= 100) {
      badges.push(BADGES.WARRIOR);
    }
    
    // Veteran Badge (based on account age)
    if (createdAt) {
      try {
        let createdDate;
        if (createdAt.toDate) {
          createdDate = createdAt.toDate();
        } else if (createdAt.seconds) {
          createdDate = new Date(createdAt.seconds * 1000);
        }
        
        if (createdDate) {
          const daysOld = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
          if (daysOld >= 30) {
            badges.push(BADGES.VETERAN);
          }
        }
      } catch (error) {
        console.error("Error calculating account age:", error);
      }
    }
    
    // Newbie Badge (if no other badges)
    if (badges.length === 0) {
      badges.push(BADGES.NEWBIE);
    }
    
    return badges;
  };

  const POINTS_PACKAGES = [
    { id: 1, price: 99, points: 10, label: "Basic", icon: "⚡", color: "from-blue-500 to-cyan-500" },
    { id: 2, price: 199, points: 20, label: "Pro", icon: "🔥", color: "from-orange-500 to-red-500" },
    { id: 3, price: 299, points: 50, label: "Premium", icon: "👑", color: "from-yellow-500 to-amber-500" },
    { id: 4, price: 499, points: 150, label: "Ultimate", icon: "💎", color: "from-purple-500 to-pink-500" },
    { id: 5, price: 999, points: 500, label: "Legend", icon: "🏆", color: "from-green-500 to-emerald-500" }
  ];

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      addNotification('success', `${field === 'uid' ? 'Game UID' : 'Order ID'} copied!`);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (err) {
      addNotification('error', 'Failed to copy');
    }
  };

  // Export profile data
  const handleExportProfile = () => {
    try {
      const data = {
        profile: userData,
        subscriptions: subscriptions,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zyro-profile-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addNotification('success', 'Profile data exported successfully!');
    } catch (error) {
      console.error("Export error:", error);
      addNotification('error', 'Failed to export data');
    }
  };

  // Confirmation before purchase
  const confirmAndPurchase = (pkg) => {
    setConfirmPurchase(pkg);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError(null);
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }

        // Check for unsaved changes
        const unsavedChanges = localStorage.getItem('zyro_profile_unsaved');
        if (unsavedChanges) {
          const shouldRestore = window.confirm('You have unsaved changes from previous session. Restore them?');
          if (shouldRestore) {
            const parsedData = JSON.parse(unsavedChanges);
            setFormData(parsedData);
            setEditMode(true);
          } else {
            localStorage.removeItem('zyro_profile_unsaved');
          }
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
          
          // ✅ IMPORTANT: Fetch ALL subscriptions (not just pending)
          try {
            const subscriptionsQuery = query(
              collection(db, "subscriptions"),
              where("userId", "==", user.uid)
            );
            const subsSnapshot = await getDocs(subscriptionsQuery);
            const subsData = subsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Sort by date (newest first)
            subsData.sort((a, b) => {
              const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
              const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
              return dateB - dateA;
            });
            
            console.log("Subscriptions loaded:", subsData);
            setSubscriptions(subsData);
          } catch (indexError) {
            console.log("Error fetching subscriptions:", indexError);
            setSubscriptions([]);
          }
        } else {
          // Create user document
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
            lastProfileUpdate: null,
            premiumSince: null,
            lastRedemption: null,
            totalMatches: 0,
            matchesWon: 0,
            kills: 0,
            rank: "Unranked",
            level: 1
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
        setError(error.message);
        addNotification('error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, addNotification]);

  // Save unsaved changes to localStorage
  useEffect(() => {
    if (editMode) {
      localStorage.setItem('zyro_profile_unsaved', JSON.stringify(formData));
    }
  }, [formData, editMode]);

  // Profile Lock Functions
  const isLocked = () => {
    if (!userData?.lastProfileUpdate) {
      console.log("No lastProfileUpdate found, returning false");
      return false;
    }
    
    try {
      let lastUpdate;
      if (userData.lastProfileUpdate.toDate) {
        lastUpdate = userData.lastProfileUpdate.toDate();
      } else if (userData.lastProfileUpdate.seconds) {
        lastUpdate = new Date(userData.lastProfileUpdate.seconds * 1000);
      } else if (userData.lastProfileUpdate instanceof Date) {
        lastUpdate = userData.lastProfileUpdate;
      } else {
        console.log("Unknown lastProfileUpdate format:", userData.lastProfileUpdate);
        return false;
      }
      
      const today = new Date();
      const daysSinceUpdate = Math.floor((today - lastUpdate) / (1000 * 60 * 60 * 24));
      
      console.log("🔒 Lock Check:");
      console.log("Last Update:", lastUpdate);
      console.log("Today:", today);
      console.log("Days since update:", daysSinceUpdate);
      console.log("Is Locked:", daysSinceUpdate < 14);
      
      return daysSinceUpdate < 14;
    } catch (error) {
      console.error("Error checking lock:", error);
      return false;
    }
  };

  const getDaysRemaining = () => {
    if (!userData?.lastProfileUpdate) {
      console.log("No lastProfileUpdate found, returning 0");
      return 0;
    }
    
    try {
      let lastUpdate;
      if (userData.lastProfileUpdate.toDate) {
        lastUpdate = userData.lastProfileUpdate.toDate();
      } else if (userData.lastProfileUpdate.seconds) {
        lastUpdate = new Date(userData.lastProfileUpdate.seconds * 1000);
      } else if (userData.lastProfileUpdate instanceof Date) {
        lastUpdate = userData.lastProfileUpdate;
      } else {
        console.log("Unknown date format, returning 0");
        return 0;
      }
      
      const unlockDate = new Date(lastUpdate);
      unlockDate.setDate(unlockDate.getDate() + 14);
      
      const today = new Date();
      const diffTime = unlockDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      console.log("📅 Days Remaining Check:");
      console.log("Last Update:", lastUpdate);
      console.log("Unlock Date:", unlockDate);
      console.log("Days Remaining:", diffDays);
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error("Error calculating days remaining:", error);
      return 0;
    }
  };

  // Subscription Functions
  const getSubscriptionDaysRemaining = () => {
    if (!userData?.premiumSince) {
      return 0;
    }
    
    try {
      let premiumStartDate;
      if (userData.premiumSince.toDate) {
        premiumStartDate = userData.premiumSince.toDate();
      } else if (userData.premiumSince.seconds) {
        premiumStartDate = new Date(userData.premiumSince.seconds * 1000);
      } else if (userData.premiumSince instanceof Date) {
        premiumStartDate = userData.premiumSince;
      } else {
        console.log("Unknown premiumSince format:", userData.premiumSince);
        return 0;
      }
      
      const premiumEndDate = new Date(premiumStartDate);
      premiumEndDate.setDate(premiumEndDate.getDate() + 30);
      
      const today = new Date();
      const diffTime = premiumEndDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays > 0 ? diffDays : 0;
    } catch (error) {
      console.error("Error calculating subscription days:", error);
      return 0;
    }
  };

  // ✅ NEW: Renewal Date Calculate करने के लिए
  const getRenewalDate = (premiumSince) => {
    if (!premiumSince) return "N/A";
    
    try {
      let premiumStartDate;
      if (premiumSince.toDate) {
        premiumStartDate = premiumSince.toDate();
      } else if (premiumSince.seconds) {
        premiumStartDate = new Date(premiumSince.seconds * 1000);
      } else if (premiumSince instanceof Date) {
        premiumStartDate = premiumSince;
      } else {
        return "N/A";
      }
      
      const renewalDate = new Date(premiumStartDate);
      renewalDate.setDate(renewalDate.getDate() + 30);
      
      return renewalDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error calculating renewal date:", error);
      return "N/A";
    }
  };

  const getSubscriptionStatus = () => {
    if (!userData?.isPremium) {
      return {
        status: "inactive",
        daysRemaining: 0,
        isActive: false
      };
    }
    
    const daysRemaining = getSubscriptionDaysRemaining();
    
    if (daysRemaining > 0) {
      return {
        status: "active",
        daysRemaining,
        isActive: true
      };
    } else {
      return {
        status: "expired",
        daysRemaining: 0,
        isActive: false
      };
    }
  };

  // Memoize expensive calculations
  const subscriptionStatus = useMemo(() => getSubscriptionStatus(), [userData]);
  const userBadges = useMemo(() => getUserBadges(), [userData]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    
    try {
      let jsDate;
      if (date.toDate) {
        jsDate = date.toDate();
      } else if (date.seconds) {
        jsDate = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        return "N/A";
      }
      
      return jsDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatDateOnly = (date) => {
    if (!date) return "N/A";
    
    try {
      let jsDate;
      if (date.toDate) {
        jsDate = date.toDate();
      } else if (date.seconds) {
        jsDate = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        jsDate = date;
      } else {
        return "N/A";
      }
      
      return jsDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Image Upload with Preview
  const handleImageUpload = async (e, type = "photo") => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const previewUrl = event.target.result;
      const fieldName = type === "teamLogo" ? "teamLogo" : "photoURL";
      setFormData(prev => ({
        ...prev,
        [fieldName]: previewUrl
      }));
    };
    reader.readAsDataURL(file);
    
    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'Image size should be less than 5MB');
      return;
    }

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
      
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, updateData);
      
      setUserData(prev => ({ ...prev, [fieldName]: fileData.secure_url }));
      setFormData(prev => ({ ...prev, [fieldName]: fileData.secure_url }));
      
      addNotification('success', `${type === "teamLogo" ? 'Team logo' : 'Profile picture'} updated successfully!`);
      
    } catch (error) {
      console.error("Image upload error:", error);
      addNotification('error', `Failed to upload image: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (isLocked()) {
      addNotification('error', `Profile is locked for ${getDaysRemaining()} more days`);
      return;
    }

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
      
      const updatedUserSnap = await getDoc(userRef);
      if (updatedUserSnap.exists()) {
        setUserData(updatedUserSnap.data());
      }
      
      setEditMode(false);
      localStorage.removeItem('zyro_profile_unsaved');
      addNotification('success', 'Profile updated successfully!');
      
    } catch (error) {
      console.error("Error saving profile:", error);
      addNotification('error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Purchase Points
  const handlePurchasePoints = async (pkg) => {
    if (!auth.currentUser) {
      addNotification('error', 'Please login first');
      navigate('/login');
      return;
    }

    setSaving(true);
    
    try {
      const user = auth.currentUser;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const currentUserData = userSnap.exists() ? userSnap.data() : {};
      
      const orderId = `POINTS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const subscriptionsCollection = collection(db, "subscriptions");
      
      await setDoc(doc(subscriptionsCollection, orderId), {
        userId: user.uid,
        userEmail: user.email,
        userName: currentUserData.displayName || user.displayName || "Unknown",
        userWhatsapp: currentUserData.phoneNumber || "",
        
        planName: `${pkg.label} Points Package`,
        planId: `points_${pkg.id}`,
        amount: pkg.price,
        pointsToAdd: pkg.points,
        
        transactionId: "",
        screenshotUrl: "",
        upiId: "zyroesports@upi",
        
        status: "pending",
        submittedAt: serverTimestamp(),
        orderId: orderId,
        type: "points_purchase",
        
        currentPoints: currentUserData.points || 0,
        
        approvedAt: null,
        approvedBy: null,
        adminNotes: ""
      });
      
      setPaymentModal({
        show: true,
        package: pkg
      });
      
      addNotification('success', `Purchase request created! Please complete payment to get ${pkg.points} points.`);
      
    } catch (error) {
      console.error("Purchase request error:", error);
      addNotification('error', 'Failed to create purchase request');
    } finally {
      setSaving(false);
    }
  };

  // Redeem Premium
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

  // Form Handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTeamMemberChange = (index, value) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index] = value;
    setFormData(prev => ({
      ...prev,
      teamMembers: newMembers
    }));
  };

  // Refresh Profile
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
        
        // Refresh subscriptions
        try {
          const subscriptionsQuery = query(
            collection(db, "subscriptions"),
            where("userId", "==", user.uid)
          );
          const subsSnapshot = await getDocs(subscriptionsQuery);
          const subsData = subsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          subsData.sort((a, b) => {
            const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
            const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
            return dateB - dateA;
          });
          
          setSubscriptions(subsData);
        } catch (indexError) {
          console.log("Error refreshing subscriptions:", indexError);
        }
      }
      addNotification('success', 'Profile refreshed!');
    } catch (error) {
      console.error("Refresh error:", error);
      addNotification('error', 'Failed to refresh profile');
    } finally {
      setLoading(false);
    }
  };

  // Payment Modal
  const PaymentInstructionsModal = () => {
    if (!paymentModal.show) return null;
    
    const pkg = paymentModal.package;
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 p-8 rounded-3xl max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl mb-4">
              <CreditCard size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Complete Payment</h3>
            <p className="text-4xl font-bold text-white mb-3">₹{pkg.price}</p>
            <div className="text-sm text-yellow-500 font-bold mb-3">
              Get {pkg.points} Points After Approval
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-black/50 rounded-xl border border-gray-800">
              <p className="text-center font-bold mb-2">Payment Instructions:</p>
              <ol className="text-sm text-gray-300 space-y-2">
                <li>1. Send ₹{pkg.price} to UPI: <strong>zyroesports@upi</strong></li>
                <li>2. Save the transaction screenshot</li>
                <li>3. Go to Subscription page</li>
                <li>4. Upload screenshot with transaction ID</li>
                <li>5. Points added within 24 hours after verification</li>
              </ol>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setPaymentModal({ show: false, package: null })}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                setPaymentModal({ show: false, package: null });
                navigate('/subscription');
              }}
              className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl font-bold"
            >
              Go to Subscription Page
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Purchase Confirmation Modal
  const PurchaseConfirmationModal = () => {
    if (!confirmPurchase) return null;
    
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-rose-500/30 p-8 rounded-3xl max-w-md w-full"
        >
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Confirm Purchase</h3>
            <p className="text-gray-400 mb-4">Are you sure you want to buy this package?</p>
          </div>
          
          <div className="bg-black/50 p-4 rounded-xl mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">{confirmPurchase.label} Package</span>
              <span className="text-2xl font-bold text-rose-500">₹{confirmPurchase.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>You will receive:</span>
              <span className="font-bold text-yellow-500">+{confirmPurchase.points} points</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setConfirmPurchase(null)}
              className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                handlePurchasePoints(confirmPurchase);
                setConfirmPurchase(null);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl font-bold"
            >
              Confirm Purchase
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Premium Features Component
  const PremiumFeaturesModal = () => {
    if (!showPremiumFeatures) return null;
    
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/30 p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl">
                <Crown size={28} />
              </div>
              <h2 className="text-2xl font-bold">Premium Features</h2>
            </div>
            <button 
              onClick={() => setShowPremiumFeatures(false)}
              className="p-2 hover:bg-gray-800 rounded-full"
              aria-label="Close premium features modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Gamepad2 />, title: "Unlimited Tournament Access", desc: "Play in all tournaments without restrictions" },
              { icon: <ShieldCheck />, title: "Priority Support", desc: "24/7 premium support with fast response" },
              { icon: <Zap />, title: "Fast Registration", desc: "Skip queues and get instant registration" },
              { icon: <Award />, title: "Exclusive Badges", desc: "Show off your premium status with special badges" },
              { icon: <Users />, title: "Team Priority", desc: "Your team gets priority in tournaments" },
              { icon: <Sparkle />, title: "VIP Rewards", desc: "Special rewards and bonus points" },
              { icon: <Bell />, title: "Early Notifications", desc: "Get tournament notifications 1 hour early" },
              { icon: <Gem />, title: "Leaderboard Boost", desc: "Extra points multiplier on leaderboard" },
            ].map((feature, idx) => (
              <div key={idx} className="p-4 bg-black/40 border border-yellow-500/20 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    {feature.icon}
                  </div>
                  <h4 className="font-bold">{feature.title}</h4>
                </div>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800">
            <button 
              onClick={() => setShowPremiumFeatures(false)}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl font-bold"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin-reverse delay-300"></div>
              <div className="absolute inset-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin delay-700"></div>
            </div>
            <h3 className="text-xl font-bold mb-2">Loading Your Profile</h3>
            <p className="text-gray-400">Getting everything ready...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 px-4 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-red-900/20 to-rose-900/20 border border-red-500/30 rounded-3xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <p className="text-sm text-gray-500 mb-6">Please try refreshing the page or contact support</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold"
              >
                Reload Page
              </button>
              <button 
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Navbar />

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-rose-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="pt-24 px-4 max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">Manage your account, team, and subscriptions</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExportProfile}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
              aria-label="Export profile data"
            >
              <Download size={16} /> Export Data
            </button>
            <button 
              onClick={handleRefreshProfile}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg"
              aria-label="Refresh profile"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800/50 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-sm shadow-2xl"
        >
          
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
            {/* Profile Photo with Badge Rings */}
            <div className="relative">
              <div className="relative w-40 h-40">
                {/* Premium Ring */}
                {userData?.isPremium && (
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-500/50 animate-spin-slow">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <Crown className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                )}
                
                {/* Photo Container */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 p-1.5">
                  <div className="w-full h-full rounded-full bg-black overflow-hidden border-4 border-gray-900">
                    <img 
                      src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                      className="w-full h-full object-cover"
                      alt={`${formData.displayName}'s profile picture`}
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`;
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Upload Button */}
              <label className="absolute bottom-4 right-4 p-3 bg-rose-500 hover:bg-rose-600 rounded-full cursor-pointer transition-all shadow-lg hover:scale-110">
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
                  aria-label="Upload profile picture"
                />
              </label>
              
              {/* Level Badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                {userData?.level || 1}
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center lg:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                {editMode ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="text-3xl md:text-4xl font-bold bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-3 min-w-[300px] backdrop-blur-sm"
                    placeholder="Enter your name"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-bold">{userData?.displayName || "No Name"}</h1>
                )}
                
                {/* Premium Badge */}
                {userData?.isPremium && (
                  <div className="relative group">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                      <Crown size={16} /> PREMIUM
                    </span>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-3 bg-gray-900 border border-yellow-500/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <p className="text-xs text-yellow-400 font-bold">⭐ PREMIUM MEMBER</p>
                      <p className="text-xs text-gray-400 mt-1">{subscriptionStatus.daysRemaining} days remaining</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Badges Display */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6 badges-container">
                {userBadges.map((badge, idx) => (
                  <div 
                    key={idx}
                    className={`px-3 py-1.5 ${badge.bgColor} border ${badge.borderColor} rounded-full text-xs font-bold flex items-center gap-1.5 ${badge.textColor}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Game UID */}
              <div className="mb-6">
                {editMode ? (
                  <div className="flex items-center gap-2 max-w-md">
                    <Hash size={18} className="text-rose-500" />
                    <input
                      type="text"
                      value={formData.gameUID}
                      onChange={(e) => handleInputChange('gameUID', e.target.value)}
                      className="font-mono bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 flex-1 backdrop-blur-sm"
                      placeholder="Enter your Game UID"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-500 mb-4 justify-center lg:justify-start">
                    <Hash size={18} />
                    <span className="font-mono text-lg">{userData?.gameUID || "NO UID"}</span>
                    {userData?.gameUID && (
                      <button
                        onClick={() => copyToClipboard(userData.gameUID, 'uid')}
                        className="ml-2 p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
                        title="Copy Game UID"
                        aria-label="Copy Game UID"
                      >
                        {copiedField === 'uid' ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                    <span className="text-xs text-gray-500 ml-2">Game UID</span>
                  </div>
                )}
              </div>

              {/* Subscription Status - Enhanced with Progress Bar */}
              <div className="mb-8">
                {subscriptionStatus.isActive ? (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-2xl p-5 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl shadow-lg">
                          <Crown size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-yellow-400 text-lg">⭐ PREMIUM ACTIVE</p>
                          <p className="text-sm text-gray-400">
                            {subscriptionStatus.daysRemaining} days remaining • Renews on {getRenewalDate(userData?.premiumSince)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowPremiumFeatures(true)}
                        className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-bold transition-all"
                        aria-label="View premium features"
                      >
                        View Features
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>Premium Status</span>
                        <span>{subscriptionStatus.daysRemaining}/30 days</span>
                      </div>
                      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(subscriptionStatus.daysRemaining / 30) * 100}%` }}
                          className="h-full bg-gradient-to-r from-yellow-500 to-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : userData?.isPremium ? (
                  <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="p-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl">
                          <Crown size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-red-400 text-lg">⏳ PREMIUM EXPIRED</p>
                          <p className="text-sm text-gray-400">
                            Activated on: {formatDateOnly(userData?.premiumSince)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Redeem 500 points to renew premium
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleRedeemPremium}
                        disabled={(userData?.points || 0) < 500}
                        className={`px-5 py-2.5 rounded-lg text-sm font-bold ${(userData?.points || 0) >= 500 ? 
                          'bg-gradient-to-r from-rose-500 to-pink-500 hover:opacity-90' : 
                          'bg-gray-800 text-gray-500'} transition-all`}
                        aria-label="Renew premium subscription"
                        aria-disabled={(userData?.points || 0) < 500}
                      >
                        Renew Premium
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div className="flex items-center gap-3 mb-3 sm:mb-0">
                        <div className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                          <Shield size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-400 text-lg">🔓 BASIC ACCOUNT</p>
                          <p className="text-sm text-gray-400">
                            Reach 500 points to unlock premium features
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Current Points:</p>
                        <p className="text-2xl font-bold">{userData?.points || 0}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Points System with Premium Options */}
              <div className="max-w-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-400">Warrior Points</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-2xl">{userData?.points || 0}</span>
                    <span className="text-sm text-rose-500 font-bold">pts</span>
                    {userData?.isPremium && (
                      <span className="text-xs text-yellow-500 font-bold">(+10% Premium Bonus)</span>
                    )}
                  </div>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mb-8">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((userData?.points || 0) / 500) * 100, 100)}%` }}
                    className={`h-full ${userData?.isPremium ? 
                      'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500' : 
                      'bg-gradient-to-r from-rose-500 to-purple-600'}`}
                  />
                </div>
                
                {/* Premium Features Button */}
                {userData?.isPremium && (
                  <button
                    onClick={() => setShowPremiumFeatures(true)}
                    className="w-full py-3.5 mb-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gradient-to-r hover:from-yellow-500/30 hover:to-amber-500/30 transition-all group"
                    aria-label="View premium features"
                  >
                    <Sparkle className="text-yellow-500 group-hover:animate-pulse" />
                    <span>View Premium Features</span>
                    <Sparkle className="text-yellow-500 group-hover:animate-pulse" />
                  </button>
                )}
                
                {/* Points Purchase Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  {POINTS_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => confirmAndPurchase(pkg)}
                      disabled={saving}
                      className={`p-3 bg-gradient-to-br ${pkg.color} border border-white/10 rounded-xl hover:scale-105 transition-all disabled:opacity-50 group`}
                      aria-label={`Buy ${pkg.label} package for ₹${pkg.price}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{pkg.icon}</div>
                        <p className="font-bold text-sm mb-1">₹{pkg.price}</p>
                        <p className="text-xs opacity-90">+{pkg.points} pts</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Redeem Premium Button */}
                <button
                  onClick={handleRedeemPremium}
                  disabled={(userData?.points || 0) < 500 || saving}
                  className={`w-full py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                    (userData?.points || 0) >= 500 
                      ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02]' 
                      : 'bg-gray-800 text-gray-500'
                  }`}
                  aria-label="Redeem premium with 500 points"
                  aria-disabled={(userData?.points || 0) < 500}
                >
                  {saving ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (userData?.points || 0) >= 500 ? (
                    <>
                      <Gem size={18} />
                      REDEEM PREMIUM + TOURNAMENT CAP
                      <Gem size={18} />
                    </>
                  ) : (
                    `Need ${500 - (userData?.points || 0)} more points`
                  )}
                </button>
                
                {/* Lock Status Widget */}
                <div className="w-full mt-8">
                  {userData?.lastProfileUpdate ? (
                    isLocked() ? (
                      <div className="p-5 bg-gradient-to-r from-red-900/20 to-rose-900/20 border border-red-500/30 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="p-2.5 bg-red-500/20 rounded-xl">
                              <Lock size={20} className="text-red-500" />
                            </div>
                            <div>
                              <p className="font-bold">Profile Edit Locked</p>
                              <p className="text-sm text-gray-400">
                                You can edit your profile again in <span className="text-white font-bold">{getDaysRemaining()} days</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Last Updated:</p>
                            <p className="text-sm">
                              {formatDateOnly(userData.lastProfileUpdate)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Lock Progress</span>
                            <span>{14 - getDaysRemaining()}/14 days</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${((14 - getDaysRemaining()) / 14) * 100}%` }}
                              className="h-full bg-gradient-to-r from-red-500 to-rose-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <div className="p-2.5 bg-green-500/20 rounded-xl">
                              <CheckCircle size={20} className="text-green-500" />
                            </div>
                            <div>
                              <p className="font-bold">Profile Edit Available</p>
                              <p className="text-sm text-gray-400">
                                You can edit your profile now
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Last Updated:</p>
                            <p className="text-sm">
                              {formatDateOnly(userData.lastProfileUpdate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="p-5 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-500/20 rounded-xl">
                          <Info size={20} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold">First Time Edit</p>
                          <p className="text-sm text-gray-400">
                            Edit your profile for the first time
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end mt-8 pt-8 border-t border-gray-800/50">
            {!editMode ? (
              <button 
                onClick={() => setEditMode(true)} 
                className="px-8 py-3.5 border border-gray-700 hover:border-rose-500 rounded-xl flex items-center gap-3 transition-all hover:bg-gray-800/50 group"
                disabled={isLocked()}
                aria-label="Edit profile"
                aria-disabled={isLocked()}
              >
                {isLocked() ? (
                  <>
                    <Lock size={18} className="text-red-500" /> 
                    <span className="text-red-400">Locked for {getDaysRemaining()} more days</span>
                  </>
                ) : (
                  <>
                    <Edit3 size={18} className="text-rose-500 group-hover:animate-pulse" /> 
                    <span className="font-bold">Edit Profile</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setEditMode(false);
                    localStorage.removeItem('zyro_profile_unsaved');
                    setFormData({
                      displayName: userData?.displayName || "",
                      gameUID: userData?.gameUID || "",
                      teamName: userData?.teamName || "",
                      photoURL: userData?.photoURL || "",
                      teamLogo: userData?.teamLogo || "",
                      teamMembers: userData?.teamMembers || ["", "", "", ""]
                    });
                  }} 
                  className="px-8 py-3.5 border border-gray-700 hover:border-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-all"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile} 
                  disabled={saving}
                  className="px-8 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl font-bold flex items-center gap-3 disabled:opacity-50 hover:scale-[1.02] transition-all"
                  aria-label="Save profile changes"
                >
                  {saving ? (
                    <>
                      <Loader size={18} className="animate-spin" /> 
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} /> 
                      <span>Save Changes</span>
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          
          {/* Team Info & Logo */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl">
                <Users className="text-white" size={22} />
              </div>
              <h2 className="text-2xl font-bold">Team Details</h2>
              {userData?.isPremium && (
                <span className="ml-auto px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                  PREMIUM TEAM
                </span>
              )}
            </div>
            
            {/* Team Logo Upload */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl bg-gray-800/50 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden group">
                    {formData.teamLogo ? (
                      <img 
                        src={formData.teamLogo} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                        alt="Team Logo"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/112/1f2937/ffffff?text=LOGO";
                        }}
                      />
                    ) : (
                      <span className="text-gray-500 text-4xl">⚔️</span>
                    )}
                  </div>
                  <label className="absolute -bottom-3 -right-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-full cursor-pointer transition-all shadow-lg hover:scale-110">
                    {uploading ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, "teamLogo")}
                      accept="image/*"
                      disabled={uploading}
                      aria-label="Upload team logo"
                    />
                  </label>
                </div>
                <div className="flex-1 w-full">
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamName}
                      onChange={(e) => handleInputChange('teamName', e.target.value)}
                      placeholder="Enter Team Name"
                      className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-6 py-4 text-2xl font-bold backdrop-blur-sm"
                    />
                  ) : (
                    <>
                      <h3 className="text-3xl font-bold mb-2">{userData?.teamName || "No Team Name"}</h3>
                      <p className="text-gray-400">Add team logo and name to represent your squad</p>
                      {userData?.isPremium && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-yellow-500">
                          <ShieldCheck size={14} />
                          <span>Premium Team: Priority registration enabled</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Team Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Team Rank</p>
                <p className="text-2xl font-bold">{userData?.rank || "Unranked"}</p>
              </div>
              <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Matches Played</p>
                <p className="text-2xl font-bold">{userData?.totalMatches || 0}</p>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                  <Users className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold">Team Members</h2>
              </div>
              <span className="text-sm text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg">
                {formData.teamMembers.filter(m => m.trim()).length + 1}/5 Slots
              </span>
            </div>

            {/* Team Leader (You) - Premium Style */}
            <div className="mb-6 p-5 bg-gradient-to-r from-gray-800/50 to-black/50 border border-gray-700 rounded-2xl group hover:border-rose-500/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                      <img 
                        src={formData.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser?.uid}`} 
                        className="w-full h-full object-cover" 
                        alt="You" 
                      />
                    </div>
                  </div>
                  {userData?.isPremium && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown size={10} className="text-black" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-lg">{userData?.displayName || "You"}</p>
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-500 rounded-full text-xs font-bold">LEADER</span>
                    {userData?.isPremium && (
                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">PREMIUM</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{userData?.gameUID || "No UID"}</p>
                  {userData?.isPremium && (
                    <div className="flex items-center gap-2 mt-1">
                      <Zap size={12} className="text-yellow-500" />
                      <span className="text-xs text-yellow-500">Premium Benefits Active</span>
                    </div>
                  )}
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <div className="text-2xl font-bold text-rose-500">{userData?.points || 0}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>

            {/* Other Team Members */}
            <div className="space-y-4">
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className={`p-4 rounded-2xl border transition-all group ${
                  editMode ? 'bg-gray-800/30 border-gray-700' : 'bg-black/20 border-gray-800 hover:bg-black/40 hover:border-gray-700'
                }`}>
                  {editMode ? (
                    <input
                      type="text"
                      value={formData.teamMembers[index] || ""}
                      onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                      placeholder={`Member ${index + 1} Name & UID`}
                      className="w-full bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 backdrop-blur-sm disabled:opacity-50"
                      disabled={isLocked()}
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {formData.teamMembers[index] ? (
                          <User size={20} className="text-gray-400" />
                        ) : (
                          <span className="text-2xl">👤</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{formData.teamMembers[index] || `Empty Slot ${index + 1}`}</p>
                        {formData.teamMembers[index] ? (
                          <p className="text-xs text-gray-400">Member</p>
                        ) : (
                          <p className="text-xs text-gray-500">Click edit to add member</p>
                        )}
                      </div>
                      {!formData.teamMembers[index] && (
                        <span className="px-3 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-400">Empty</span>
                      )}
                      {formData.teamMembers[index] && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">Active</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editMode && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Info size={18} className="text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm mb-1">💡 Team Member Tips</p>
                    <p className="text-sm text-gray-400">
                      Enter member names with UID (e.g., "PlayerName#123456789")<br />
                      Premium teams get priority in tournaments
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Achievements Section - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl">
                  <Award className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold">Achievements & Badges</h2>
              </div>
              <span className="px-4 py-2 bg-black/40 border border-gray-800 rounded-xl text-sm">
                {getUserBadges().length} Badges Unlocked
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Premium Achievement */}
              <div className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                userData?.isPremium 
                  ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 shadow-lg shadow-yellow-500/10' 
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}>
                <div className="text-4xl mb-3 text-center">👑</div>
                <p className="font-bold text-sm text-center mb-1">Premium Status</p>
                <p className="text-xs text-gray-400 text-center">Redeem 500 points</p>
                {userData?.isPremium && (
                  <div className="mt-3 text-center">
                    <CheckCircle size={16} className="text-yellow-500 mx-auto" />
                  </div>
                )}
              </div>
              
              {/* Zyro Cap */}
              <div className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                (userData?.points || 0) >= 500 
                  ? 'border-green-500/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5 shadow-lg shadow-green-500/10' 
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}>
                <div className="text-4xl mb-3 text-center">🧢</div>
                <p className="font-bold text-sm text-center mb-1">Zyro Cap</p>
                <p className="text-xs text-gray-400 text-center">500 points</p>
                {(userData?.points || 0) >= 500 && (
                  <div className="mt-3 text-center">
                    <CheckCircle size={16} className="text-green-500 mx-auto" />
                  </div>
                )}
              </div>
              
              {/* Tournament Warrior */}
              <div className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                (userData?.points || 0) >= 150 
                  ? 'border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 shadow-lg shadow-blue-500/10' 
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}>
                <div className="text-4xl mb-3 text-center">⚔️</div>
                <p className="font-bold text-sm text-center mb-1">Tournament Warrior</p>
                <p className="text-xs text-gray-400 text-center">150 points</p>
                {(userData?.points || 0) >= 150 && (
                  <div className="mt-3 text-center">
                    <CheckCircle size={16} className="text-blue-500 mx-auto" />
                  </div>
                )}
              </div>
              
              {/* Early Supporter */}
              <div className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                userData?.createdAt 
                  ? 'border-purple-500/50 bg-gradient-to-br from-purple-500/10 to-pink-500/5 shadow-lg shadow-purple-500/10' 
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}>
                <div className="text-4xl mb-3 text-center">🚀</div>
                <p className="font-bold text-sm text-center mb-1">Early Supporter</p>
                <p className="text-xs text-gray-400 text-center">Join early</p>
                {userData?.createdAt && (
                  <div className="mt-3 text-center">
                    <CheckCircle size={16} className="text-purple-500 mx-auto" />
                  </div>
                )}
              </div>
              
              {/* Team Leader */}
              <div className={`p-5 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${
                userData?.teamName 
                  ? 'border-rose-500/50 bg-gradient-to-br from-rose-500/10 to-pink-500/5 shadow-lg shadow-rose-500/10' 
                  : 'border-gray-700 bg-gray-800/30 opacity-60'
              }`}>
                <div className="text-4xl mb-3 text-center">👥</div>
                <p className="font-bold text-sm text-center mb-1">Team Leader</p>
                <p className="text-xs text-gray-400 text-center">Create a team</p>
                {userData?.teamName && (
                  <div className="mt-3 text-center">
                    <CheckCircle size={16} className="text-rose-500 mx-auto" />
                  </div>
                )}
              </div>
              
              {/* Coming Soon */}
              <div className="p-5 rounded-2xl border border-gray-700 bg-gray-800/30 opacity-60">
                <div className="text-4xl mb-3 text-center">🔒</div>
                <p className="font-bold text-sm text-center mb-1">Coming Soon</p>
                <p className="text-xs text-gray-400 text-center">More rewards</p>
              </div>
            </div>
            
            {/* Progress Summary */}
            <div className="mt-8 pt-6 border-t border-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Total Points</p>
                  <p className="text-2xl font-bold">{userData?.points || 0}</p>
                </div>
                <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Badges Unlocked</p>
                  <p className="text-2xl font-bold">{getUserBadges().length}/6</p>
                </div>
                <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Account Level</p>
                  <p className="text-2xl font-bold">{userData?.level || 1}</p>
                </div>
                <div className="p-4 bg-black/40 border border-gray-800 rounded-xl">
                  <p className="text-sm text-gray-400 mb-1">Next Milestone</p>
                  <p className="text-2xl font-bold">500 pts</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Subscription History Section - Enhanced */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }} 
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-gray-900/90 to-black/90 border border-gray-800/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="p-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                  <CreditCard className="text-white" size={22} />
                </div>
                <h2 className="text-2xl font-bold">Purchase & Subscription History</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-black/40 border border-gray-800 rounded-xl text-sm">
                  {subscriptions.length} total
                </span>
                <button 
                  onClick={() => navigate('/subscription')}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  aria-label="Buy more points packages"
                >
                  Buy More
                </button>
              </div>
            </div>
            
            {subscriptions.length === 0 ? (
              <div className="text-center py-16 bg-black/40 rounded-2xl border border-gray-800">
                <CreditCard className="mx-auto mb-6 text-gray-700" size={64} />
                <p className="text-2xl font-bold text-gray-600 mb-3">No Purchase History</p>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Buy points packages to unlock premium features and join tournaments</p>
                <button 
                  onClick={() => navigate('/subscription')}
                  className="px-10 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  aria-label="Buy points package"
                >
                  Buy Points Package
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {subscriptions.map((sub, index) => (
                    <div key={sub.id || index} className="p-5 bg-black/40 border border-gray-800 rounded-2xl hover:bg-black/60 transition-all group hover:border-gray-700">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                        <div className="mb-4 lg:mb-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <p className="font-bold text-xl">{sub.planName}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              sub.status === 'approved' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                              sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                              sub.status === 'rejected' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                              'bg-gray-500/20 text-gray-500 border border-gray-500/30'
                            }`}>
                              {sub.status?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <DollarSign size={14}/> ₹{sub.amount}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-500"/> {sub.pointsToAdd || 0} points
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14}/> {formatDate(sub.submittedAt)}
                            </span>
                          </div>
                        </div>
                        
                        {sub.approvedAt && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Approved on:</p>
                            <p className="text-sm text-green-500 font-bold">{formatDate(sub.approvedAt)}</p>
                            <p className="text-xs text-gray-500">By: {sub.approvedBy?.split('@')[0] || 'Admin'}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800/50 text-sm">
                        <div className="p-3 bg-black/60 rounded-xl border border-gray-800">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-gray-500">Order ID</p>
                            <button
                              onClick={() => copyToClipboard(sub.orderId, `order-${index}`)}
                              className="p-1 hover:bg-gray-700 rounded"
                              title="Copy Order ID"
                              aria-label="Copy Order ID"
                            >
                              {copiedField === `order-${index}` ? (
                                <Check size={12} className="text-green-500" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                          <p className="font-mono text-xs truncate">{sub.orderId}</p>
                        </div>
                        <div className="p-3 bg-black/60 rounded-xl border border-gray-800">
                          <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                          <p className="font-mono text-xs truncate">{sub.transactionId || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-black/60 rounded-xl border border-gray-800">
                          <p className="text-xs text-gray-500 mb-1">Points Added</p>
                          <p className={`text-lg font-bold ${sub.status === 'approved' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {sub.status === 'approved' ? `+${sub.pointsToAdd || 0}` : 'Pending Approval'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Admin Notes (if any) */}
                      {sub.adminNotes && (
                        <div className="mt-4 p-3 bg-gray-900/50 rounded-xl border border-gray-800">
                          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Info size={12}/> Admin Notes:
                          </p>
                          <p className="text-sm text-gray-300">{sub.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-5 bg-black/40 rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">Total Spent</p>
                      <p className="text-3xl font-bold text-green-500">
                        ₹{subscriptions.reduce((sum, sub) => sum + (parseFloat(sub.amount) || 0), 0)}
                      </p>
                    </div>
                    <div className="text-center p-5 bg-black/40 rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">Approved Points</p>
                      <p className="text-3xl font-bold text-yellow-500">
                        {subscriptions
                          .filter(sub => sub.status === 'approved')
                          .reduce((sum, sub) => sum + (parseInt(sub.pointsToAdd) || 0), 0)}
                      </p>
                    </div>
                    <div className="text-center p-5 bg-black/40 rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">Pending Requests</p>
                      <p className="text-3xl font-bold text-orange-500">
                        {subscriptions.filter(sub => sub.status === 'pending').length}
                      </p>
                    </div>
                    <div className="text-center p-5 bg-black/40 rounded-2xl border border-gray-800">
                      <p className="text-sm text-gray-400 mb-2">Success Rate</p>
                      <p className="text-3xl font-bold text-blue-500">
                        {subscriptions.length > 0 
                          ? `${Math.round((subscriptions.filter(sub => sub.status === 'approved').length / subscriptions.length) * 100)}%` 
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <PaymentInstructionsModal />
      <PurchaseConfirmationModal />
      <PremiumFeaturesModal />

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin-reverse 15s linear infinite;
        }
        
        /* Responsive badges container */
        @media (max-width: 640px) {
          .badges-container {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 10px;
            margin-right: -1rem;
            margin-left: -1rem;
            padding-left: 1rem;
          }
          
          .badges-container > div {
            flex-shrink: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;