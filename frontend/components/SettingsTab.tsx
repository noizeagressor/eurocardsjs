'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

interface ChatMessage {
  text: string;
  isBot: boolean;
}

export function SettingsTab() {
  let avatar = '';
  let firstName = 'User';
  let username = '';
  try {
    avatar = WebApp.initDataUnsafe?.user?.photo_url || '';
    firstName = WebApp.initDataUnsafe?.user?.first_name || 'User';
    username = WebApp.initDataUnsafe?.user?.username || '';
  } catch {}

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: 'Привет! Я помощник EuroCards. Чем могу помочь?', isBot: true },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { text: chatInput, isBot: false }]);
    setChatInput('');
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: 'Спасибо за сообщение! Менеджер свяжется с вами в ближайшее время.', isBot: true },
      ]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-8 text-center max-w-md mx-auto"
    >
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full border-[3px] border-primary overflow-hidden mb-4 mx-auto">
        <img
          src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
          className="w-full h-full object-cover"
          alt="avatar"
        />
      </div>
      <h2 className="text-2xl font-extrabold text-white">{firstName}</h2>
      {username && (
        <p className="text-sm text-slate-500 mt-1">@{username}</p>
      )}

      {/* Chat Section */}
      <div className="glass-card rounded-2xl p-4 mt-8 text-left">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
          Поддержка
        </h3>
        <div className="h-[200px] overflow-y-auto mb-4 flex flex-col gap-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                msg.isBot
                  ? 'bg-primary text-surface self-start font-medium'
                  : 'bg-white/10 text-white self-end'
              }`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="relative">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ваш вопрос..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-white outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600"
          />
          <button
            onClick={handleSendMessage}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pb-28" />
    </motion.div>
  );
}
