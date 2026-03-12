'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, ExternalLink } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { api } from '@/lib/api';
import type { ReferralStats } from '@/lib/types';

export function BonusesTab() {
  const [stats, setStats] = useState<ReferralStats>({
    invited_count: 0,
    confirmed_count: 0,
    earnings: 0,
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/v1/users/me/referrals');
        setStats(res.data);
      } catch (e) {
        console.error('Fetch referral stats failed', e);
      }
    };
    fetchStats();
  }, []);

  let userId = 0;
  try {
    userId = WebApp.initDataUnsafe?.user?.id || 0;
  } catch {}

  const referralLink = `https://t.me/EuroCardsBot?start=${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      try { WebApp.HapticFeedback.notificationOccurred('success'); } catch {}
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    try {
      WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
          'Оформи карту в EuroCards и получи бонус!',
        )}`,
      );
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-8 max-w-md mx-auto"
    >
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-2xl p-8 mb-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-5xl font-extrabold text-primary tracking-tighter">
            2 000 ₽
          </div>
          <p className="text-sm font-bold uppercase mt-2 text-white">
            за каждого друга
          </p>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-white">
            {stats.invited_count}
          </div>
          <div className="text-[10px] opacity-40 uppercase font-bold mt-1">
            Приглашено
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">
            {stats.earnings.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-[10px] opacity-40 uppercase font-bold mt-1">
            Заработано
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="glass-card rounded-xl p-4 mb-4">
        <p className="text-xs text-slate-500 uppercase font-bold mb-2">
          Ваша реферальная ссылка
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs text-slate-300 truncate font-mono">
            {referralLink}
          </div>
          <button
            onClick={handleCopyLink}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              copied ? 'bg-primary text-surface' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="w-full h-14 bg-primary text-surface font-black text-base rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)]"
      >
        <ExternalLink className="w-5 h-5" />
        Пригласить друга
      </button>

      {/* How it works */}
      <div className="mt-8 pb-24">
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">
          Как это работает
        </h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Отправьте ссылку другу' },
            { step: '2', text: 'Друг оформляет и оплачивает карту' },
            { step: '3', text: 'Вы получаете 2 000 ₽ на баланс' },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4 glass-card p-3 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-white font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
