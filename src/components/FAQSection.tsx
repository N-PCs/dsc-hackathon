import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Sparkles, MessageSquare, Search, Filter } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'general' | 'registration' | 'schedule' | 'judging';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'Who is eligible to participate in ORIGIN Overnight Hackathon?',
    answer:
      'Undergraduate and postgraduate students from any recognized university or college (including VIT Bhopal and external institutes) are eligible to participate. High school students or recent graduates can join as team members.',
  },
  {
    id: 'faq-2',
    category: 'registration',
    question: 'What is the required team size and registration fee?',
    answer:
      'Teams can consist of 1 to 4 members. Solo builders are fully welcome. The registration fee is ₹200 per team, covering venue access, 24-hour Wi-Fi, compute credits, meals, snacks, and official DSC swag kits.',
  },
  {
    id: 'faq-3',
    category: 'registration',
    question: 'Why does the Team Leader need a @vitbhopal.ac.in email?',
    answer:
      'Primary team registration requires a verified campus student email for security and venue access credentials. Teammates can be from any university or email domain.',
  },
  {
    id: 'faq-4',
    category: 'schedule',
    question: 'What happens during the 24-hour overnight sprint?',
    answer:
      'The hackathon kicks off at 12:00 PM with problem statement releases, followed by intensive hacking, live mentor check-ins at 06:00 PM and midnight, midnight snacks/chill zones, final code freeze at 11:00 AM, and live jury pitching.',
  },
  {
    id: 'faq-5',
    category: 'judging',
    question: 'How are projects evaluated by the Jury?',
    answer:
      'Projects are scored out of 100 points across 5 pillars (20 pts each): Innovation & Originality, Technical Complexity & Architecture, UI/UX Design, Pitch & Live Demo Execution, and Real-World Impact.',
  },
  {
    id: 'faq-6',
    category: 'judging',
    question: 'Can we submit pre-existing projects or code written before the hackathon?',
    answer:
      'No. All project code must be developed strictly during the 24-hour hacking window. You are free to use open-source packages, libraries, and public APIs, provided they are attributed in your GitHub README.',
  },
  {
    id: 'faq-7',
    category: 'schedule',
    question: 'How does payment verification and the Digital ID Pass work?',
    answer:
      'After submitting your UPI UTR reference and receipt screenshot during registration, DSC Admins verify the transaction and issue your official Digital ID Pass with QR code for gate check-in and food coupons.',
  },
  {
    id: 'faq-8',
    category: 'general',
    question: 'Will hardware, Wi-Fi, and rest zones be provided at the venue?',
    answer:
      'Yes! High-speed dual-band campus Wi-Fi, designated rest/sleep areas, continuous refreshments, and technical mentor tables will be available throughout the 24 hours at Auditorium AB02.',
  },
];

export const FAQSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono font-semibold mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-3">
          Got Questions? We Have Answers.
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
          Everything you need to know about team registration, venue logistics, 24-hour rules, payment verification, and jury evaluation.
        </p>
      </motion.div>

      {/* Controls: Search & Category Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Input */}
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General & Eligibility' },
            { id: 'registration', label: 'Registration & Team' },
            { id: 'schedule', label: 'Schedule & Venue' },
            { id: 'judging', label: 'Judging & Rules' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-bold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3.5">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 text-slate-500 text-xs">
            No matching questions found for "{searchQuery}".
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={`bg-white border rounded-2xl transition-all overflow-hidden ${
                  isOpen
                    ? 'border-blue-300 shadow-md ring-1 ring-blue-100'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer group"
                >
                  <span className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-blue-50 text-blue-600 rotate-180'
                        : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 font-normal">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer assistance card */}
      <div className="mt-12 p-6 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Still have questions?</h4>
            <p className="text-xs text-slate-600">
              Reach out directly to the Data Science Club organizing committee.
            </p>
          </div>
        </div>
        <a
          href="mailto:dsc.origin@vitbhopal.ac.in"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all whitespace-nowrap"
        >
          Contact DSC Support
        </a>
      </div>
    </div>
  );
};
