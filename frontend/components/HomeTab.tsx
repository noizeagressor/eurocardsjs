'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Globe, CreditCard, ShieldCheck, Sparkles, ArrowRight, Users,
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { BANKS, DROPS, SERVICES } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface HomeTabProps {
  onSelectProduct: (product: Product) => void;
}

const BANNERS = [
  {
    id: 'iban',
    accent: '#C6FF00',
    accentRgb: '198,255,0',
    bg: '#060900',
    label: 'ЕВРОПЕЙСКИЕ БАНКИ',
    headline: ['ЛИЧНЫЙ', 'IBAN'],
    sub: 'Счёт за 24 часа · Visa · Apple Pay',
    cta: 'Выбрать банк',
    tag: '24ч',
    tagLabel: 'ВЫДАЧА',
    visual: 'card' as const,
  },
  {
    id: 'crypto',
    accent: '#00FFD1',
    accentRgb: '0,255,209',
    bg: '#000a07',
    label: 'КРИПТО → ФИАТ',
    headline: ['НУЛЕВЫЕ', 'ПОТЕРИ'],
    sub: 'USDC · USDT · Polygon · 5 минут',
    cta: 'Открыть карту',
    tag: '~0%',
    tagLabel: 'КОМИССИЯ',
    visual: 'crypto' as const,
  },
  {
    id: 'ref',
    accent: '#FF4D6D',
    accentRgb: '255,77,109',
    bg: '#0a0003',
    label: 'РЕФЕРАЛЬНАЯ ПРОГРАММА',
    headline: ['2 000 ₽', 'ЗА ДРУГА'],
    sub: 'Без лимита · Мгновенно · Навсегда',
    cta: 'Участвовать',
    tag: '∞',
    tagLabel: 'ЛИМИТ',
    visual: 'txns' as const,
  },
];

export function HomeTab({ onSelectProduct }: HomeTabProps) {
  const [active, setActive] = useState(0);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('banks');
  const touchX = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((i: number) => {
    if (timer.current) clearInterval(timer.current);
    setActive(i);
    try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
    timer.current = setInterval(() => setActive(p => (p + 1) % BANNERS.length), 4800);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => setActive(p => (p + 1) % BANNERS.length), 4800);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const toggleCategory = (id: string) => {
    try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
    setExpandedCategory(p => p === id ? null : id);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;700&display=swap');
        .ec-bb { font-family: 'Bebas Neue', sans-serif; }
        .ec-sg { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">

        {/* ══ HERO CAROUSEL ══ */}
        <section className="mt-4 px-4">
          <div
            className="relative overflow-hidden"
            style={{ aspectRatio: '16/9', borderRadius: 24 }}
            onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const d = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(d) > 40) go((active + (d < 0 ? 1 : -1) + BANNERS.length) % BANNERS.length);
            }}
          >
            <AnimatePresence mode="wait">
              <BannerSlide key={BANNERS[active].id} b={BANNERS[active]} />
            </AnimatePresence>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {BANNERS.map((_, i) => (
                <button key={i} onClick={() => go(i)} style={{
                  width: i === active ? 28 : 7, height: 7, borderRadius: 4,
                  background: i === active ? BANNERS[active].accent : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: i === active ? `0 0 10px ${BANNERS[active].accent}` : 'none',
                }} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ CATALOGUE ══ */}
        <section className="mt-6 px-4">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full" />
            Каталог
          </h2>
          <CategoryAccordion name="Банки на РФ загран" subtitle="Европейские IBAN карты"
            icon={<CreditCard className="w-5 h-5 text-primary" />}
            isExpanded={expandedCategory === 'banks'} onToggle={() => toggleCategory('banks')}
            products={BANKS} onSelectProduct={onSelectProduct} />
          <CategoryAccordion name="Банки на дропов" subtitle="Готовые решения"
            icon={<Globe className="w-5 h-5 text-primary" />}
            isExpanded={expandedCategory === 'drops'} onToggle={() => toggleCategory('drops')}
            products={DROPS} onSelectProduct={onSelectProduct} />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {SERVICES.map(svc => (
              <button key={svc.id} onClick={() => { try { WebApp.HapticFeedback.impactOccurred('light'); } catch {} onSelectProduct(svc); }}
                className="glass-card p-4 rounded-xl text-left active:scale-95 transition-transform">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <p className="font-bold text-sm text-white">{svc.name}</p>
                <p className="text-[10px] text-slate-400">{svc.tag}</p>
              </button>
            ))}
            <div className="glass-card p-4 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <p className="font-bold text-sm text-white">Скоро</p>
              <p className="text-[10px] text-slate-400">Новые сервисы</p>
            </div>
          </div>
        </section>

        {/* ══ AFFILIATE ══ */}
        <section className="mt-8 px-4 pb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 relative overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-1 relative z-10">Партнёрская программа</h3>
            <p className="text-sm text-slate-300 mb-4 relative z-10">Приглашай друзей и получай 2 000 ₽ за каждого.</p>
            <button className="flex items-center gap-2 bg-white/10 text-white text-xs font-bold py-2 px-4 rounded-lg border border-white/10 relative z-10">
              Подробнее <ArrowRight className="w-4 h-4" />
            </button>
            <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-10" />
          </div>
        </section>
      </motion.main>
    </>
  );
}

/* ════════════════════════════════
   BANNER SLIDE SHELL
════════════════════════════════ */
function BannerSlide({ b }: { b: typeof BANNERS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute inset-0 overflow-hidden"
      style={{ background: b.bg }}
    >
      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.011) 2px,rgba(255,255,255,0.011) 3px)' }} />

      {/* Ambient glow right side */}
      <motion.div className="absolute pointer-events-none"
        style={{ width: '60%', height: '120%', top: '-10%', right: '-8%', background: `radial-gradient(ellipse, rgba(${b.accentRgb},.18) 0%, transparent 65%)` }}
        animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Bottom edge line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg,transparent,${b.accent}88,transparent)` }} />

      {/* Right-side fintech visual */}
      <div className="absolute right-0 top-0 bottom-0 w-[52%] overflow-hidden">
        {b.visual === 'card'   && <CardVisual accent={b.accent} accentRgb={b.accentRgb} />}
        {b.visual === 'crypto' && <CryptoVisual accent={b.accent} accentRgb={b.accentRgb} />}
        {b.visual === 'txns'   && <TxnVisual accent={b.accent} accentRgb={b.accentRgb} />}
      </div>

      {/* Text content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-5 pb-12 pointer-events-none" style={{ width: '55%' }}>
        {/* Status dot + label */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-2">
          <motion.div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: b.accent, boxShadow: `0 0 8px ${b.accent}` }}
            animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <span className="ec-sg text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: b.accent }}>
            {b.label}
          </span>
        </motion.div>

        {/* Headline + sub + CTA */}
        <div>
          <div style={{ overflow: 'hidden' }}>
            {b.headline.map((line, i) => (
              <motion.div key={line} className="ec-bb block leading-none"
                initial={{ y: 64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.09 + i * 0.11, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(36px, 10.5vw, 50px)',
                  color: i === 0 ? '#fff' : b.accent,
                  textShadow: i === 1 ? `0 0 36px rgba(${b.accentRgb},.7), 0 0 80px rgba(${b.accentRgb},.22)` : '0 2px 16px rgba(0,0,0,.6)',
                  letterSpacing: '0.01em',
                }}>{line}</motion.div>
            ))}
          </div>
          <motion.p className="ec-sg mt-1.5 mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
            style={{ fontSize: 9.5, color: 'rgba(255,255,255,.38)', letterSpacing: '0.06em' }}>{b.sub}</motion.p>
          <motion.button
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
            whileTap={{ scale: 0.93 }}
            className="ec-sg relative overflow-hidden inline-flex items-center gap-1.5 pointer-events-auto"
            style={{ fontSize: 11, fontWeight: 700, padding: '8px 16px', borderRadius: 10, background: b.accent, color: b.bg, boxShadow: `0 0 24px rgba(${b.accentRgb},.55)` }}
          >
            <motion.span className="absolute inset-0"
              style={{ background: 'linear-gradient(105deg,transparent 30%,rgba(255,255,255,.38) 50%,transparent 70%)' }}
              animate={{ x: ['-110%', '210%'] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }} />
            <span className="relative z-10">{b.cta}</span>
            <ArrowRight className="w-3.5 h-3.5 relative z-10" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════
   VISUAL 1 — Credit Card
   Floating 3D-ish card with chip,
   contactless, number, shimmer
════════════════════════════════ */
function CardVisual({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ paddingRight: 8, paddingTop: 8 }}>
      {/* Outer glow halo */}
      <div className="absolute rounded-2xl pointer-events-none"
        style={{ inset: '12%', background: `radial-gradient(ellipse, rgba(${accentRgb},.14) 0%, transparent 70%)`, filter: 'blur(4px)' }} />

      {/* Card body */}
      <motion.div
        animate={{ y: [0, -7, 0], rotateX: [2, 5, 2], rotateZ: [-1, 1, -1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: '86%', aspectRatio: '85.6/53.98',
          borderRadius: 14,
          background: `linear-gradient(135deg, #1c2800 0%, #0e1600 50%, #080d00 100%)`,
          border: `1px solid rgba(${accentRgb},.35)`,
          boxShadow: `0 24px 60px rgba(0,0,0,.7), 0 0 40px rgba(${accentRgb},.14), inset 0 1px 0 rgba(${accentRgb},.2)`,
          position: 'relative', overflow: 'hidden',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shimmer sweep */}
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg,transparent 25%,rgba(255,255,255,.07) 50%,transparent 75%)' }}
          animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2.8, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' }} />

        {/* Background pattern — subtle grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(rgba(${accentRgb},1) 1px,transparent 1px),linear-gradient(90deg,rgba(${accentRgb},1) 1px,transparent 1px)`, backgroundSize: '18px 18px' }} />

        {/* Chip */}
        <div className="absolute" style={{ top: '20%', left: '8%', width: '16%', aspectRatio: '1.4', borderRadius: 4, background: `linear-gradient(135deg,rgba(${accentRgb},.7),rgba(${accentRgb},.25))`, border: `1px solid rgba(${accentRgb},.5)` }}>
          {/* chip lines */}
          <div className="absolute inset-0 flex flex-col justify-evenly px-0.5">
            {[0,1,2].map(i => <div key={i} style={{ height: 1, background: `rgba(${accentRgb},.4)` }} />)}
          </div>
        </div>

        {/* Contactless SVG */}
        <div className="absolute" style={{ top: '16%', right: '8%', opacity: 0.45 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2 Q19 7 19 12 Q19 17 12 22" stroke={accent} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M12 6 Q17 9.5 17 12 Q17 14.5 12 18" stroke={accent} strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M12 10 Q15 11.2 15 12 Q15 12.8 12 14" stroke={accent} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Brand mark top-left */}
        <div className="absolute ec-bb" style={{ top: '15%', left: '8%', paddingLeft: '22%', fontSize: 9, color: `rgba(${accentRgb},.5)`, letterSpacing: '0.15em' }}>EUROCARDS</div>

        {/* Card number */}
        <div className="absolute ec-bb" style={{ bottom: '32%', left: '8%', fontSize: 9, letterSpacing: '0.22em', color: `rgba(${accentRgb},.75)` }}>
          4821 •••• •••• 6234
        </div>

        {/* Holder + expiry */}
        <div className="absolute flex justify-between items-end" style={{ bottom: '10%', left: '8%', right: '8%' }}>
          <div>
            <div className="ec-sg" style={{ fontSize: 5, color: `rgba(${accentRgb},.4)`, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Card holder</div>
            <div className="ec-sg" style={{ fontSize: 7, color: `rgba(${accentRgb},.8)`, fontWeight: 700, letterSpacing: '0.06em' }}>YOUR NAME</div>
          </div>
          <div className="text-right">
            <div className="ec-sg" style={{ fontSize: 5, color: `rgba(${accentRgb},.4)`, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Expires</div>
            <div className="ec-sg" style={{ fontSize: 7, color: `rgba(${accentRgb},.8)`, fontWeight: 700 }}>12/28</div>
          </div>
          {/* Visa logo circles */}
          <div className="flex items-center" style={{ gap: -4 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,80,0,.7)' }} />
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,160,0,.7)', marginLeft: -6 }} />
          </div>
        </div>

        {/* Accent glow strip bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }} />
      </motion.div>

      {/* Card shadow */}
      <div className="absolute" style={{ bottom: '6%', left: '10%', right: '10%', height: 20, borderRadius: '50%', background: `rgba(${accentRgb},.18)`, filter: 'blur(14px)' }} />
    </div>
  );
}

/* ════════════════════════════════
   VISUAL 2 — Crypto Coins Stack
   USDC + USDT coins floating,
   price ticker, chain dots
════════════════════════════════ */
function CryptoVisual({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  const coins = [
    { label: 'USDC', color: '#2775CA', light: '#5599ee', y: 0, delay: 0 },
    { label: 'USDT', color: '#26A17B', light: '#40c99b', y: 1, delay: 0.4 },
    { label: 'MATIC', color: '#8247E5', light: '#a672ff', y: 2, delay: 0.8 },
  ];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ paddingTop: 6, paddingRight: 6 }}>
      {/* Coins */}
      {coins.map((c, i) => (
        <motion.div key={c.label}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
          className="flex items-center gap-2.5"
          style={{ width: '80%', padding: '7px 10px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(6px)' }}
        >
          {/* Coin circle */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${c.light}, ${c.color})`, boxShadow: `0 0 10px ${c.color}66`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="ec-bb" style={{ fontSize: 8, color: '#fff', letterSpacing: '0.05em' }}>{c.label[0]}</span>
          </div>
          {/* Label + amount */}
          <div className="flex-1 min-w-0">
            <div className="ec-sg" style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{c.label}</div>
            <div className="ec-sg" style={{ fontSize: 7, color: 'rgba(255,255,255,.35)' }}>Stablecoin</div>
          </div>
          {/* Live price tag */}
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 1.8, repeat: Infinity, delay: c.delay }}
            className="ec-sg text-right" style={{ fontSize: 8, fontWeight: 700, color: accent }}>
            $1.00
          </motion.div>
        </motion.div>
      ))}

      {/* Chain connector dots */}
      <div className="flex items-center gap-1.5" style={{ marginTop: 4 }}>
        {['POL', 'ETH', 'TRX'].map((chain, i) => (
          <motion.div key={chain}
            animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45 }}
            className="ec-sg flex items-center gap-1"
            style={{ fontSize: 7, color: `rgba(${accentRgb},.7)`, background: `rgba(${accentRgb},.08)`, border: `1px solid rgba(${accentRgb},.2)`, borderRadius: 6, padding: '2px 6px', fontWeight: 700 }}
          >
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, boxShadow: `0 0 6px ${accent}` }} />
            {chain}
          </motion.div>
        ))}
      </div>

      {/* "→ Fiat" arrow with glow */}
      <motion.div
        animate={{ x: [0, 4, 0], opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="ec-bb flex items-center gap-1.5"
        style={{ fontSize: 14, color: accent, letterSpacing: '0.06em', textShadow: `0 0 20px rgba(${accentRgb},.8)` }}
      >
        → FIAT
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════
   VISUAL 3 — Transaction Feed
   Animated incoming txn rows
   with amounts + status dots
════════════════════════════════ */
const TXN_DATA = [
  { name: 'Алексей К.', amount: '+2 000 ₽', icon: '👤', delay: 0 },
  { name: 'Мария Л.',   amount: '+2 000 ₽', icon: '👤', delay: 0.7 },
  { name: 'Дмитрий В.', amount: '+2 000 ₽', icon: '👤', delay: 1.4 },
  { name: 'Анна С.',    amount: '+2 000 ₽', icon: '👤', delay: 2.1 },
];

function TxnVisual({ accent, accentRgb }: { accent: string; accentRgb: string }) {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setVisibleCount(c => c < TXN_DATA.length ? c + 1 : 1), 1200);
    return () => clearInterval(id);
  }, []);

  // Running total
  const total = visibleCount * 2000;

  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2" style={{ padding: '10px 8px 10px 4px' }}>

      {/* Total earned card */}
      <motion.div
        animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ background: `rgba(${accentRgb},.1)`, border: `1px solid rgba(${accentRgb},.3)`, borderRadius: 12, padding: '7px 10px', marginBottom: 4 }}
      >
        <div className="ec-sg" style={{ fontSize: 8, color: `rgba(${accentRgb},.65)`, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заработано сегодня</div>
        <div className="ec-bb" style={{ fontSize: 22, color: accent, letterSpacing: '0.02em', textShadow: `0 0 20px rgba(${accentRgb},.6)` }}>
          {total.toLocaleString('ru-RU')} ₽
        </div>
      </motion.div>

      {/* Transaction rows */}
      <div className="flex flex-col gap-1.5" style={{ overflow: 'hidden' }}>
        <AnimatePresence>
          {TXN_DATA.slice(0, visibleCount).map((t, i) => (
            <motion.div key={t.name + i}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.38, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '5px 8px' }}
            >
              {/* Status dot */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, flexShrink: 0 }} />
              <div className="ec-sg" style={{ fontSize: 9, color: 'rgba(255,255,255,.75)', flex: 1 }}>{t.name}</div>
              <div className="ec-sg" style={{ fontSize: 9, fontWeight: 700, color: accent }}>{t.amount}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* "Invite → earn" hint */}
      <motion.div
        animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
        className="ec-sg text-center" style={{ fontSize: 8, color: `rgba(${accentRgb},.5)`, letterSpacing: '0.1em', marginTop: 2 }}>
        ПРИГЛАСИ · ПОЛУЧАЙ · ПОВТОРЯЙ
      </motion.div>
    </div>
  );
}

/* ── Catalogue accordion ── */
function CategoryAccordion({ name, subtitle, icon, isExpanded, onToggle, products, onSelectProduct }: {
  name: string; subtitle: string; icon: React.ReactNode;
  isExpanded: boolean; onToggle: () => void;
  products: Product[]; onSelectProduct: (p: Product) => void;
}) {
  return (
    <div className="mb-4">
      <button onClick={onToggle} className={`w-full flex items-center justify-between p-4 rounded-xl glass-effect transition-all ${isExpanded ? 'border-primary/30 active-glow' : 'border-white/5'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">{icon}</div>
          <div className="text-left">
            <p className="font-bold text-white">{name}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="grid grid-cols-1 gap-3 mt-3">
              {products.map(p => (
                <div key={p.id} className="glass-effect p-3 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-8 rounded bg-gradient-to-br ${p.badgeColors} flex items-center justify-center text-[8px] font-bold text-white tracking-widest border flex-shrink-0`}>{p.badge}</div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white leading-tight truncate">{p.name}</h4>
                      <p className="text-[10px] text-primary truncate">{p.tag}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs font-bold text-white whitespace-nowrap">{p.price.toLocaleString('ru-RU')} ₽</p>
                    <button onClick={() => { try { WebApp.HapticFeedback.impactOccurred('light'); } catch {} onSelectProduct(p); }}
                      className="bg-primary hover:bg-primary/90 text-surface text-xs font-bold px-3 py-2 rounded-lg transition-colors active:scale-95">Заказать</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
