import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Swords, Trophy, Users, Zap, Trash2, CheckCircle, Eye, Plus, 
  Edit3, Save, Layers, Bell, Upload, RefreshCw, Ban, X, Map, Skull, 
  Settings, CreditCard, Key, List, MessageSquare, Info, Star, Clock, 
  Send, ChevronRight, Target, ZapOff, UserPlus, History as HistoryIcon,
  Search, Filter, Activity, BarChart3, Database, Image as ImageIcon,
  Crown, Award, Users as TeamIcon, TrendingUp, DollarSign, 
  BarChart, Smartphone, Gamepad2, BookOpen, Shield, Volume2,
  BarChart2, PieChart, LineChart, Download, EyeOff, GitMerge,
  Calendar, Clock3, ExternalLink, Phone, Mail, Home, Lock, Sword,
  Megaphone, Newspaper, Tag, Hash, Globe, Youtube, Camera,
  Link as LinkIcon, Eye as EyeIcon, Heart, Share2, Bookmark,
  TrendingUp as TrendingIcon, Users as UsersIcon, Award as AwardIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { db, auth } from '../firebase';
import { 
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, 
  orderBy, where, serverTimestamp, getDoc, writeBatch, increment,
  limit, startAfter, arrayUnion, arrayRemove, setDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

// 👑 STRICT ADMIN ACCESS LIST
const ADMIN_EMAILS = ["raushanritik30891@gmail.com", "igod61516@gmail.com", "zyro.esports.7@gmail.com"];

const Admin = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  // --- 🛰️ NAVIGATION & GLOBAL LOADING ---
  const [activeSection, setActiveSection] = useState('dashboard'); 
  const [loading, setLoading] = useState(false);
  const [blogVideo, setBlogVideo] = useState(null); 
  const CLOUD_NAME = "dwhttjvop"; // Apna Cloud Name yaha dalein
  const UPLOAD_PRESET = "zyro esports"; // Apna Upload Preset yaha dalein
  // --- 📦 DATA STORAGE ---
  const [matches, setMatches] = useState([]);
  const [pendingSubs, setPendingSubs] = useState([]);
  const [supportMsgs, setSupportMsgs] = useState([]);
  const [leaderboardTeams, setLeaderboardTeams] = useState([]);
  const [top10Teams, setTop10Teams] = useState([]); // ✅ Top 10 only
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalUsers: 0,
    revenue: 0,
    activeTournaments: 0
  });
  
  // ✅ नए states जोड़े
  const [tickers, setTickers] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [blogForm, setBlogForm] = useState({ 
    title: '', 
    excerpt: '',
    category: 'News', 
    content: '',
    imageUrl: '',
    youtubeUrl: '',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    slug: '',
    isFeatured: false,
    isPublished: true,
    scheduleDate: '',
    readTime: 5,
    author: ''
  });
  const [blogImage, setBlogImage] = useState(null);
  const [newTag, setNewTag] = useState('');

  // --- ⚔️ MATCH FORM STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [matchForm, setMatchForm] = useState({
    title: '',
    category: 'BR',
    type: 'Squad',
    map: 'Bermuda',
    matchCount: '1 Match',
    time: '',
    totalSlots: 48,
    entryFee: '0',
    prizePool: '0',
    rank1: '0',
    rank2: '0',
    rank3: '0',
    perKill: '0',
    headshotOnly: false,
    status: 'OPEN',
    featured: false
  });

  // --- 🛡️ MODAL & AI STATES ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState(null);
  const [manualModal, setManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ name: "", kills: "", points: "" });
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [lbFilter, setLbFilter] = useState({ lobby: "35", type: "WEEKLY" }); // ✅ Default 35
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState([]);

  // Blog categories
  const blogCategories = [
    'Tournament News',
    'Gaming Tips', 
    'Player Interviews',
    'Community',
    'Announcements',
    'Strategy Guides',
    'Event Recaps',
    'Technical Updates',
    'Winner Spotlight',
    'Esports Analysis'
  ];

  // Popular tags
  const popularTags = [
    'FreeFire',
    'BattleRoyale',
    'Esports',
    'GamingCommunity',
    'Tournament',
    'Winners',
    'Strategy',
    'TipsAndTricks',
    'ZyroEsports',
    'GamingTips'
  ];

  // ==========================================
  // 1. SECURITY & SYNC ENGINE
  // ==========================================
  useEffect(() => {
    const checkAdmin = auth.onAuthStateChanged((user) => {
      if (user && ADMIN_EMAILS.includes(user.email.toLowerCase().trim())) {
        fetchAllData();
        fetchDashboardStats();
      } else {
        addNotification('error', "🚫 UNAUTHORIZED ACCESS DETECTED");
        navigate('/'); 
      }
    });
    return () => checkAdmin();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        mSnap, sSnap, msgSnap, hSnap, uSnap, allUSnap
      ] = await Promise.all([
        getDocs(query(collection(db, "matches"), orderBy("timestamp", "desc"))),
        getDocs(query(collection(db, "subscriptions"), where("status", "==", "pending"))),
        getDocs(query(collection(db, "contact_messages"), orderBy("timestamp", "desc"))),
        getDocs(query(collection(db, "match_history"), orderBy("timestamp", "desc"))),
        getDocs(query(collection(db, "users"), where("isPremium", "==", true))),
        getDocs(query(collection(db, "users")))
      ]);

      setMatches(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPendingSubs(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSupportMsgs(msgSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setMatchHistory(hSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPremiumUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setAllUsers(allUSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      // ✅ टिकर और ब्लॉग डेटा fetch करें
      await loadTicker();
      await loadBlogs();
      
      addNotification('success', '✅ Database Synced Successfully');
    } catch (err) { 
      console.error("Critical Sync Failure:", err);
      addNotification('error', "❌ Database Sync Error");
    }
    setLoading(false);
  };

  const loadTicker = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "ticker"));
      if (docSnap.exists()) {
        setTickers(docSnap.data().messages || []);
      } else {
        // पहली बार के लिए डिफ़ॉल्ट टिकर बनाएँ
        await setDoc(doc(db, "settings", "ticker"), { 
          messages: ["🎮 Welcome to Zyro Esports!", "⚡ Join our tournaments now!", "🏆 Daily tournaments with big prize pools!"] 
        });
        setTickers(["🎮 Welcome to Zyro Esports!", "⚡ Join our tournaments now!", "🏆 Daily tournaments with big prize pools!"]);
      }
    } catch (err) { 
      console.log("Ticker init error", err);
    }
  };

  const loadBlogs = async () => {
    try {
      const q = query(collection(db, "blogs"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setBlogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { 
      console.log("Blogs load error", err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [matchesSnap, usersSnap, subsSnap] = await Promise.all([
        getDocs(collection(db, "matches")),
        getDocs(collection(db, "users")),
        getDocs(query(collection(db, "subscriptions"), where("status", "==", "Approved")))
      ]);

      const totalRevenue = subsSnap.docs.reduce((sum, doc) => sum + (parseFloat(doc.data().amount) || 0), 0);
      const activeMatches = matchesSnap.docs.filter(doc => doc.data().status === 'OPEN').length;

      setStats({
        totalMatches: matchesSnap.size,
        totalUsers: usersSnap.size,
        revenue: totalRevenue,
        activeTournaments: activeMatches
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  const syncLeaderboard = async () => {
    try {
      const q = query(
        collection(db, "leaderboard"), 
        where("lobby", "==", lbFilter.lobby), 
        where("type", "==", lbFilter.type), 
        orderBy("points", "desc"),
        orderBy("kills", "desc")
      );
      const snap = await getDocs(q);
      const allTeams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLeaderboardTeams(allTeams);
      // ✅ Only top 10 teams
      setTop10Teams(allTeams.slice(0, 10));
    } catch (error) {
      console.error("Leaderboard sync error:", error);
      addNotification('error', "❌ Leaderboard Sync Failed");
    }
  };

  const fetchHistory = async () => {
    try {
      const q = query(collection(db, "match_history"), orderBy("timestamp", "desc"), limit(20));
      const snap = await getDocs(q);
      setMatchHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  useEffect(() => {
    if (activeSection === 'leader') {
      syncLeaderboard();
      fetchHistory();
    }
  }, [activeSection, lbFilter]);

  // ==========================================
  // 2. TICKER MANAGEMENT FUNCTIONS
  // ==========================================
  const handleAddTicker = async () => {
    if(!newTicker.trim()) {
      return addNotification('error', "⚠️ Enter ticker text");
    }
    
    try {
      const tickerRef = doc(db, "settings", "ticker");
      const tickerSnap = await getDoc(tickerRef);
      
      if (tickerSnap.exists()) {
        await updateDoc(tickerRef, { 
          messages: arrayUnion(newTicker.trim()) 
        });
      } else {
        await setDoc(tickerRef, { 
          messages: [newTicker.trim()] 
        });
      }
      
      // Update local state
      const updatedSnap = await getDoc(tickerRef);
      if(updatedSnap.exists()) {
        setTickers(updatedSnap.data().messages);
      }
      
      setNewTicker("");
      addNotification('success', "✅ Ticker added successfully!");
    } catch(err) { 
      console.error("Ticker add error:", err);
      addNotification('error', "❌ Failed to add ticker"); 
    }
  };

  const handleRemoveTicker = async (msg) => {
    try {
      await updateDoc(doc(db, "settings", "ticker"), { 
        messages: arrayRemove(msg) 
      });
      
      // Update local state
      const snap = await getDoc(doc(db, "settings", "ticker"));
      if(snap.exists()) {
        setTickers(snap.data().messages);
      }
      
      addNotification('success', "🗑️ Ticker removed successfully");
    } catch(err) { 
      console.error("Ticker remove error:", err);
      addNotification('error', "❌ Failed to remove ticker"); 
    }
  };

  const handleClearAllTickers = async () => {
    if(!window.confirm("Are you sure you want to clear all ticker messages?")) return;
    
    try {
      await setDoc(doc(db, "settings", "ticker"), { 
        messages: [] 
      });
      
      setTickers([]);
      addNotification('success', "🧹 All tickers cleared");
    } catch(err) { 
      console.error("Clear tickers error:", err);
      addNotification('error', "❌ Failed to clear tickers"); 
    }
  };

  // ==========================================
  // 3. BLOG MANAGEMENT FUNCTIONS
  // ==========================================
  const handleAddTag = (tag) => {
    if (tag.trim() && !blogForm.tags.includes(tag.trim())) {
      setBlogForm({
        ...blogForm,
        tags: [...blogForm.tags, tag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setBlogForm({
      ...blogForm,
      tags: blogForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);
  };
  const uploadToCloudinary = async (file, resourceType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw error;
    }
  };
  // ✅ ADD THIS MISSING FUNCTION
  const handleResetBlogForm = () => {
    setBlogForm({ 
      title: '', 
      excerpt: '', 
      category: 'News', 
      content: '', 
      imageUrl: '', 
      youtubeUrl: '', 
      tags: [], 
      metaTitle: '', 
      metaDescription: '', 
      slug: '', 
      isFeatured: false, 
      isPublished: true, 
      scheduleDate: '', 
      readTime: 5, 
      author: '' 
    });
    setBlogImage(null);
    setBlogVideo(null); // Clear video state
    setNewTag('');
  };



// ✅ 3. REPLACE THIS FUNCTION
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      return addNotification('error', "⚠️ Please fill title and content");
    }

    setLoading(true);
    
    try {
      let finalImageUrl = blogForm.imageUrl;
      let finalVideoUrl = blogForm.youtubeUrl;

      // Upload Image logic
      if (blogImage) {
        addNotification('info', "☁️ Uploading image...");
        finalImageUrl = await uploadToCloudinary(blogImage, 'image');
      }

      // Upload Video logic
      if (blogVideo) {
        addNotification('info', "🎥 Uploading video (please wait)...");
        finalVideoUrl = await uploadToCloudinary(blogVideo, 'video');
      }

      const excerpt = blogForm.excerpt || blogForm.content.substring(0, 150) + '...';
      const slug = blogForm.slug || generateSlug(blogForm.title);

      const blogData = {
        title: blogForm.title.trim(),
        excerpt: excerpt,
        content: blogForm.content.trim(),
        category: blogForm.category,
        tags: blogForm.tags,
        image: finalImageUrl,
        youtubeUrl: finalVideoUrl, // Video URL yaha save hoga
        metaTitle: blogForm.metaTitle || blogForm.title,
        metaDescription: blogForm.metaDescription || excerpt,
        slug: slug,
        isFeatured: blogForm.isFeatured,
        isPublished: blogForm.isPublished,
        scheduleDate: blogForm.scheduleDate || null,
        readTime: blogForm.readTime,
        author: blogForm.author || auth.currentUser?.email,
        timestamp: blogForm.scheduleDate ? new Date(blogForm.scheduleDate) : serverTimestamp(),
        publishedAt: blogForm.scheduleDate ? null : serverTimestamp(),
        views: 0,
        likes: 0,
        comments: [],
        shares: 0
      };

      if (blogForm.id) {
         await updateDoc(doc(db, "blogs", blogForm.id), blogData);
         addNotification('success', "✅ Blog Updated Successfully!");
      } else {
         await addDoc(collection(db, "blogs"), blogData);
         addNotification('success', "📰 Blog Published Successfully!");
      }

      handleResetBlogForm();
      await loadBlogs();
      
    } catch(err) { 
      console.error("Blog publish error:", err);
      addNotification('error', "❌ Failed to publish (Check console)"); 
    }
    setLoading(false);
  };
  const handleDeleteBlog = async (id) => {
    if(!window.confirm("Are you sure you want to delete this blog post?")) return;
    
    try {
      await deleteDoc(doc(db, "blogs", id));
      addNotification('success', "🗑️ Blog deleted successfully");
      
      // Refresh blogs list
      await loadBlogs();
    } catch(err) { 
      console.error("Blog delete error:", err);
      addNotification('error', "❌ Failed to delete blog"); 
    }
  };

  const handleEditBlog = (blog) => {
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt || '',
      category: blog.category || 'News',
      content: blog.content,
      imageUrl: blog.image || '',
      youtubeUrl: blog.youtubeUrl || '',
      tags: blog.tags || [],
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      slug: blog.slug || '',
      isFeatured: blog.isFeatured || false,
      isPublished: blog.isPublished !== false,
      scheduleDate: blog.scheduleDate || '',
      readTime: blog.readTime || 5,
      author: blog.author || ''
    });
    setActiveSection('blog');
    window.scrollTo(0, 0);
  };

{/* IMAGE UPLOAD BOX */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Cover Image</label>
                          <div className="relative">
                            <input 
                              type="file"
                              onChange={e => setBlogImage(e.target.files[0])}
                              className="hidden"
                              id="blogImage"
                              accept="image/*"
                            />
                            <label htmlFor="blogImage" className="cursor-pointer block">
                              <div className={`bg-black/60 border border-dashed ${blogImage ? 'border-green-500' : 'border-gray-800'} rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all min-h-[100px] flex flex-col items-center justify-center`}>
                                {blogImage ? (
                                  <span className="text-green-400 text-sm flex items-center gap-2">
                                    <CheckCircle size={20}/> {blogImage.name}
                                  </span>
                                ) : blogForm.imageUrl ? (
                                  <div className="text-center">
                                    <img src={blogForm.imageUrl} alt="Preview" className="h-20 w-auto mx-auto rounded mb-2 object-cover"/>
                                    <span className="text-xs text-green-400">Current Image Set</span>
                                  </div>
                                ) : (
                                  <>
                                    <ImageIcon size={24} className="text-gray-500 mb-2"/>
                                    <span className="text-gray-500 text-sm">Click to upload Image</span>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {/* Fallback URL Input */}
                          <input 
                            type="text"
                            placeholder="Or paste Image URL"
                            className="mt-2 w-full bg-black/60 border border-gray-800 p-2 rounded-lg text-sm text-white focus:border-cyan-500 transition-all"
                            value={blogForm.imageUrl}
                            onChange={e => setBlogForm({...blogForm, imageUrl: e.target.value})}
                          />
                        </div>

                        {/* VIDEO UPLOAD BOX */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Video (Upload or YouTube)</label>
                          <div className="relative">
                            <input 
                              type="file"
                              onChange={e => setBlogVideo(e.target.files[0])}
                              className="hidden"
                              id="blogVideo"
                              accept="video/*"
                            />
                            <label htmlFor="blogVideo" className="cursor-pointer block">
                              <div className={`bg-black/60 border border-dashed ${blogVideo ? 'border-green-500' : 'border-gray-800'} rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all min-h-[100px] flex flex-col items-center justify-center`}>
                                {blogVideo ? (
                                  <span className="text-green-400 text-sm flex items-center gap-2">
                                    <CheckCircle size={20}/> {blogVideo.name}
                                  </span>
                                ) : blogForm.youtubeUrl ? (
                                   <span className="text-blue-400 text-sm flex items-center gap-2">
                                    <LinkIcon size={20}/> Video Link Set
                                  </span>
                                ) : (
                                  <>
                                    <Youtube size={24} className="text-gray-500 mb-2"/>
                                    <span className="text-gray-500 text-sm">Click to upload Video</span>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {/* Fallback YouTube URL Input */}
                          <input 
                            type="text"
                            placeholder="Or paste YouTube/Video URL"
                            className="mt-2 w-full bg-black/60 border border-gray-800 p-2 rounded-lg text-sm text-white focus:border-cyan-500 transition-all"
                            value={blogForm.youtubeUrl}
                            onChange={e => setBlogForm({...blogForm, youtubeUrl: e.target.value})}
                          />
                        </div>

  const handleToggleBlogStatus = async (blogId, currentStatus) => {
    try {
      await updateDoc(doc(db, "blogs", blogId), { 
        isPublished: !currentStatus,
        publishedAt: !currentStatus ? serverTimestamp() : null
      });
      addNotification('success', `✅ Blog ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      await loadBlogs();
    } catch(err) {
      addNotification('error', "❌ Failed to update blog status");
    }
  };

  // ==========================================
  // 4. AI VISION SCAN (GEMINI 2.0)
  // ==========================================
  const handleAIScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScanning(true);
    setScanStatus("🔄 Processing Image...");

    try {
      // Fallback to manual modal since AI is not configured
      setScanning(false);
      setManualModal(true);
      addNotification('info', "🤖 AI scanning coming soon! Please add teams manually.");
      
    } catch (error) {
      console.error("❌ AI Scan Error:", error);
      addNotification('error', "❌ AI Scan Failed. Please try manual entry.");
      setManualModal(true);
    } finally {
      setScanning(false);
      setScanStatus("");
      if (e.target) e.target.value = '';
    }
  };

  // ==========================================
  // 5. DATABASE SAVE FUNCTION
  // ==========================================
  const saveTeamsToDatabase = async (teams, source = 'GEMINI_2.0') => {
    const matchId = `${source}-${Date.now()}`;
    const batch = writeBatch(db);

    // 1. Purana data delete karo (Sirf current Lobby aur Type ka)
    const clearQ = query(
      collection(db, "leaderboard"), 
      where("lobby", "==", lbFilter.lobby), 
      where("type", "==", lbFilter.type)
    );
    
    const existingSnap = await getDocs(clearQ);
    existingSnap.docs.forEach(doc => batch.delete(doc.ref));

    // 2. Naya data add karo
    teams.forEach((team, index) => {
      const docRef = doc(collection(db, "leaderboard"));
      batch.set(docRef, {
        name: team.name,
        kills: team.kills,
        points: team.points,
        wins: team.wins || 0,
        matchPoints: team.matchPoints || 0,
        rank: team.rank || index + 1,
        lobby: lbFilter.lobby,
        type: lbFilter.type,
        matchId: matchId,
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        source: source,
        addedBy: auth.currentUser?.email,
        status: 'ACTIVE'
      });
    });

    // 3. Match History Update
    const historyRef = doc(db, "match_history", matchId);
    batch.set(historyRef, {
      matchId,
      lobby: lbFilter.lobby,
      type: lbFilter.type,
      teamCount: teams.length,
      timestamp: serverTimestamp(),
      source: source,
      admin: auth.currentUser?.email,
      status: 'COMPLETED'
    });

    await batch.commit();
    
    // 4. UI Refresh
    syncLeaderboard();
    fetchHistory();
  };

  // ==========================================
  // 6. MANUAL ENTRY SYSTEM
  // ==========================================
  const handleManualLeaderboard = async () => {
    if(!manualForm.name.trim()) return addNotification('error', "⚠️ Enter team name");
    
    // Validate points calculation
    const kills = Number(manualForm.kills) || 0;
    const points = Number(manualForm.points) || (kills * 10);
    
    try {
      await addDoc(collection(db, "leaderboard"), {
        name: manualForm.name.trim(),
        kills: kills,
        points: points,
        lobby: lbFilter.lobby,
        type: lbFilter.type,
        matchId: `MANUAL-${Date.now()}`,
        updatedAt: serverTimestamp(),
        timestamp: serverTimestamp(),
        source: 'MANUAL',
        addedBy: auth.currentUser?.email
      });
      
      setManualModal(false);
      setManualForm({ name: "", kills: "", points: "" });
      syncLeaderboard();
      addNotification('success', `✅ Team "${manualForm.name}" added to Lobby ${lbFilter.lobby}`);
    } catch (e) { 
      console.error(e);
      addNotification('error', "❌ Entry Failed"); 
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTeams.length === 0) return addNotification('error', "⚠️ Select teams to delete");
    
    if (!window.confirm(`Delete ${selectedTeams.length} selected teams?`)) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      selectedTeams.forEach(teamId => {
        batch.delete(doc(db, "leaderboard", teamId));
      });
      await batch.commit();
      
      addNotification('success', `🗑️ ${selectedTeams.length} teams deleted`);
      setSelectedTeams([]);
      syncLeaderboard();
    } catch (error) {
      addNotification('error', "❌ Bulk delete failed");
    }
    setLoading(false);
  };

  const handleSelectTeam = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTeams.length === top10Teams.length) {
      setSelectedTeams([]);
    } else {
      setSelectedTeams(top10Teams.map(t => t.id));
    }
  };

  // ==========================================
  // 7. MATCH MANAGEMENT
  // ==========================================
  const handleCategoryChange = (val) => {
    setMatchForm({
      ...matchForm,
      category: val,
      type: val === 'CS' ? '4v4' : 'Squad',
      totalSlots: val === 'CS' ? 8 : 48,
      perKill: val === 'CS' ? '5' : '10'
    });
  };

  const handleMatchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form
    if (!matchForm.title || !matchForm.time) {
      addNotification('error', "⚠️ Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const finalData = { 
        ...matchForm, 
        timestamp: serverTimestamp(),
        createdBy: auth.currentUser?.email,
        filledSlots: 0,
        slotList: [],
        views: 0,
        registrations: 0
      };
      
      if (isEditing) {
        await updateDoc(doc(db, "matches", editId), finalData);
        addNotification('success', "✅ Tournament Updated Successfully!");
      } else {
        await addDoc(collection(db, "matches"), finalData);
        addNotification('success', "🚀 Tournament Created Successfully!");
      }
      
      resetMatchForm();
      fetchAllData();
      fetchDashboardStats();
      setActiveSection('manage');
      
    } catch (err) { 
      addNotification('error', "❌ Internal Server Error"); 
    }
    setLoading(false);
  };

  const resetMatchForm = () => {
    setIsEditing(false); 
    setEditId(null);
    setMatchForm({
      title: '', category: 'BR', type: 'Squad', map: 'Bermuda', matchCount: '1 Match',
      time: '', totalSlots: 48, entryFee: '0', prizePool: '0',
      rank1: '0', rank2: '0', rank3: '0', perKill: '10', 
      headshotOnly: false, status: 'OPEN', featured: false
    });
  };

  const handleEditInit = (match) => {
    setMatchForm(match);
    setIsEditing(true);
    setEditId(match.id);
    setActiveSection('create');
    window.scrollTo(0, 0);
  };

  const handleDeleteConfirmed = async () => {
    if(!matchToDelete) return;
    try {
      await deleteDoc(doc(db, "matches", matchToDelete.id));
      addNotification('success', "🗑️ Match Deleted Successfully");
      setShowDeleteModal(false);
      fetchAllData();
      fetchDashboardStats();
    } catch (err) { addNotification('error', "❌ Deletion Failed"); }
  };

  const toggleMatchStatus = async (matchId, currentStatus) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      await updateDoc(doc(db, "matches", matchId), { status: newStatus });
      addNotification('success', `✅ Match status changed to ${newStatus}`);
      fetchAllData();
    } catch (error) {
      addNotification('error', "❌ Status update failed");
    }
  };

  // ==========================================
  // 8. FINANCIAL & USER MANAGEMENT
  // ==========================================
  const handleAuthorizePayment = async (sub) => {
    if(!window.confirm(`Add ${sub.pointsToAdd} Points to ${sub.userName}?`)) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, "users", sub.userId);
      
      // Current points fetch करें
      const userSnap = await getDoc(userRef);
      const currentUserData = userSnap.exists() ? userSnap.data() : {};
      const currentPoints = currentUserData.points || 0;
      const newPoints = currentPoints + Number(sub.pointsToAdd);
      
      // ✅ Check if user is redeeming premium (500 points)
      const isPremiumRedemption = sub.pointsToAdd >= 500 || newPoints >= 500;
      
      const updateData = {
        points: newPoints,
        lastPointsAdded: serverTimestamp(),
        lastPurchaseId: sub.orderId,
      };
      
      // ✅ Set premiumSince if this is a premium redemption
      if (isPremiumRedemption && !currentUserData.isPremium) {
        updateData.isPremium = true;
        updateData.premiumSince = serverTimestamp();
        updateData.lastRedemption = serverTimestamp();
      } else if (isPremiumRedemption) {
        updateData.isPremium = true;
      }
      
      // Points update करें
      await updateDoc(userRef, updateData);
      
      // ✅ IMPORTANT: Subscription status update करें
      await updateDoc(doc(db, "subscriptions", sub.id), { 
        status: "approved", 
        approvedBy: auth.currentUser.email,
        approvedAt: serverTimestamp(),
        pointsAdded: sub.pointsToAdd,
        finalPoints: newPoints,
        adminNotes: `Points added successfully. ${isPremiumRedemption ? 'Premium activated/updated.' : ''}`
      });
      
      addNotification('success', `✅ ${sub.pointsToAdd} points added to ${sub.userName}! ${isPremiumRedemption ? 'Premium activated!' : ''}`);
      fetchAllData();
      
    } catch (err) { 
      console.error("Points addition error:", err);
      addNotification('error', "❌ Failed to add points"); 
    }
    setLoading(false);
  };

  const handleDeclinePayment = async (sub) => {
    const reason = prompt("Reason for rejection:", "Invalid Payment Screenshot");
    if (!reason) return;
    
    await updateDoc(doc(db, "subscriptions", sub.id), { 
      status: "Rejected", 
      reason,
      reviewedBy: auth.currentUser.email,
      reviewedAt: serverTimestamp()
    });
    addNotification('warning', "❌ Payment Request Rejected");
    fetchAllData();
  };

  const handleUserAction = async (userId, action) => {
    if (action === 'ban') {
      if (!window.confirm("Ban this user?")) return;
      await updateDoc(doc(db, "users", userId), { isBanned: true });
      addNotification('warning', "🚫 User Banned");
    } else if (action === 'unban') {
      await updateDoc(doc(db, "users", userId), { isBanned: false });
      addNotification('success', "✅ User Unbanned");
    } else if (action === 'reset') {
      await updateDoc(doc(db, "users", userId), { points: 0 });
      addNotification('info', "🔄 User Points Reset");
    }
    fetchAllData();
  };

  // ==========================================
  // 9. LEADERBOARD FUNCTIONS
  // ==========================================
  const handleRevertMatch = async (matchId) => {
    if (!window.confirm("Are you sure you want to revert this match? This will delete all associated leaderboard entries.")) return;
    
    setLoading(true);
    try {
      // Delete leaderboard entries for this match
      const q = query(
        collection(db, "leaderboard"), 
        where("matchId", "==", matchId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete match history
      await deleteDoc(doc(db, "match_history", matchId));
      
      addNotification('success', `✅ Match ${matchId} reverted successfully`);
      fetchHistory();
      syncLeaderboard();
    } catch (error) {
      console.error("Revert error:", error);
      addNotification('error', "❌ Failed to revert match");
    }
    setLoading(false);
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Delete this team from leaderboard?")) return;
    
    try {
      await deleteDoc(doc(db, "leaderboard", teamId));
      addNotification('success', "✅ Team deleted");
      syncLeaderboard();
    } catch (error) {
      addNotification('error', "❌ Failed to delete team");
    }
  };

  // ==========================================
  // 10. EXPORT & BACKUP FUNCTIONS
  // ==========================================
  const exportData = (data, filename) => {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addNotification('success', `📥 ${filename} exported successfully`);
    } catch (error) {
      addNotification('error', "❌ Export failed");
    }
  };

  // ==========================================
  // 11. RENDERING SYSTEM
  // ==========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans pb-20 overflow-x-hidden">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="pt-24 px-4 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* --- 🚀 ENHANCED COMMAND SIDEBAR --- */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ x: -50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="bg-gradient-to-b from-gray-900/90 to-black/90 p-6 rounded-3xl border border-rose-500/30 backdrop-blur-lg sticky top-28 shadow-2xl shadow-rose-500/10"
          >
            <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-800">
                <ShieldCheck className="text-rose-500 animate-pulse" size={32}/>
                <div>
                  <h2 className="font-bold italic text-xl uppercase tracking-tighter bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                    CONTROL PANEL
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-1">Super Admin Access</p>
                </div>
            </div>
            
            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'DASHBOARD', icon: <BarChart2 size={18}/>, color: 'from-blue-500 to-cyan-500' },
                { id: 'manage', label: 'TOURNAMENTS', icon: <Gamepad2 size={18}/>, color: 'from-green-500 to-emerald-500', badge: matches.length },
                { id: 'create', label: 'CREATE', icon: <Plus size={18}/>, color: 'from-purple-500 to-violet-500' },
                { id: 'payments', label: 'FINANCE', icon: <DollarSign size={18}/>, color: 'from-yellow-500 to-amber-500', badge: pendingSubs.length },
                { id: 'support', label: 'SUPPORT', icon: <MessageSquare size={18}/>, color: 'from-pink-500 to-rose-500', badge: supportMsgs.length },
                { id: 'users', label: 'USERS', icon: <Users size={18}/>, color: 'from-indigo-500 to-blue-500', badge: allUsers.length },
                { id: 'leader', label: 'LEADERBOARD', icon: <Trophy size={18}/>, color: 'from-orange-500 to-red-500' },
                // ✅ नए टैब्स जोड़े
                { id: 'ticker', label: 'TICKER', icon: <Megaphone size={18}/>, color: 'from-purple-500 to-violet-500', badge: tickers.length },
                { id: 'blog', label: 'BLOG CMS', icon: <BookOpen size={18}/>, color: 'from-cyan-500 to-blue-500', badge: blogs.length },
                { id: 'history', label: 'LOGS', icon: <HistoryIcon size={18}/>, color: 'from-gray-500 to-gray-700' },
              ].map(tab => (
                <motion.button 
                  key={tab.id} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(tab.id)} 
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all relative overflow-hidden group ${activeSection === tab.id ? 'shadow-lg' : 'hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${tab.color} ${activeSection === tab.id ? 'shadow-lg' : 'opacity-80 group-hover:opacity-100'}`}>
                      {tab.icon}
                    </div>
                    <span className={activeSection === tab.id ? 'text-white font-black' : 'text-gray-400 group-hover:text-white'}>
                      {tab.label}
                    </span>
                  </div>
                  {tab.badge > 0 && (
                    <span className="relative z-10 bg-white text-black px-2 py-1 rounded-lg text-[9px] font-black animate-pulse">
                      {tab.badge}
                    </span>
                  )}
                  {activeSection === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border-r-2 border-rose-500"
                    />
                  )}
                </motion.button>
              ))}
            </nav>
            
            <div className="mt-10 pt-6 border-t border-gray-800 space-y-3">
              <button 
                onClick={() => navigate('/leaderboard')} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase text-gray-400 hover:text-white bg-white/5 border border-gray-800 hover:border-rose-500/30 transition-all group"
              >
                <Eye size={16}/> View Leaderboard
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase text-gray-400 hover:text-white bg-white/5 border border-gray-800 hover:border-blue-500/30 transition-all group"
              >
                <Home size={16}/> Homepage
              </button>
              <button 
                onClick={() => auth.signOut().then(() => navigate('/login'))} 
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase text-gray-400 hover:text-white bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all group"
              >
                <Lock size={16}/> Logout
              </button>
            </div>
          </motion.div>
        </div>

        {/* --- 📟 MAIN MISSION CONTROL --- */}
        <div className="lg:col-span-10">
          <AnimatePresence mode="wait">
            
            {/* SECTION: DASHBOARD */}
            {activeSection === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">Welcome back, Commander! Here's your overview.</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => fetchAllData()} 
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      <RefreshCw size={16}/> Refresh
                    </button>
                    <button 
                      onClick={() => exportData({ matches, users: allUsers, leaderboard: top10Teams }, 'backup')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <Download size={16}/> Backup
                    </button>
                  </div>
                </div>

                {/* STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Tournaments', value: stats.totalMatches, icon: <Gamepad2/>, color: 'from-green-500 to-emerald-500', change: '+12%' },
                    { label: 'Registered Users', value: stats.totalUsers, icon: <Users/>, color: 'from-blue-500 to-cyan-500', change: '+8%' },
                    { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: <DollarSign/>, color: 'from-yellow-500 to-amber-500', change: '+23%' },
                    { label: 'Active Now', value: stats.activeTournaments, icon: <Activity/>, color: 'from-rose-500 to-pink-500', change: '+5%' },
                  ].map((stat, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-gradient-to-br from-gray-900/80 to-black/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm hover:border-gray-700 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded">
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold mb-2">{stat.value}</h3>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <div className="h-1 w-full bg-gray-800 mt-4 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${stat.color} w-3/4`}></div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* QUICK ACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-gray-900/80 to-black/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Zap className="text-yellow-500"/> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'New Tournament', icon: <Plus/>, action: () => setActiveSection('create'), color: 'bg-gradient-to-r from-purple-600 to-pink-600' },
                        { label: 'AI Upload', icon: <ImageIcon/>, action: () => document.getElementById('ai-upload')?.click(), color: 'bg-gradient-to-r from-yellow-600 to-orange-600' },
                        { label: 'View Payments', icon: <DollarSign/>, action: () => setActiveSection('payments'), color: 'bg-gradient-to-r from-green-600 to-emerald-600' },
                        { label: 'User Stats', icon: <BarChart/>, action: () => setActiveSection('users'), color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
                        { label: 'Manage Ticker', icon: <Megaphone/>, action: () => setActiveSection('ticker'), color: 'bg-gradient-to-r from-purple-600 to-violet-600' },
                        { label: 'Blog CMS', icon: <BookOpen/>, action: () => setActiveSection('blog'), color: 'bg-gradient-to-r from-cyan-600 to-blue-600' },
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={action.action}
                          className={`${action.color} p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-all`}
                        >
                          {action.icon}
                          <span className="text-xs font-bold">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-900/80 to-black/80 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <HistoryIcon className="text-blue-500"/> Recent Activity
                    </h3>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {matchHistory.slice(0, 5).map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="text-sm font-medium">Lobby {log.lobby} • {log.type}</p>
                            <p className="text-xs text-gray-500">{log.teamCount} teams added</p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(log.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: TICKER MANAGEMENT */}
            {activeSection === 'ticker' && (
              <motion.div key="ticker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-purple-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-violet-500 bg-clip-text text-transparent">
                        LIVE TICKER MANAGER
                      </h2>
                      <p className="text-gray-400 mt-2">Manage scrolling announcements for homepage</p>
                    </div>
                    <span className="px-4 py-2 bg-purple-500/20 text-purple-500 rounded-xl font-bold">
                      {tickers.length} Messages
                    </span>
                  </div>

                  {/* Add Ticker Form */}
                  <div className="mb-10">
                    <div className="flex gap-3 mb-6">
                      <input 
                        type="text"
                        placeholder="Enter new ticker message (e.g., 🎮 New Tournament Starting Soon!)"
                        className="flex-1 bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-purple-500 transition-all"
                        value={newTicker}
                        onChange={e => setNewTicker(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTicker()}
                      />
                      <button 
                        onClick={handleAddTicker}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Plus size={20}/> ADD
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Current Ticker Messages</h3>
                      {tickers.length > 0 && (
                        <button 
                          onClick={handleClearAllTickers}
                          className="px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                        >
                          <Trash2 size={16}/> Clear All
                        </button>
                      )}
                    </div>
                    
                    {/* Ticker List */}
                    <div className="space-y-3">
                      {tickers.length === 0 ? (
                        <div className="text-center py-12 bg-black/40 rounded-2xl border border-gray-800">
                          <Megaphone className="mx-auto mb-4 text-gray-700" size={48}/>
                          <p className="text-gray-500">No ticker messages yet</p>
                          <p className="text-sm text-gray-600 mt-2">Add your first ticker message above</p>
                        </div>
                      ) : tickers.map((msg, idx) => (
                        <div key={idx} className="bg-black/40 p-4 rounded-xl border border-gray-800 flex justify-between items-center group hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-300">{msg}</span>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">#{idx + 1}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveTicker(msg)}
                            className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticker Preview */}
                  <div className="mt-10 p-6 bg-black/40 rounded-2xl border border-gray-800">
                    <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                      <Eye size={18}/> Live Preview
                    </h3>
                    <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-700 overflow-hidden">
                      <div className="flex space-x-6 animate-marquee whitespace-nowrap">
                        {tickers.length > 0 ? (
                          tickers.map((msg, idx) => (
                            <span key={idx} className="text-gray-300 flex items-center gap-2">
                              <span className="text-purple-400">▶</span> {msg}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">Add messages to see preview...</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Ticker will automatically scroll on homepage. Max 10 messages recommended.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: BLOG CMS */}
            {activeSection === 'blog' && (
              <motion.div key="blog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Create/Edit Blog */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-cyan-500/30 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        {blogForm.title ? '✏️ EDIT BLOG POST' : '📝 CREATE NEW BLOG POST'}
                      </h2>
                      <button 
                        onClick={handleResetBlogForm}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                      >
                        Reset Form
                      </button>
                    </div>
                    
                    <form onSubmit={handleCreateBlog} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Title *
                          <span className="text-xs text-gray-500 ml-2">({blogForm.title.length}/100)</span>
                        </label>
                        <input 
                          type="text"
                          placeholder="Enter blog post title"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                          value={blogForm.title}
                          onChange={e => setBlogForm({...blogForm, title: e.target.value})}
                          maxLength={100}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Excerpt (Short Description)
                          <span className="text-xs text-gray-500 ml-2">({blogForm.excerpt.length}/200)</span>
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Brief summary of the blog post"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                          value={blogForm.excerpt}
                          onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})}
                          maxLength={200}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Category</label>
                          <select 
                            className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-all"
                            value={blogForm.category}
                            onChange={e => setBlogForm({...blogForm, category: e.target.value})}
                          >
                            {blogCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Read Time (Minutes)</label>
                          <input 
                            type="number"
                            min="1"
                            max="60"
                            className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-cyan-500 transition-all"
                            value={blogForm.readTime}
                            onChange={e => setBlogForm({...blogForm, readTime: parseInt(e.target.value) || 5})}
                          />
                        </div>
                      </div>

                      {/* Tags Section */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Tags</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {blogForm.tags.map(tag => (
                            <span key={tag} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                              <Hash size={12}/> {tag}
                              <button 
                                type="button" 
                                onClick={() => handleRemoveTag(tag)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={14}/>
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="Add tag (press Enter)"
                            className="flex-1 bg-black/60 border border-gray-800 p-3 rounded-xl"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag(newTag);
                              }
                            }}
                          />
                          <button 
                            type="button"
                            onClick={() => handleAddTag(newTag)}
                            className="px-4 py-3 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all"
                          >
                            Add
                          </button>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Popular tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {popularTags.slice(0, 6).map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleAddTag(tag)}
                                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white px-2 py-1 rounded transition-all"
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

{/* 1. IMAGE UPLOAD BOX */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Cover Image</label>
                          <div className="relative">
                            <input 
                              type="file"
                              onChange={e => setBlogImage(e.target.files[0])}
                              className="hidden"
                              id="blogImage"
                              accept="image/*"
                            />
                            <label htmlFor="blogImage" className="cursor-pointer block">
                              <div className={`bg-black/60 border border-dashed ${blogImage ? 'border-green-500' : 'border-gray-800'} rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all min-h-[100px] flex flex-col items-center justify-center`}>
                                {blogImage ? (
                                  <span className="text-green-400 text-sm flex items-center gap-2">
                                    <CheckCircle size={20}/> {blogImage.name}
                                  </span>
                                ) : blogForm.imageUrl ? (
                                  <div className="text-center">
                                    <img src={blogForm.imageUrl} alt="Preview" className="h-20 w-auto mx-auto rounded mb-2 object-cover"/>
                                    <span className="text-xs text-green-400">Current Image Set</span>
                                  </div>
                                ) : (
                                  <>
                                    <ImageIcon size={24} className="text-gray-500 mb-2"/>
                                    <span className="text-gray-500 text-sm">Click to upload Image</span>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {/* Fallback URL Input */}
                          <input 
                            type="text"
                            placeholder="Or paste Image URL"
                            className="mt-2 w-full bg-black/60 border border-gray-800 p-2 rounded-lg text-sm text-white focus:border-cyan-500 transition-all"
                            value={blogForm.imageUrl}
                            onChange={e => setBlogForm({...blogForm, imageUrl: e.target.value})}
                          />
                        </div>

                        {/* 2. VIDEO UPLOAD BOX (Ye missing tha) */}
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-300">Video (Upload or YouTube)</label>
                          <div className="relative">
                            <input 
                              type="file"
                              onChange={e => setBlogVideo(e.target.files[0])}
                              className="hidden"
                              id="blogVideo"
                              accept="video/*"
                            />
                            <label htmlFor="blogVideo" className="cursor-pointer block">
                              <div className={`bg-black/60 border border-dashed ${blogVideo ? 'border-green-500' : 'border-gray-800'} rounded-xl p-4 text-center hover:border-cyan-500/50 transition-all min-h-[100px] flex flex-col items-center justify-center`}>
                                {blogVideo ? (
                                  <span className="text-green-400 text-sm flex items-center gap-2">
                                    <CheckCircle size={20}/> {blogVideo.name}
                                  </span>
                                ) : blogForm.youtubeUrl ? (
                                   <span className="text-blue-400 text-sm flex items-center gap-2">
                                    <LinkIcon size={20}/> Video Link Set
                                  </span>
                                ) : (
                                  <>
                                    <Youtube size={24} className="text-gray-500 mb-2"/>
                                    <span className="text-gray-500 text-sm">Click to upload Video</span>
                                  </>
                                )}
                              </div>
                            </label>
                          </div>
                          {/* Fallback YouTube URL Input */}
                          <input 
                            type="text"
                            placeholder="Or paste YouTube/Video URL"
                            className="mt-2 w-full bg-black/60 border border-gray-800 p-2 rounded-lg text-sm text-white focus:border-cyan-500 transition-all"
                            value={blogForm.youtubeUrl}
                            onChange={e => setBlogForm({...blogForm, youtubeUrl: e.target.value})}
                          />
                        </div>

                      {/* Content */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Content *
                          <span className="text-xs text-gray-500 ml-2">({blogForm.content.length}/10000)</span>
                        </label>
                        <textarea 
                          rows={12}
                          placeholder="Write your blog content here..."
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                          value={blogForm.content}
                          onChange={e => setBlogForm({...blogForm, content: e.target.value})}
                          maxLength={10000}
                          required
                        />
                      </div>

                      {/* SEO Section */}
                      <div className="p-4 bg-black/40 rounded-xl border border-gray-800">
                        <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                          <Globe size={18}/> SEO Settings
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Meta Title</label>
                            <input 
                              type="text"
                              placeholder="SEO meta title"
                              className="w-full bg-black/60 border border-gray-800 p-3 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                              value={blogForm.metaTitle}
                              onChange={e => setBlogForm({...blogForm, metaTitle: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Meta Description</label>
                            <textarea 
                              rows={2}
                              placeholder="SEO meta description"
                              className="w-full bg-black/60 border border-gray-800 p-3 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                              value={blogForm.metaDescription}
                              onChange={e => setBlogForm({...blogForm, metaDescription: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">URL Slug</label>
                            <input 
                              type="text"
                              placeholder="seo-friendly-url"
                              className="w-full bg-black/60 border border-gray-800 p-3 rounded-xl text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-all"
                              value={blogForm.slug || generateSlug(blogForm.title)}
                              onChange={e => setBlogForm({...blogForm, slug: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-800">
                          <div className="flex items-center gap-3">
                            <Star className="text-yellow-500" />
                            <div>
                              <p className="font-medium">Featured Post</p>
                              <p className="text-sm text-gray-500">Show on homepage carousel</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setBlogForm({...blogForm, isFeatured: !blogForm.isFeatured})}
                            className={`w-12 h-6 rounded-full transition-colors ${blogForm.isFeatured ? 'bg-yellow-500' : 'bg-gray-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${blogForm.isFeatured ? 'translate-x-7' : 'translate-x-1'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-800">
                          <div className="flex items-center gap-3">
                            <Globe className="text-green-500" />
                            <div>
                              <p className="font-medium">Published</p>
                              <p className="text-sm text-gray-500">Visible to users</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setBlogForm({...blogForm, isPublished: !blogForm.isPublished})}
                            className={`w-12 h-6 rounded-full transition-colors ${blogForm.isPublished ? 'bg-green-500' : 'bg-gray-700'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${blogForm.isPublished ? 'translate-x-7' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Schedule Publishing */}
                      <div className="p-4 bg-black/40 rounded-xl border border-gray-800">
                        <label className="block text-sm font-medium mb-2 text-gray-300">Schedule Publishing</label>
                        <input 
                          type="datetime-local"
                          className="w-full bg-black/60 border border-gray-800 p-3 rounded-xl"
                          value={blogForm.scheduleDate}
                          onChange={(e) => setBlogForm({...blogForm, scheduleDate: e.target.value})}
                        />
                        <p className="text-xs text-gray-500 mt-2">Leave empty to publish immediately</p>
                      </div>
                      
                      {/* Submit Button */}
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="animate-spin" size={20}/> Publishing...
                          </>
                        ) : blogForm.title ? (
                          <>
                            <Save size={20}/> UPDATE BLOG POST
                          </>
                        ) : (
                          <>
                            <Newspaper size={20}/> PUBLISH BLOG POST
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                  
                  {/* Blog List */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-blue-500/30 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                        MANAGE BLOG POSTS
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl font-bold text-sm">
                          {blogs.length} Posts
                        </span>
                        <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-xl font-bold text-sm">
                          {blogs.filter(b => b.isFeatured).length} Featured
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {blogs.length === 0 ? (
                        <div className="text-center py-20">
                          <BookOpen className="mx-auto mb-6 text-gray-700" size={80}/>
                          <p className="text-gray-500">No blog posts yet</p>
                          <p className="text-sm text-gray-600 mt-2">Create your first blog post</p>
                        </div>
                      ) : blogs.map(blog => (
                        <div key={blog.id} className="bg-black/40 p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {blog.isFeatured && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-bold flex items-center gap-1">
                                    <Star size={10}/> FEATURED
                                  </span>
                                )}
                                {!blog.isPublished && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                                    DRAFT
                                  </span>
                                )}
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                  {blog.category || 'News'}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{blog.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-400">
                                <span>{blog.timestamp?.toDate().toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12}/> {blog.readTime || 5} min
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <EyeIcon size={12}/> {blog.views || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditBlog(blog)}
                                className="p-2 bg-blue-500/10 hover:bg-blue-500 rounded-lg text-blue-400 hover:text-white transition-all"
                                title="Edit"
                              >
                                <Edit3 size={16}/>
                              </button>
                              <button 
                                onClick={() => handleToggleBlogStatus(blog.id, blog.isPublished)}
                                className={`p-2 rounded-lg transition-all ${blog.isPublished ? 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white' : 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white'}`}
                                title={blog.isPublished ? "Unpublish" : "Publish"}
                              >
                                {blog.isPublished ? <EyeOff size={16}/> : <Eye size={16}/>}
                              </button>
                              <button 
                                onClick={() => handleDeleteBlog(blog.id)}
                                className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
                                title="Delete"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </div>
                          
                          {blog.image && (
                            <div className="mb-4">
                              <img 
                                src={blog.image} 
                                alt={blog.title}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          
                          <p className="text-gray-300 line-clamp-2 mb-3">
                            {blog.excerpt || blog.content.substring(0, 200)}...
                          </p>
                          
                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {blog.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                              {blog.tags.length > 3 && (
                                <span className="text-xs text-gray-500">+{blog.tags.length - 3} more</span>
                              )}
                            </div>
                          )}
                          
                          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-gray-500">By: {blog.author || 'Admin'}</span>
                              {blog.youtubeUrl && (
                                <span className="text-xs text-red-400 flex items-center gap-1">
                                  <Youtube size={12}/> Video
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={() => navigator.clipboard.writeText(`/blog/${blog.id}`)}
                              className="text-xs text-gray-500 hover:text-white transition-all flex items-center gap-1"
                            >
                              <LinkIcon size={12}/> Copy ID
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: CREATE TOURNAMENT */}
            {activeSection === 'create' && (
              <motion.div key="create" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-rose-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                        {isEditing ? '✏️ EDIT TOURNAMENT' : '🚀 CREATE TOURNAMENT'}
                      </h2>
                      <p className="text-gray-400 mt-2">Setup new Free Fire tournament with detailed configuration</p>
                    </div>
                    <button 
                      onClick={resetMatchForm}
                      className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                    >
                      Reset Form
                    </button>
                  </div>

                  <form onSubmit={handleMatchSubmit} className="space-y-8">
                    {/* BASIC INFO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Tournament Title *</label>
                        <input 
                          type="text"
                          placeholder="E.g., DAILY ROYALE #45"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-rose-500 transition-all"
                          value={matchForm.title}
                          onChange={e => setMatchForm({...matchForm, title: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Start Time *</label>
                        <input 
                          type="datetime-local"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-rose-500 transition-all"
                          value={matchForm.time}
                          onChange={e => setMatchForm({...matchForm, time: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    {/* GAME TYPE */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Category</label>
                        <div className="flex gap-2 bg-black/60 p-1.5 rounded-xl border border-gray-800">
                          {['BR', 'CS'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleCategoryChange(cat)}
                              className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${matchForm.category === cat ? 'bg-rose-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                              {cat === 'BR' ? 'BATTLE ROYALE' : 'CLASH SQUAD'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Match Type</label>
                        <select 
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-rose-500 transition-all"
                          value={matchForm.type}
                          onChange={e => setMatchForm({...matchForm, type: e.target.value})}
                        >
                          {matchForm.category === 'CS' ? (
                            <>
                              <option value="1v1">1v1</option>
                              <option value="2v2">2v2</option>
                              <option value="3v3">3v3</option>
                              <option value="4v4">4v4</option>
                              <option value="6v6">6v6</option>
                            </>
                          ) : (
                            <>
                              <option value="Solo">Solo</option>
                              <option value="Duo">Duo</option>
                              <option value="Squad">Squad</option>
                            </>
                          )}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Match Count</label>
                        <select 
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-rose-500 transition-all"
                          value={matchForm.matchCount}
                          onChange={e => setMatchForm({...matchForm, matchCount: e.target.value})}
                        >
                          {[1,2,3,4,5,6].map(n => (
                            <option key={n} value={`${n} Match`}>{n} Match{n>1?'es':''}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* MAP SELECTION */}
                    <div>
                      <label className="block text-sm font-medium mb-3 text-gray-300">Map</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['Bermuda', 'Purgatory', 'Alpine', 'Nexterra', 'Kalahari', 'Random Map'].map(map => (
                          <button
                            key={map}
                            type="button"
                            onClick={() => setMatchForm({...matchForm, map})}
                            className={`p-4 rounded-xl border transition-all ${matchForm.map === map ? 'border-rose-500 bg-rose-500/10 text-rose-400' : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700'}`}
                          >
                            {map}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* CS SPECIAL OPTION */}
                    {matchForm.category === 'CS' && (
                      <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/20 rounded-xl">
                              <Target className="text-rose-400" size={24}/>
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">Headshot Protocol</h4>
                              <p className="text-sm text-gray-400">Only headshot kills count in CS mode</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMatchForm({...matchForm, headshotOnly: !matchForm.headshotOnly})}
                            className={`relative w-14 h-7 rounded-full transition-all ${matchForm.headshotOnly ? 'bg-rose-500' : 'bg-gray-700'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${matchForm.headshotOnly ? 'left-8' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* SLOTS & ENTRY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Total Slots</label>
                        <input 
                          type="number"
                          min="2"
                          max="100"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-rose-500 transition-all"
                          value={matchForm.totalSlots}
                          onChange={e => setMatchForm({...matchForm, totalSlots: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Entry Fee (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-rose-500 transition-all"
                          value={matchForm.entryFee}
                          onChange={e => setMatchForm({...matchForm, entryFee: e.target.value})}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-3 text-green-400">Prize Pool (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          className="w-full bg-black/60 border border-green-500/30 p-4 rounded-xl text-green-400 outline-none focus:border-green-500 transition-all"
                          value={matchForm.prizePool}
                          onChange={e => setMatchForm({...matchForm, prizePool: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* PRIZE DISTRIBUTION */}
                    <div className="p-6 bg-black/40 rounded-2xl border border-gray-800">
                      <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Trophy className="text-yellow-500"/> Prize Distribution
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-3 text-yellow-400">🥇 Rank 1 (₹)</label>
                          <input 
                            type="number"
                            min="0"
                            className="w-full bg-black/60 border border-yellow-500/30 p-4 rounded-xl text-yellow-400 outline-none focus:border-yellow-500 transition-all"
                            value={matchForm.rank1}
                            onChange={e => setMatchForm({...matchForm, rank1: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-3 text-gray-400">🥈 Rank 2 (₹)</label>
                          <input 
                            type="number"
                            min="0"
                            className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-gray-700 transition-all"
                            value={matchForm.rank2}
                            onChange={e => setMatchForm({...matchForm, rank2: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-3 text-orange-400">🥉 Rank 3 (₹)</label>
                          <input 
                            type="number"
                            min="0"
                            className="w-full bg-black/60 border border-orange-500/30 p-4 rounded-xl text-orange-400 outline-none focus:border-orange-500 transition-all"
                            value={matchForm.rank3}
                            onChange={e => setMatchForm({...matchForm, rank3: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="block text-sm font-medium mb-3 text-rose-400">Per Kill Bonus (₹)</label>
                        <input 
                          type="number"
                          min="0"
                          className="w-full bg-black/60 border border-rose-500/30 p-4 rounded-xl text-rose-400 outline-none focus:border-rose-500 transition-all"
                          value={matchForm.perKill}
                          onChange={e => setMatchForm({...matchForm, perKill: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* STATUS & FEATURED */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-sm font-medium mb-3 text-gray-300">Status</label>
                        <div className="flex gap-4">
                          {['OPEN', 'CLOSED', 'UPCOMING'].map(status => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setMatchForm({...matchForm, status})}
                              className={`flex-1 py-3 rounded-xl border font-bold transition-all ${matchForm.status === status ? 
                                status === 'OPEN' ? 'border-green-500 bg-green-500/10 text-green-400' : 
                                status === 'CLOSED' ? 'border-red-500 bg-red-500/10 text-red-400' :
                                'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                : 'border-gray-800 bg-black/60 text-gray-400 hover:border-gray-700'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-gray-800">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Star className="text-blue-400" size={24}/>
                          </div>
                          <div>
                            <h4 className="font-bold">Featured Tournament</h4>
                            <p className="text-sm text-gray-400">Show on homepage as featured</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMatchForm({...matchForm, featured: !matchForm.featured})}
                          className={`relative w-14 h-7 rounded-full transition-all ${matchForm.featured ? 'bg-blue-500' : 'bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${matchForm.featured ? 'left-8' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={24}/>
                          Processing...
                        </>
                      ) : isEditing ? (
                        <>
                          <Save size={24}/>
                          Update Tournament
                        </>
                      ) : (
                        <>
                          <Plus size={24}/>
                          Create Tournament
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* SECTION: MANAGE TOURNAMENTS */}
            {activeSection === 'manage' && (
              <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                      TOURNAMENTS
                    </h2>
                    <p className="text-gray-400 mt-2">Manage all tournaments and matches</p>
                  </div>
                  <button 
                    onClick={() => setActiveSection('create')}
                    className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl font-bold text-sm hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={16}/> New Tournament
                  </button>
                </div>
                
                {matches.length === 0 ? (
                  <div className="text-center py-20">
                    <Gamepad2 className="mx-auto mb-6 text-gray-700" size={80}/>
                    <h3 className="text-2xl font-bold text-gray-600 mb-3">No Tournaments Yet</h3>
                    <p className="text-gray-500 mb-6">Create your first tournament to get started</p>
                    <button 
                      onClick={() => setActiveSection('create')}
                      className="px-10 py-4 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                    >
                      Create First Tournament
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map(match => (
                      <div key={match.id} className="bg-gradient-to-br from-gray-900/80 to-black/80 p-6 rounded-2xl border border-gray-800 hover:border-rose-500/30 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${match.status === 'OPEN' ? 'bg-green-500/10 text-green-500' : match.status === 'CLOSED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                              {match.status}
                            </span>
                            {match.featured && (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 ml-2">
                                FEATURED
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleEditInit(match)}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500 rounded-lg text-blue-400 hover:text-white transition-all"
                            >
                              <Edit3 size={16}/>
                            </button>
                            <button 
                              onClick={() => toggleMatchStatus(match.id, match.status)}
                              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all"
                            >
                              {match.status === 'OPEN' ? <EyeOff size={16}/> : <Eye size={16}/>}
                            </button>
                            <button 
                              onClick={() => { setMatchToDelete(match); setShowDeleteModal(true); }}
                              className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 group-hover:text-rose-400 transition-all">{match.title}</h3>
                        <div className="space-y-3 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Map size={14}/>
                            <span>{match.map} • {match.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={14}/>
                            <span>{new Date(match.time).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14}/>
                            <span>{match.totalSlots} slots • {match.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign size={14}/>
                            <span className="text-green-400">₹{match.prizePool} prize pool</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* SECTION: PAYMENTS */}
            {activeSection === 'payments' && (
              <motion.div key="payments" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-yellow-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">
                        FINANCIAL CENTER
                      </h2>
                      <p className="text-gray-400 mt-2">Manage subscription requests & payments</p>
                    </div>
                    <span className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-xl font-bold border border-yellow-500/30">
                      {pendingSubs.length} Pending Requests
                    </span>
                  </div>

                  {pendingSubs.length === 0 ? (
                    <div className="text-center py-20 bg-black/40 rounded-2xl border border-gray-800">
                      <DollarSign className="mx-auto mb-6 text-gray-700" size={80}/>
                      <h3 className="text-2xl font-bold text-gray-600 mb-3">No Pending Payments</h3>
                      <p className="text-gray-500">All transactions are up to date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {pendingSubs.map(sub => (
                        <div key={sub.id} className="bg-black/60 p-6 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all flex flex-col md:flex-row gap-6">
                          
                          {/* Screenshot Preview */}
                          <div className="w-full md:w-48 h-48 shrink-0 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative group">
                            <img 
                              src={sub.screenshotUrl} 
                              alt="Payment Proof" 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <a href={sub.screenshotUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-black rounded-lg font-bold text-xs flex items-center gap-2">
                                <Eye size={14}/> View Full
                              </a>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold text-white">{sub.planName}</h3>
                                <p className="text-yellow-500 font-bold text-lg">₹{sub.amount}</p>
                              </div>
                              <div className="text-right">
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold uppercase">
                                  {sub.status}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {sub.submittedAt?.toDate().toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-6 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-600">User Name</p>
                                <p className="text-white font-medium">{sub.userName}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-600">WhatsApp</p>
                                <p className="text-white font-medium">{sub.userWhatsapp}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-600">Transaction ID</p>
                                <p className="text-white font-medium font-mono">{sub.transactionId}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-widest text-gray-600">User Email</p>
                                <p className="text-white font-medium">{sub.userEmail}</p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                              <button 
                                onClick={() => handleAuthorizePayment(sub)}
                                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={18}/> Approve & Add Points
                              </button>
                              <button 
                                onClick={() => handleDeclinePayment(sub)}
                                className="flex-1 py-3 bg-gray-800 hover:bg-red-900/30 border border-transparent hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                              >
                                <X size={18}/> Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION: SUPPORT */}
            {activeSection === 'support' && (
              <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-pink-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                        SUPPORT QUERIES
                      </h2>
                      <p className="text-gray-400 mt-2">Respond to user support messages</p>
                    </div>
                    <span className="px-4 py-2 bg-pink-500/20 text-pink-500 rounded-xl font-bold">
                      {supportMsgs.length} Messages
                    </span>
                  </div>
                  
                  {supportMsgs.length === 0 ? (
                    <div className="text-center py-20">
                      <MessageSquare className="mx-auto mb-6 text-gray-700" size={80}/>
                      <h3 className="text-2xl font-bold text-gray-600 mb-3">No Messages</h3>
                      <p className="text-gray-500">No support queries pending</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {supportMsgs.map(msg => (
                        <div key={msg.id} className="bg-black/40 p-6 rounded-2xl border border-gray-800 hover:border-pink-500/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold">{msg.name}</h3>
                              <p className="text-sm text-gray-400 mt-1">{msg.email} • {msg.timestamp?.toDate().toLocaleDateString()}</p>
                            </div>
                            <button 
                              onClick={() => deleteDoc(doc(db, "contact_messages", msg.id)).then(fetchAllData)}
                              className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg text-red-400 hover:text-white transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                          
                          <div className="p-4 bg-black/60 rounded-xl border border-gray-800">
                            <p className="text-gray-300">{msg.message}</p>
                          </div>
                          
                          <div className="mt-4 flex gap-3">
                            <a 
                              href={`mailto:${msg.email}`}
                              className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                            >
                              <Mail size={14}/> Reply via Email
                            </a>
                            <button className="px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                              <CheckCircle size={14}/> Mark Resolved
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SECTION: USERS */}
            {activeSection === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-blue-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        USER MANAGEMENT
                      </h2>
                      <p className="text-gray-400 mt-2">Manage all registered users</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium">
                        Export Users
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-sm font-medium">
                        Filters
                      </button>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Points</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.slice(0, 20).map(user => (
                          <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-all">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center font-bold">
                                  {user.displayName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium">{user.displayName || 'Unknown User'}</p>
                                  <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-sm">{user.email}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isPremium ? 'bg-green-500/10 text-green-500' : user.isBanned ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                {user.isPremium ? 'PREMIUM' : user.isBanned ? 'BANNED' : 'BASIC'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Star className="text-yellow-500" size={14}/>
                                <span className="font-bold">{user.points || 0}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleUserAction(user.id, 'reset')}
                                  className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500 text-yellow-400 hover:text-white rounded-lg text-xs transition-all"
                                >
                                  Reset
                                </button>
                                <button 
                                  onClick={() => handleUserAction(user.id, user.isBanned ? 'unban' : 'ban')}
                                  className={`px-3 py-1 rounded-lg text-xs transition-all ${user.isBanned ? 'bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white' : 'bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white'}`}
                                >
                                  {user.isBanned ? 'Unban' : 'Ban'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: LEADERBOARD */}
            {activeSection === 'leader' && (
              <motion.div key="leader" initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-10">
                {/* CONTROL PANEL */}
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-rose-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex flex-col lg:flex-row gap-6 mb-8 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      <div className="flex gap-2 bg-black/60 p-1.5 rounded-2xl border border-gray-800">
                        {['35', '45', '55'].map(lobby => (
                          <button 
                            key={lobby}
                            onClick={() => setLbFilter({...lbFilter, lobby})}
                            className={`px-6 py-3 rounded-xl font-bold text-xs border transition-all ${lbFilter.lobby === lobby ? 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/20' : 'border-gray-800 text-gray-500 hover:border-gray-700'}`}
                          >
                            🎮 LOBBY {lobby}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex bg-black/60 p-1.5 rounded-2xl border border-gray-800">
                        {['WEEKLY', 'MONTHLY'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setLbFilter({...lbFilter, type})}
                            className={`px-6 py-3 rounded-xl font-bold text-xs transition-all ${lbFilter.type === type ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-4 w-full lg:w-auto">
                      <button 
                        onClick={()=>setManualModal(true)} 
                        className="flex-1 lg:flex-none px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-500/30 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
                      >
                        <Plus size={18}/> Add Team
                      </button>
                      
                      <label className={`flex-1 lg:flex-none px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-black rounded-2xl font-bold text-sm uppercase tracking-widest cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-3 relative ${scanning ? 'opacity-80' : ''}`}>
                        {scanning ? <RefreshCw className="animate-spin" size={18}/> : <ImageIcon size={18}/>}
                        {scanning ? (scanStatus || "Scanning...") : "📸 AI Upload"}
                        <input id="ai-upload" type="file" className="hidden" onChange={handleAIScan} disabled={scanning} accept="image/*" />
                      </label>
                    </div>
                  </div>
                  
                  {/* BULK ACTIONS */}
                  {showBulkActions && selectedTeams.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-gradient-to-r from-red-900/20 to-rose-900/20 border border-red-500/30 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Trash2 className="text-red-500" size={20}/>
                        </div>
                        <div>
                          <p className="font-bold">{selectedTeams.length} teams selected</p>
                          <p className="text-sm text-gray-400">Bulk actions available</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={handleBulkDelete}
                          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-sm hover:shadow-lg transition-all"
                        >
                          Delete Selected
                        </button>
                        <button 
                          onClick={() => setSelectedTeams([])}
                          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* AI UPLOAD AREA */}
                  <div className="mt-8 p-6 bg-black/40 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="text-yellow-500 animate-pulse" size={22}/>
                      <h4 className="font-bold text-white uppercase tracking-widest text-lg">AI SCOREBOARD SCANNER</h4>
                    </div>
                    
                    <label className={`block w-full h-64 border-3 border-dashed ${scanning ? 'border-rose-500 bg-rose-500/5 shadow-[0_0_60px_rgba(244,63,94,0.4)]' : 'border-gray-700 hover:border-rose-500/50 hover:bg-gray-900/50'} rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden relative`}>
                      <div className="text-center p-8">
                        {scanning ? (
                          <>
                            <div className="relative mb-6">
                              <RefreshCw className="animate-spin text-rose-500 mx-auto" size={56}/>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                              </div>
                            </div>
                            <p className="text-lg font-bold uppercase tracking-widest text-rose-500 animate-pulse">
                              {scanStatus}
                            </p>
                            <p className="text-sm text-gray-400 mt-2">Processing your image...</p>
                          </>
                        ) : (
                          <>
                            <div className="relative mb-6">
                              <Upload className="text-gray-500 group-hover:text-rose-500 transition-all mx-auto" size={56}/>
                              <div className="absolute -inset-8 bg-rose-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                            </div>
                            <p className="text-lg font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-all mb-3">
                              UPLOAD LEADERBOARD SCREENSHOT
                            </p>
                            <p className="text-sm text-gray-600 mb-4">Drag & drop or click to upload</p>
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                              <span>📷 PNG, JPG, JPEG</span>
                              <span>•</span>
                              <span>⚡ Instant Processing</span>
                              <span>•</span>
                              <span>🤖 Powered by AI</span>
                            </div>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" onChange={handleAIScan} disabled={scanning} accept="image/*" />
                    </label>
                    
                    {/* Current Selection Info */}
                    <div className="mt-8 p-4 bg-black/60 rounded-2xl border border-gray-800">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
                            <span className="text-sm font-medium">Lobby: <span className="text-white font-bold">{lbFilter.lobby}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium">Type: <span className="text-white font-bold">{lbFilter.type}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium">Teams: <span className="text-white font-bold">{top10Teams.length}/10</span></span>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={syncLeaderboard} 
                            className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                          >
                            <RefreshCw size={14}/> Refresh
                          </button>
                          <button 
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-all"
                          >
                            <GitMerge size={14}/> Bulk Actions
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP 10 LEADERBOARD */}
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-rose-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl">
                        <Crown size={28}/>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                          TOP 10 LEADERBOARD
                        </h3>
                        <p className="text-gray-400">Lobby {lbFilter.lobby} • {lbFilter.type} Rankings</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleSelectAll}
                        className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium"
                      >
                        {selectedTeams.length === top10Teams.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button 
                        onClick={() => exportData(top10Teams, `leaderboard_lobby_${lbFilter.lobby}_${lbFilter.type}`)}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-medium flex items-center gap-2"
                      >
                        <Download size={14}/> Export
                      </button>
                    </div>
                  </div>

                  {/* TOP 3 PODIUM */}
                  {top10Teams.length >= 3 && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                      {[1, 0, 2].map((posIndex, displayIndex) => {
                        const team = top10Teams[posIndex];
                        if (!team) return null;
                        
                        const podiums = [
                          { height: 'h-60', color: 'from-yellow-600/20 to-yellow-900/10', border: 'border-yellow-500', text: 'text-yellow-400' },
                          { height: 'h-52', color: 'from-gray-600/20 to-gray-900/10', border: 'border-gray-400', text: 'text-gray-400' },
                          { height: 'h-48', color: 'from-orange-700/20 to-orange-900/10', border: 'border-orange-600', text: 'text-orange-400' }
                        ];
                        
                        return (
                          <div key={team.id} className={`${podiums[displayIndex].height} bg-gradient-to-b ${podiums[displayIndex].color} border ${podiums[displayIndex].border} rounded-3xl p-6 flex flex-col items-center relative group`}>
                            {displayIndex === 0 && (
                              <div className="absolute -top-6">
                                <Crown className="text-yellow-400 animate-bounce" size={40}/>
                              </div>
                            )}
                            
                            <div className="relative mb-4">
                              <div className={`w-20 h-20 rounded-full ${displayIndex === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-700' : displayIndex === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 'bg-gradient-to-br from-orange-600 to-orange-800'} flex items-center justify-center shadow-2xl`}>
                                <span className={`text-3xl font-black ${displayIndex === 0 ? 'text-black' : 'text-white'}`}>
                                  #{posIndex + 1}
                                </span>
                              </div>
                            </div>
                            
                            <h5 className={`font-bold text-center mb-3 truncate w-full ${podiums[displayIndex].text}`}>
                              {team.name}
                            </h5>
                            
                            <div className="text-center mt-auto">
                              <p className="text-4xl font-black text-white mb-2">{team.points}</p>
                              <div className="flex items-center justify-center gap-4 text-sm">
                                <span className="text-gray-400">⚔️ {team.kills}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-400">🎯 {Math.round(team.points / team.kills) || 0}/kill</span>
                              </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <button 
                                onClick={() => handleSelectTeam(team.id)}
                                className={`p-2 rounded-lg ${selectedTeams.includes(team.id) ? 'bg-rose-500' : 'bg-gray-800'}`}
                              >
                                <CheckCircle size={16}/>
                              </button>
                              <button 
                                onClick={() => handleDeleteTeam(team.id)}
                                className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg"
                              >
                                <Trash2 size={16}/>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* TEAMS LIST */}
                  <div className="space-y-4">
                    {top10Teams.length === 0 ? (
                      <div className="text-center py-20">
                        <Trophy className="mx-auto mb-6 text-gray-700" size={80}/>
                        <h4 className="text-2xl font-bold text-gray-600 mb-3">No Teams Found</h4>
                        <p className="text-gray-500 mb-6">Upload a screenshot or add teams manually</p>
                        <button 
                          onClick={()=>setManualModal(true)} 
                          className="px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                        >
                          + Add First Team
                        </button>
                      </div>
                    ) : top10Teams.slice(3).map((team, index) => {
                      const rank = index + 4;
                      const rankColors = [
                        'from-purple-600 to-purple-400',
                        'from-blue-600 to-blue-400', 
                        'from-green-600 to-green-400',
                        'from-cyan-600 to-cyan-400',
                        'from-gray-600 to-gray-400',
                        'from-gray-600 to-gray-400',
                        'from-gray-600 to-gray-400'
                      ];
                      
                      return (
                        <motion.div 
                          key={team.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-gradient-to-r from-gray-900/50 to-black/50 border border-gray-800 p-6 rounded-2xl hover:border-rose-500/30 hover:bg-gray-900/30 transition-all group"
                        >
                          <div className="grid grid-cols-12 items-center gap-6">
                            {/* Selection Checkbox */}
                            <div className="col-span-1">
                              <input 
                                type="checkbox"
                                checked={selectedTeams.includes(team.id)}
                                onChange={() => handleSelectTeam(team.id)}
                                className="w-5 h-5 rounded bg-gray-800 border-gray-700 checked:bg-rose-500 checked:border-rose-500"
                              />
                            </div>
                            
                            {/* Rank */}
                            <div className="col-span-1">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${rankColors[Math.min(index, rankColors.length-1)]} flex items-center justify-center font-black text-lg shadow-lg`}>
                                #{rank}
                              </div>
                            </div>
                            
                            {/* Team Info */}
                            <div className="col-span-6">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                  <TeamIcon size={20} className="text-gray-400"/>
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold group-hover:text-rose-400 transition-all">
                                    {team.name}
                                  </h4>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Sword size={14}/> {team.kills} Kills
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Target size={14}/> Lobby {team.lobby}
                                    </span>
                                    <span>•</span>
                                    <span className="text-rose-500 font-medium">
                                      {team.source === 'AI_SCAN' ? '🤖 AI' : '👤 Manual'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Points */}
                            <div className="col-span-2 text-center">
                              <div className="text-3xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                                {team.points}
                              </div>
                              <div className="text-xs text-gray-500 uppercase tracking-widest">Points</div>
                            </div>
                            
                            {/* Actions */}
                            <div className="col-span-2 flex justify-end gap-3">
                              <button 
                                onClick={() => setManualModal(true)}
                                className="p-3 bg-blue-500/10 hover:bg-blue-500 rounded-xl text-blue-400 hover:text-white transition-all"
                              >
                                <Edit3 size={18}/>
                              </button>
                              <button 
                                onClick={() => handleDeleteTeam(team.id)}
                                className="p-3 bg-red-500/10 hover:bg-red-500 rounded-xl text-red-400 hover:text-white transition-all"
                              >
                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* STATS FOOTER */}
                  <div className="mt-12 p-6 bg-black/40 rounded-2xl border border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-4xl font-black text-rose-500">{top10Teams.length}</div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Top 10 Teams</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-yellow-500">
                          {top10Teams.reduce((sum, t) => sum + t.kills, 0)}
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Total Kills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-blue-500">
                          {top10Teams.reduce((sum, t) => sum + t.points, 0)}
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Total Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-black text-green-500">
                          {top10Teams.length > 0 ? Math.round(top10Teams.reduce((sum, t) => sum + t.points, 0) / top10Teams.length) : 0}
                        </div>
                        <div className="text-sm text-gray-400 uppercase tracking-widest">Avg Points</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* MATCH HISTORY */}
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-blue-500/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <HistoryIcon className="text-blue-500"/> Match History
                      <span className="text-sm bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full">
                        {matchHistory.length} Logs
                      </span>
                    </h3>
                    <button 
                      onClick={() => exportData(matchHistory, 'match_history')}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-sm font-medium flex items-center gap-2"
                    >
                      <Download size={14}/> Export Logs
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {matchHistory.length === 0 ? (
                      <div className="text-center py-16">
                        <HistoryIcon className="mx-auto mb-6 text-gray-700" size={48}/>
                        <p className="text-gray-500">No match history yet</p>
                      </div>
                    ) : matchHistory.map((log, idx) => (
                      <motion.div 
                        key={log.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-gray-900/50 hover:bg-gray-900/80 p-6 rounded-2xl border border-gray-800 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${log.source === 'AI_SCAN' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                              {log.source === 'AI_SCAN' ? '🤖' : '👤'}
                            </div>
                            <div>
                              <p className="font-bold">Lobby {log.lobby} • {log.type}</p>
                              <p className="text-sm text-gray-400">{log.teamCount} teams • {log.admin || 'System'}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {log.timestamp?.toDate().toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span>ID: {log.matchId?.slice(-8)}</span>
                            <span>•</span>
                            <span className={`px-2 py-1 rounded ${log.source === 'AI_SCAN' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {log.source}
                            </span>
                          </div>
                          
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleRevertMatch(log.matchId)}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                            >
                              <ZapOff size={14}/> Revert
                            </button>
                            <button 
                              onClick={() => deleteDoc(doc(db, "match_history", log.id)).then(fetchHistory)}
                              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                            >
                              <Trash2 size={14}/> Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION: HISTORY */}
            {activeSection === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-gradient-to-br from-gray-900/90 to-black/90 p-8 rounded-3xl border border-gray-700/30 shadow-2xl backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-transparent">
                        SYSTEM LOGS
                      </h2>
                      <p className="text-gray-400 mt-2">Complete system activity history</p>
                    </div>
                    <button 
                      onClick={() => exportData(matchHistory, 'system_logs')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:shadow-lg transition-all"
                    >
                      <Download size={16}/> Export All
                    </button>
                  </div>
                  
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {matchHistory.length === 0 ? (
                      <div className="text-center py-20">
                        <HistoryIcon className="mx-auto mb-6 text-gray-700" size={80}/>
                        <p className="text-gray-500">No system logs available</p>
                      </div>
                    ) : matchHistory.map(log => (
                      <div key={log.id} className="bg-black/40 p-6 rounded-2xl border border-gray-800 hover:bg-black/60 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${log.source === 'AI_SCAN' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                              {log.source === 'AI_SCAN' ? <ImageIcon className="text-green-400" size={18}/> : <Edit3 className="text-blue-400" size={18}/>}
                            </div>
                            <div>
                              <p className="font-bold">Lobby {log.lobby} • {log.type}</p>
                              <p className="text-sm text-gray-400">{log.teamCount} teams updated</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {log.timestamp?.toDate().toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">ID: {log.matchId} • By: {log.admin || 'System'}</p>
                          <button 
                            onClick={() => deleteDoc(doc(db, "match_history", log.id)).then(fetchHistory)}
                            className="px-3 py-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg text-xs transition-all"
                          >
                            Delete Log
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* --- MANUAL ENTRY MODAL --- */}
      <AnimatePresence>
        {manualModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-rose-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-rose-500/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                  ADD TEAM
                </h3>
                <button 
                  onClick={()=>setManualModal(false)} 
                  className="p-2 hover:bg-gray-800 rounded-full transition-all"
                >
                  <X size={20}/>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Current Selection */}
                <div className="p-4 bg-black/40 rounded-2xl border border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Adding to:</p>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
                      🎮 Lobby {lbFilter.lobby}
                    </span>
                    <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium">
                      📅 {lbFilter.type}
                    </span>
                  </div>
                </div>
                
                {/* Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-300">Team Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter team name" 
                      className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-rose-500 transition-all"
                      value={manualForm.name} 
                      onChange={e=>setManualForm({...manualForm, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-rose-400">Kills</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-rose-500 transition-all"
                        value={manualForm.kills} 
                        onChange={e=>setManualForm({...manualForm, kills: e.target.value})}
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-yellow-400">Points</label>
                      <input 
                        type="number" 
                        placeholder="0" 
                        className="w-full bg-black/60 border border-gray-800 p-4 rounded-xl text-white placeholder-gray-500 outline-none focus:border-yellow-500 transition-all"
                        value={manualForm.points} 
                        onChange={e=>setManualForm({...manualForm, points: e.target.value})}
                        min="0"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-gray-800">
                  <div className="flex items-center gap-3 mb-6 text-sm text-gray-400">
                    <Info size={16}/>
                    <span>Points will auto-calculate as (kills × 10) if left empty</span>
                  </div>
                  
                  <button 
                    onClick={handleManualLeaderboard} 
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Plus size={20}/> Add Team to Leaderboard
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-gray-900 to-black border border-red-500/30 p-10 rounded-3xl max-w-lg w-full text-center shadow-2xl shadow-red-500/10"
            >
              <div className="relative mb-10">
                <Trash2 size={100} className="text-red-500 mx-auto mb-6 animate-pulse"/>
                <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full"></div>
              </div>
              
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
                CONFIRM DELETE?
              </h3>
              
              <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                You are about to permanently delete<br/>
                <span className="text-white font-bold text-xl">{matchToDelete?.title}</span>
              </p>
              
              <div className="flex gap-6">
                <button 
                  onClick={() => setShowDeleteModal(false)} 
                  className="flex-1 py-5 bg-gray-800 hover:bg-gray-700 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirmed} 
                  className="flex-1 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl">
          <div className="text-center">
            <div className="relative mb-6">
              <RefreshCw className="animate-spin text-rose-500 mx-auto" size={64}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
              </div>
            </div>
            <p className="text-xl font-bold animate-pulse">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};
{/* 👇👇👇 YE CSS CODE ADD KAREIN 👇👇👇 */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 15s linear infinite;
          display: flex; /* Ensure flex behavior */
        }

        /* Optional: Mouse le jane par rokne ke liye */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>




export default Admin;