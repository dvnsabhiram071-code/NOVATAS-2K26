import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Tag, MessageCircleQuestion } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FAQSection: React.FC = () => {
  const { faqs } = useApp();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Filter only ACTIVE FAQs and sort by displayOrder
  const activeFaqs = faqs
    .filter(f => f.status === 'ACTIVE')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 relative bg-slate-950 border-t border-slate-900">
      
      {/* Background subtle neon glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 font-bold uppercase">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            EVERYTHING YOU NEED TO KNOW
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-xl mx-auto">
            Got questions regarding volunteer eligibility, event preferences, badge approval, or gate check-in?
          </p>
        </div>

        {/* Dynamic Accordion or Coming Soon Notice */}
        {activeFaqs.length === 0 ? (
          <div className="max-w-md mx-auto p-10 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
              <MessageCircleQuestion className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                FAQ UPDATES COMING SOON
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Official volunteer instructions and FAQs are being updated by the organizing committee.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'border-cyan-500/50 bg-slate-900/90 shadow-lg shadow-cyan-950/30' 
                      : 'border-slate-800/90 hover:border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between space-x-4 focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      {faq.category && (
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider uppercase bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-bold hidden sm:inline-block">
                          {faq.category}
                        </span>
                      )}
                      <span className="font-display font-semibold text-sm sm:text-base text-white tracking-wide">
                        {faq.question}
                      </span>
                    </div>

                    <div className={`p-1.5 rounded-lg bg-slate-800/80 text-cyan-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 bg-cyan-950 text-cyan-300' : ''
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 font-light leading-relaxed border-t border-slate-800/50 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
