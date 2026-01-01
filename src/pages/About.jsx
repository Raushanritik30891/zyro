import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trophy, Target, Users, Zap, Award } from 'lucide-react';

const About = () => {
  const features = [
    { icon: <ShieldCheck className="text-rosePink" />, title: "Secure Play", desc: "Anti-cheat systems & verified players only." },
    { icon: <Trophy className="text-yellow-400" />, title: "Daily Scrims", desc: "Compete every day to improve your skills." },
    { icon: <Zap className="text-cyan-400" />, title: "AI Powered", desc: "Automated leaderboard & results scanning." },
  ];

  return (
    <div className="min-h-screen bg-voidBlack text-white pt-32 pb-20 px-4 font-body">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-gaming font-black italic tracking-tighter mb-6">
            BEYOND <span className="text-rosePink">GAMING</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Zyro Esports isn't just a platform; it's a movement. Born from the fires of competitive spirit, we empower players to become legends.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl text-center"
            >
              <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rosePink/10">
                {f.icon}
              </div>
              <h3 className="font-gaming text-xl mb-3 uppercase tracking-wider">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* The Vision Section */}
        <div className="glass-panel-dark p-10 rounded-[3rem] border border-rosePink/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rosePink/10 blur-[100px] rounded-full"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-gaming font-black mb-6 italic text-transparent bg-clip-text bg-gradient-to-r from-white to-rosePink">OUR VISION</h2>
              <p className="text-gray-400 leading-loose mb-6 text-sm">
                We believe in the "Black Goku" philosophy—constantly breaking limits and evolving. Our platform is designed to give every mobile gamer the tools they need to enter the pro scene.
              </p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-3xl font-gaming text-rosePink">10K+</div>
                  <div className="text-[10px] text-gray-500 uppercase">Players</div>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center">
                  <div className="text-3xl font-gaming text-rosePink">500+</div>
                  <div className="text-[10px] text-gray-500 uppercase">Tournaments</div>
                </div>
              </div>
            </div>
            <div className="bg-black/50 p-4 rounded-3xl border border-white/5">
                <img src="https://images.alphacoders.com/132/1328396.png" className="rounded-2xl opacity-80 grayscale hover:grayscale-0 transition-all duration-700" alt="Vision" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;