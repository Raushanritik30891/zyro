import React from 'react';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white font-body pb-20 overflow-x-hidden">
      <Navbar />
      <div className="pt-32 px-4 max-w-4xl mx-auto relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-gaming font-black italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 uppercase tracking-tighter">PRIVACY POLICY</h1>
          <p className="text-gray-500 font-gaming tracking-[0.4em] text-xs mt-4 uppercase">YOUR DATA IS SECURE WITH US</p>
        </div>

        <div className="space-y-8">
            <Section icon={<Database className="text-green-500"/>} title="Data Collection">
                We collect minimal data required for tournament participation: Name, Email, Game UID, and Payment Proofs. This data is encrypted and stored securely on Google Firebase servers.
            </Section>

            <Section icon={<Eye className="text-blue-500"/>} title="Data Usage">
                Your data is used solely for verification, leaderboard ranking, and prize distribution. We do not sell or share your personal information with third-party advertisers.
            </Section>

            <Section icon={<Lock className="text-yellow-500"/>} title="Security">
                We implement industry-standard security protocols including SSL encryption and secure payment gateways to protect your information from unauthorized access.
            </Section>

            <Section icon={<ShieldCheck className="text-rosePink"/>} title="User Rights">
                You have the right to request deletion of your account and data at any time by contacting our support team at support@zyroesports.com.
            </Section>
        </div>

        <div className="mt-12 text-center text-gray-600 text-xs">
            Last Updated: January 2024 • Zyro Esports Legal Team
        </div>

      </div>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
    <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl hover:border-white/20 transition-all">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
            <h3 className="text-xl font-gaming font-black text-white uppercase">{title}</h3>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
);

export default Privacy;