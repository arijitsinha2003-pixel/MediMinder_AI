
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquareHeart, ExternalLink, Info, ShieldCheck, Brain, Calendar, Pill, Mail } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const Support: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      icon: <Pill className="w-5 h-5 text-blue-500" />,
      question: "How do I add a new medicine?",
      answer: "Navigate to the 'Meds' tab using the bottom menu. Click the '+ Add New' button at the top right. Enter the name, dosage, and frequency. You can even add multiple specific times for medications taken several times a day."
    },
    {
      icon: <Brain className="w-5 h-5 text-purple-500" />,
      question: "How accurate is the AI Health Assistant?",
      answer: "Our AI is powered by Google Gemini and is context-aware, meaning it knows your current medications. However, it is designed for informational purposes only. Always consult a healthcare professional for clinical decisions."
    },
    {
      icon: <Calendar className="w-5 h-5 text-pink-500" />,
      question: "How does 'Sync to Calendar' work?",
      answer: "When you click 'Sync to Calendar' on a medicine card, we generate a special link that adds recurring reminders to your Google Calendar. This helps you get notifications on all your devices, including smartwatches."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-green-500" />,
      question: "Is my medical data private?",
      answer: "Yes. Your data is stored locally on your device and is not shared with third parties. Our AI analysis is performed using secure protocols that protect your identity."
    },
    {
      icon: <Info className="w-5 h-5 text-amber-500" />,
      question: "What should I do if I miss a dose?",
      answer: "Mark the dose as 'Missed' in your dashboard to keep your adherence logs accurate. You can ask the AI Assistant for specific advice on whether to take a late dose, based on your specific medication."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Help & Feedback</h2>
        <p className="text-sm text-slate-500 mt-1">Get support and help us improve MediMinder AI</p>
      </header>

      {/* Feedback Section */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
              <MessageSquareHeart className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Shape Our Future</h3>
          </div>
          <p className="text-blue-100 text-sm mb-8 max-w-sm leading-relaxed font-medium">
            Your feedback drives our development. Please share your thoughts, feature requests, or bug reports via our official feedback form.
          </p>
          <a 
            href="https://forms.gle/qGC2GEc51uhFEWp79" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-3 bg-white text-blue-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95 group/btn"
            aria-label="Open Google Feedback Form"
          >
            <span>Open Feedback Form</span>
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </a>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-colors"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2 mb-6">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-white border transition-all rounded-[1.5rem] overflow-hidden ${openIndex === idx ? 'border-blue-200 shadow-md' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <button 
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-[1.5rem]"
                aria-expanded={openIndex === idx}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl transition-colors ${openIndex === idx ? 'bg-blue-50' : 'bg-slate-50'}`}>
                    {faq.icon}
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{faq.question}</span>
                </div>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              <div 
                className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="pl-14 pr-4">
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Direct Contact Footer */}
      <footer className="p-10 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h4 className="text-lg font-bold text-slate-900 mb-2">Still have questions?</h4>
        <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto font-medium">
          Our developer and support team is ready to help you with any inquiries.
        </p>
        
        <div className="space-y-4">
          <a 
            href="mailto:arijitsinha2003@gmail.com" 
            className="inline-flex flex-col items-center group"
          >
            <span className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mb-2">
              Email MediMinder AI Team
            </span>
            <span className="text-xs text-blue-600 font-bold group-hover:underline decoration-2 underline-offset-4 transition-all">
              arijitsinha2003@gmail.com
            </span>
          </a>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Typical response time: Within 24 Hours
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Support;
