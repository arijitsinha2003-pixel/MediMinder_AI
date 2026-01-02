
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2, Info, Mic, MicOff, ExternalLink, RotateCcw, BrainCircuit, Sparkles } from 'lucide-react';
import { getHealthGuidance } from '../geminiService';
import { Message, Medicine, AdherenceLog, User } from '../types';

interface HealthChatbotProps {
  user: User;
  medicines: Medicine[];
  logs: AdherenceLog[];
}

const HealthChatbot: React.FC<HealthChatbotProps> = ({ user, medicines, logs }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your AI Health Expert. I have been trained to help you with detailed health questions and medication guidance. How can I assist you in this Q&A session?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => prev + (prev.length > 0 ? ' ' : '') + transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    if (isListening) recognitionRef.current.stop();
    else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start recognition", err);
      }
    }
  };

  const clearChat = () => {
    if (confirm("Reset this Q&A session?")) {
      setMessages([{ role: 'model', text: 'New session started. How can I help you today?' }]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (isListening && recognitionRef.current) recognitionRef.current.stop();

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await getHealthGuidance(input, messages, medicines, logs, user);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text, 
        groundingChunks: response.groundingChunks 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'I am having trouble connecting to my expert knowledge base. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden animate-fade-in">
      {/* Bot Header */}
      <div className="bg-slate-900 dark:bg-slate-900 p-4 flex items-center justify-between text-white border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">Expert AI Assistant</h3>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Professional Q&A Mode
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
          title="Reset Session"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Warning/Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-900/10 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-[10px] text-blue-800 dark:text-blue-500 leading-tight font-bold uppercase">
          Note: This expert assistant uses Google Search grounding. Always verify critical health info with a professional.
        </p>
      </div>

      {/* Chat Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                msg.role === 'user' ? 'bg-white border-blue-100 dark:bg-slate-800 dark:border-slate-700' : 'bg-blue-600 border-blue-500'
              }`}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-blue-600" /> : <Bot className="w-6 h-6 text-white" />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tr-none border border-slate-100 dark:border-slate-700' 
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800'
                }`}>
                  {msg.text}
                </div>
                
                {/* Grounding Sources */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1">
                    {msg.groundingChunks.map((chunk, idx) => chunk.web && (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {chunk.web.title || "Source"}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-3">
              <div className="relative">
                <div className="w-6 h-6 border-2 border-blue-100 dark:border-slate-700 rounded-full"></div>
                <div className="w-6 h-6 border-t-2 border-blue-600 rounded-full absolute inset-0 animate-spin"></div>
              </div>
              <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Consulting Knowledge Base...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        {isListening && (
          <div className="flex items-center justify-center mb-2 space-x-2 text-red-600 animate-pulse">
            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Listening Expert Input...</span>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an expert health question..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
            <button 
              type="button"
              onClick={toggleListening}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 scale-110 shadow-lg' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
          </div>
          <button 
            disabled={loading || !input.trim()}
            className="bg-slate-900 dark:bg-blue-600 text-white p-4 rounded-2xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 dark:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default HealthChatbot;
