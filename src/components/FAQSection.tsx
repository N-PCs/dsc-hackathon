import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Who is eligible to participate?',
    answer:
      'Undergraduate and postgraduate students from any recognized university or college (including VIT Bhopal and external institutes) are eligible. Teams must consist of 2 to 5 members. Last date to register is 2 September 2026.',
  },
  {
    id: 'faq-2',
    question: 'What is the registration fee and team size?',
    answer:
      'Teams must consist of 2 to 5 members. Registration fee is ₹100 per member for Hostellers and ₹219 per member for Day Scholars (Dinner & Food Included). Registrations close strictly on 2 September 2026.',
  },
  {
    id: 'faq-3',
    question: 'Why does the Team Leader need a @vitbhopal.ac.in email?',
    answer:
      'Primary team registration requires a verified campus student email for security and venue access credentials. Teammates can be from any university or email domain.',
  },
  {
    id: 'faq-4',
    question: 'What is the event schedule & timing?',
    answer:
      'The 18-hour event runs from 4 September 6:00 PM to 5 September 12:00 PM at AB02 Auditorium 1 & Auditorium 2. Highlights include Inauguration (6:00 PM), Problem Statement Reveal (6:30 PM), Dinner Break (7:30–8:30 PM), Development (8:30 PM–9:00 AM), Evaluation (9:00–11:00 AM), and Awards (11:00 AM–12:00 PM).',
  },
  {
    id: 'faq-5',
    question: 'Who are the official judges and evaluation criteria?',
    answer:
      'Official evaluation is conducted by Shreyians Coding Academy judges. Projects are scored out of 100 points across 5 pillars (20 pts each): Innovation & Originality, Technical Complexity, UI/UX Design, Pitch & Demo Execution, and Real-World Impact.',
  },
  {
    id: 'faq-6',
    question: 'Can we use pre-existing code?',
    answer:
      'No. All project code must be developed strictly during the 18-hour hackathon window (4 Sep 6:00 PM – 5 Sep 12:00 PM). Open-source packages, libraries, and public APIs are permitted with proper attribution in your GitHub README.',
  },
  {
    id: 'faq-7',
    question: 'What are the prizes and goodies?',
    answer:
      'The total cash prize pool is ₹15,000 (1st Prize: ₹7,000, 2nd Prize: ₹5,000, 3rd Prize: ₹3,000) alongside Goodies worth ₹50,000+, trophies, and digital participation certificates for all submitting teams.',
  },
  {
    id: 'faq-8',
    question: 'Will Wi-Fi, power, and rest zones be provided at the venue?',
    answer:
      'Yes. High-speed dual-band campus Wi-Fi, power sockets at desks, dinner break meals, continuous refreshments, and technical mentor desks will be available at AB02 Auditorium 1 & Auditorium 2.',
  },
];

export const FAQSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const faqRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!faqRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-faq-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }, faqRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="faq-section" ref={faqRef} className="py-24 border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column — heading + contact */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <span className="font-heading text-xs text-[#FF3B00] uppercase tracking-widest block mb-2 font-bold">
                  KNOWLEDGE BASE & FAQ
                </span>
                <h2 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider">
                  FREQUENTLY ASKED QUESTIONS.
                </h2>
              </div>

              <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                Everything about registration, venue logistics, 18-hour rules, 
                payment verification, and jury evaluation.
              </p>

              <div className="pt-4 border-t border-[#222222]">
                <p className="font-heading text-xs text-neutral-400 uppercase tracking-widest mb-3">STILL HAVE QUESTIONS?</p>
                <a
                  href="mailto:dsc.origin@vitbhopal.ac.in"
                  className="inline-flex items-center gap-2 font-heading text-xs font-bold text-[#FF3B00] hover:text-[#FF5511] transition-colors uppercase tracking-widest"
                >
                  CONTACT DSC SUPPORT &gt;
                </a>
              </div>
            </div>
          </div>

          {/* Right column — accordion */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-[#222222]">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div key={faq.id} className="gsap-faq-item bg-[#141414] border border-[#262626] mb-3 px-6 py-2 transition-all">
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full py-4 text-left flex items-start justify-between gap-6 cursor-pointer group"
                    >
                      <span className={`font-display text-xl md:text-2xl transition-colors ${
                          isOpen ? 'text-[#FF3B00]' : 'text-white group-hover:text-[#FF3B00]'
                        }`}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 shrink-0 text-neutral-400 transition-transform duration-300 mt-1 ${
                          isOpen ? 'rotate-180 text-[#FF3B00]' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-60 pb-6 border-t border-[#222222] pt-4' : 'max-h-0'
                      }`}
                    >
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed pr-6">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

