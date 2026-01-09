// pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Eye, MessageSquare, Share2, Bookmark, 
  Heart, Search, Filter, ChevronRight, ChevronLeft, 
  Newspaper, Users, Trophy, Gamepad2, Award, TrendingUp,
  Facebook, Twitter, Instagram, Youtube, Linkedin, 
  ArrowRight, Tag, Hash, User, Clock as ClockIcon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 9;

  // Blog categories
  const categories = [
    'All',
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

  // Fetch blogs from Firebase
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      // Fetch all published blogs
      const q = query(
        collection(db, "blogs"),
        where("isPublished", "==", true),
        orderBy("timestamp", "desc")
      );
      
      const snap = await getDocs(q);
      const blogData = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().timestamp?.toDate() || new Date(),
        publishedAt: doc.data().publishedAt?.toDate() || doc.data().timestamp?.toDate() || new Date()
      }));

      setBlogs(blogData);
      
      // Get featured blogs
      const featured = blogData.filter(blog => blog.isFeatured).slice(0, 3);
      setFeaturedBlogs(featured);
      
      // Get recent blogs (excluding featured)
      const recent = blogData.filter(blog => !blog.isFeatured).slice(0, 6);
      setRecentBlogs(recent);
      
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = searchQuery === '' || 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get reading time
  const getReadingTime = (content) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime < 1 ? 1 : readingTime;
  };

  // Share blog
  const handleShare = (blog) => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt || blog.content.substring(0, 100),
        url: window.location.origin + '/blog/' + blog.id,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + '/blog/' + blog.id);
      alert('Link copied to clipboard!');
    }
  };

  // Popular tags
  const getAllTags = () => {
    const allTags = [];
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        allTags.push(...blog.tags);
      }
    });
    
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([tag]) => tag);
  };

  const popularTags = getAllTags();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Navbar />
        <div className="pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading blogs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-block p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl mb-6"
            >
              <Newspaper className="w-12 h-12 text-cyan-400" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6 font-gaming"
            >
              ZYRO <span className="text-cyan-400">BLOG</span>
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Latest news, gaming strategies, tournament updates, and community stories from Zyro Esports
            </motion.p>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${selectedCategory === category 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20' 
                  : 'bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Featured Blogs */}
      {featuredBlogs.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Award className="text-yellow-500" />
                Featured Stories
              </h2>
              <div className="flex items-center gap-2 text-cyan-400">
                <TrendingUp size={20} />
                <span>Trending Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/blog/${blog.id}`}>
                    <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-3xl overflow-hidden border border-gray-800 hover:border-cyan-500/30 transition-all hover:shadow-2xl hover:shadow-cyan-500/10 h-full">
                      <div className="relative h-64 overflow-hidden">
                        <img 
                          src={blog.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-orange-600 text-white text-sm font-bold rounded-full">
                            Featured
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm rounded-full">
                            {blog.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(blog.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{blog.readTime || getReadingTime(blog.content)} min read</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {blog.title}
                        </h3>
                        
                        <p className="text-gray-400 mb-4 line-clamp-3">
                          {blog.excerpt || blog.content.substring(0, 150)}...
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                              <User size={16} />
                            </div>
                            <span className="text-sm text-gray-400">By {blog.author || 'Zyro Admin'}</span>
                          </div>
                          <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
                            <ArrowRight size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blog Posts */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
                  {selectedCategory === 'All' ? 'Latest Posts' : selectedCategory}
                  <span className="text-gray-500 text-lg ml-2">
                    ({filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'})
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-500" />
                  <select 
                    className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                    value={blogsPerPage}
                    onChange={(e) => setCurrentPage(1)}
                  >
                    <option value={9}>9 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={18}>18 per page</option>
                  </select>
                </div>
              </div>

              {currentBlogs.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-gray-800">
                  <Newspaper className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">No Blog Posts Found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No blog posts available yet'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentBlogs.map((blog) => (
                      <motion.div
                        key={blog.id}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="group"
                      >
                        <Link to={`/blog/${blog.id}`}>
                          <div className="bg-gradient-to-b from-gray-900/30 to-black/30 rounded-2xl overflow-hidden border border-gray-800 hover:border-cyan-500/30 transition-all h-full">
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={blog.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-3 left-3">
                                <span className="px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-gray-300 text-xs rounded">
                                  {blog.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="p-5">
                              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{formatDate(blog.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon size={12} />
                                  <span>{blog.readTime || getReadingTime(blog.content)} min</span>
                                </div>
                                {blog.views > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Eye size={12} />
                                    <span>{blog.views}</span>
                                  </div>
                                )}
                              </div>
                              
                              <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
                                {blog.title}
                              </h3>
                              
                              <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                                {blog.excerpt || blog.content.substring(0, 100)}...
                              </p>
                              
                              {/* Tags */}
                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                  {blog.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                                    <User size={12} className="text-cyan-400" />
                                  </div>
                                  <span className="text-xs text-gray-500">By {blog.author || 'Admin'}</span>
                                </div>
                                <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-xl ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium ${currentPage === pageNum 
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white' 
                              : 'bg-gray-900/50 text-gray-400 hover:text-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-xl ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Popular Tags */}
              <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tag className="text-cyan-400" />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(tag)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm rounded-lg transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Posts */}
              <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="text-cyan-400" />
                  Recent Posts
                </h3>
                <div className="space-y-4">
                  {recentBlogs.slice(0, 5).map((blog) => (
                    <Link 
                      key={blog.id} 
                      to={`/blog/${blog.id}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={blog.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {blog.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{formatDate(blog.date)}</span>
                          <span>•</span>
                          <span>{blog.readTime || getReadingTime(blog.content)} min</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Hash className="text-cyan-400" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => {
                    const count = blogs.filter(blog => blog.category === category).length;
                    if (count === 0) return null;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setCurrentPage(1);
                        }}
                        className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-800/50 transition-all group"
                      >
                        <span className={`${selectedCategory === category ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}>
                          {category}
                        </span>
                        <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-500/30 p-6">
                <div className="text-center">
                  <Newspaper className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Stay Updated</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Get the latest gaming news and tournament updates
                  </p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Your email" 
                      className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-900/10 via-purple-900/10 to-blue-900/10 rounded-3xl p-12 border border-gray-800">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Join Our Gaming Community</h2>
            <p className="text-xl text-gray-400 mb-8">
              Participate in tournaments, share strategies, and connect with fellow gamers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/tournaments"
                className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl transition-all"
              >
                View Tournaments
              </Link>
              <Link 
                to="/leaderboard"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-bold rounded-xl transition-all"
              >
                See Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Detail Page Template */}
      <AnimatePresence>
        {/* This section shows when viewing a single blog post */}
        {/* The actual blog detail page would be at /blog/:id */}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

// Blog Detail Component (for /blog/:id route)
export const BlogDetail = ({ blogId }) => {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchBlogDetail();
  }, [blogId]);

  const fetchBlogDetail = async () => {
    setLoading(true);
    try {
      // Fetch specific blog
      // This would be implemented with a specific blog fetch function
      // For now, we'll filter from all blogs
      const q = query(
        collection(db, "blogs"),
        where("isPublished", "==", true),
        orderBy("timestamp", "desc")
      );
      
      const snap = await getDocs(q);
      const allBlogs = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        date: doc.data().timestamp?.toDate() || new Date()
      }));

      const foundBlog = allBlogs.find(b => b.id === blogId);
      setBlog(foundBlog);

      // Get related blogs (same category)
      if (foundBlog) {
        const related = allBlogs
          .filter(b => b.id !== blogId && b.category === foundBlog.category)
          .slice(0, 3);
        setRelatedBlogs(related);
      }
      
    } catch (error) {
      console.error("Error fetching blog detail:", error);
    }
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    // Implement comment addition logic
    // This would add to Firebase
    alert('Comment feature coming soon!');
    setNewComment('');
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = blog?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-2">Blog Post Not Found</h2>
          <p className="text-gray-500">The blog post you're looking for doesn't exist.</p>
          <Link 
            to="/blog"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-all"
          >
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Navbar />
      
      {/* Blog Hero */}
      <div className="pt-24 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 blur-3xl"></div>
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1.5 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium mb-4">
              {blog.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{formatDate(blog.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{blog.readTime || getReadingTime(blog.content)} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>By {blog.author || 'Zyro Admin'}</span>
              </div>
              {blog.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye size={16} />
                  <span>{blog.views} views</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Featured Image */}
              {blog.image && (
                <div className="rounded-3xl overflow-hidden mb-8">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <article className="prose prose-lg prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed space-y-6">
                  {blog.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </article>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-800">
                  <h3 className="text-xl font-bold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, idx) => (
                      <span key={idx} className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-xl font-bold mb-4">Share this post</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleShare('facebook')}
                    className="p-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl transition-all"
                  >
                    <Facebook size={20} />
                  </button>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="p-3 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-xl transition-all"
                  >
                    <Twitter size={20} />
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="p-3 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl transition-all"
                  >
                    <Linkedin size={20} />
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl transition-all"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Comments Section (Coming Soon) */}
              <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-2xl font-bold mb-6">Comments</h3>
                <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                  <p className="text-gray-400 text-center py-8">
                    Comments feature coming soon!
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Author Card */}
              <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                    <User size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{blog.author || 'Zyro Admin'}</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Gaming enthusiast and tournament organizer
                  </p>
                  <div className="flex justify-center gap-3">
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                      <Twitter size={18} />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                      <Instagram size={18} />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
                      <Youtube size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Posts */}
              {relatedBlogs.length > 0 && (
                <div className="bg-gradient-to-b from-gray-900/50 to-black/50 rounded-2xl border border-gray-800 p-6">
                  <h3 className="text-xl font-bold mb-4">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link 
                        key={relatedBlog.id} 
                        to={`/blog/${relatedBlog.id}`}
                        className="flex items-start gap-3 group"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={relatedBlog.image || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                            alt={relatedBlog.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium group-hover:text-cyan-300 transition-colors line-clamp-2">
                            {relatedBlog.title}
                          </h4>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(relatedBlog.date)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl border border-cyan-500/30 p-6">
                <h3 className="text-xl font-bold mb-3">Never Miss a Post</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Subscribe to get the latest gaming content directly in your inbox
                </p>
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:opacity-90 text-white font-medium py-3 rounded-xl transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;