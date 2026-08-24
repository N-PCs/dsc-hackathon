import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Cpu, Cloud, Globe, Shield, Terminal, Zap, ExternalLink } from 'lucide-react';

interface Sponsor {
  name: string;
  category: 'title' | 'gold' | 'silver' | 'community';
  tagline: string;
  icon: React.ReactNode;
}

const SPONSORS: Sponsor[] = [
  {
    name: 'ApexCloud AI',
    category: 'title',
    tagline: 'Official Cloud Computing Partner ($25,000 Credits)',
    icon: <Cloud className="w-6 h-6 text-blue-600" />,
  },
  {
    name: 'Nexus ML',
    category: 'title',
    tagline: 'Deep Learning Infrastructure & GPUs',
    icon: <Cpu className="w-6 h-6 text-blue-600" />,
  },
  {
    name: 'DevForge Systems',
    category: 'gold',
    tagline: 'Developer API & Database Platform',
    icon: <Terminal className="w-5 h-5 text-blue-500" />,
  },
  {
    name: 'CyberShield Sec',
    category: 'gold',
    tagline: 'Security & Identity Operations',
    icon: <Shield className="w-5 h-5 text-blue-500" />,
  },
  {
    name: 'QuantVenture Capital',
    category: 'gold',
    tagline: 'Incubation & Seed Investment Fund',
    icon: <Zap className="w-5 h-5 text-blue-500" />,
  },
  {
    name: 'GlobalTech DAO',
    category: 'community',
    tagline: 'Open Source Community Partner',
    icon: <Globe className="w-4 h-4 text-slate-500" />,
  },
];

export const SponsorsSection: React.FC = () => {
  return (
    <section className="py-16 bg-slate-50 border-t border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>POWERED BY INDUSTRY LEADERS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Sponsors & Innovation Partners
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Backed by visionary organizations providing cloud infrastructure, GPU credits, cash prizes, and fast-track hiring opportunities.
          </p>
        </motion.div>

        {/* Title Sponsors Tier */}
        <div className="mb-10">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 mb-4 text-center">
            Title & Infrastructure Sponsors
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {SPONSORS.filter((s) => s.category === 'title').map((sponsor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -3 }}
                className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {sponsor.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {sponsor.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                      TITLE
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{sponsor.tagline}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gold & Community Sponsors Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
            Gold & Ecosystem Partners
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPONSORS.filter((s) => s.category !== 'title').map((sponsor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                whileHover={{ y: -2 }}
                className="bg-white p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow transition-all text-center flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                  {sponsor.icon}
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {sponsor.name}
                </h4>
                <span className="text-[10px] text-slate-500 mt-0.5 truncate max-w-full px-1">
                  {sponsor.tagline}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to sponsor */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-xs text-slate-500"
        >
          Interested in sponsoring ORIGIN '26?{' '}
          <a
            href="mailto:dsc.origin@vitbhopal.ac.in"
            className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Request Sponsorship Prospectus <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
