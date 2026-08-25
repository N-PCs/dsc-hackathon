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
      'Teams must consist of 2 to 5 members. Registration fee is ₹100 per member for Hostellers and ₹219 per member for Day Scholars (Food Included). Registrations close strictly on 2 September 2026.',
  },
  {
    id: 'faq-3',
    question: 'Why does the Team Leader need a @vitbhopal.ac.in email?',
    answer:
      'Primary team registration requires a verified campus student email for security and venue access credentials. Teammates can be from any university or email domain.',
  },
  {
    id: 'faq-4',
    question: 'What happens during the 24-hour sprint?',
    answer:
      'The hackathon kicks off with problem statement releases, followed by intensive hacking, live mentor check-ins, midnight snacks and chill zones, final code freeze, and live jury pitching.',
  },
  {
    id: 'faq-5',
    question: 'How are projects evaluated?',
    answer:
      'Projects are scored out of 100 points across 5 pillars (20 pts each): Innovation & Originality, Technical Complexity, UI/UX Design, Pitch & Demo Execution, and Real-World Impact.',
  },
  {
    id: 'faq-6',
    question: 'Can we use pre-existing code?',
    answer:
      'No. All project code must be developed strictly during the 24-hour window. Open-source packages, libraries, and public APIs are permitted with proper attribution in your GitHub README.',
  },
  {
    id: 'faq-7',
    question: 'How does payment verification work?',
    answer:
      'After submitting your UPI UTR reference and receipt screenshot during registration (calculated based on Hosteller ₹100/member vs Day Scholar ₹219/member with food), DSC Admins verify the transaction and issue your Digital ID Pass.',
  },
  {
    id: 'faq-8',
    question: 'Will hardware, Wi-Fi, and rest zones be provided?',
    answer:
      'Yes. High-speed dual-band campus Wi-Fi, designated rest/sleep areas, continuous refreshments, and technical mentor tables will be available throughout the 24 hours at Auditorium AB02.',
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
    <section id="faq-section" ref={faqRef} className="py-24 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left column — heading + contact */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div>
                <span className="text-[13px] font-mono text-neutral-500 uppercase tracking-wider block mb-3">
                  FAQ
                </span>
                <h2
                  className="text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Frequently asked questions.
                </h2>
              </div>

              <p className="text-[14px] text-neutral-400 leading-relaxed">
                Everything about registration, venue logistics, 24-hour rules, 
                payment verification, and jury evaluation.
              </p>

              <div className="pt-4">
                <p className="text-[13px] text-neutral-500 mb-3">Still have questions?</p>
                <a
                  href="mailto:dsc.origin@vitbhopal.ac.in"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Contact DSC Support
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right column — accordion */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-neutral-800">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = openId === faq.id;
                return (
                  <div key={faq.id} className="gsap-faq-item">
                    <button
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      className="w-full py-6 text-left flex items-start justify-between gap-6 cursor-pointer group"
                    >
                      <span
                        className={`text-[15px] md:text-[16px] font-bold transition-colors ${
                          isOpen ? 'text-orange-500' : 'text-white group-hover:text-neutral-300'
                        }`}
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-neutral-500 transition-transform duration-300 mt-0.5 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? 'max-h-60 pb-6' : 'max-h-0'
                      }`}
                    >
                      <p className="text-[14px] text-neutral-400 leading-relaxed pr-12">
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
