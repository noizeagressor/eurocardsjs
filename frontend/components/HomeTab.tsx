'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, Globe, CreditCard, ShieldCheck,
  Sparkles, ArrowRight, Users,
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { BANKS, DROPS, SERVICES } from '@/lib/constants';
import type { Product } from '@/lib/types';

interface HomeTabProps {
  onSelectProduct: (product: Product) => void;
}

export function HomeTab({ onSelectProduct }: HomeTabProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('banks');

  const toggleCategory = (id: string) => {
    try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
    setExpandedCategory((prev) => (prev === id ? null : id));
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      {/* ===== HERO CAROUSEL ===== */}
      <section className="mt-4">
        <div className="flex overflow-x-auto px-4 gap-4 snap-x snap-mandatory scrollbar-hide">
          <HeroSlide
            badge="Hot"
            badgeClass="bg-primary text-surface"
            title="Европейские банки"
            subtitle="Личный IBAN за 24 часа"
            gradientFrom="from-emerald-900/80"
          />
          <HeroSlide
            badge="Новинка"
            badgeClass="bg-primary/20 text-primary border border-primary/30"
            title="Крипто → Фиат"
            subtitle="Виртуальные карты мгновенно"
            gradientFrom="from-blue-900/80"
          />
          <HeroSlide
            badge="2 000 ₽"
            badgeClass="bg-primary text-surface"
            title="Приведи друга"
            subtitle="И получи бонус за каждого"
            gradientFrom="from-purple-900/80"
          />
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mt-8 px-4">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          Каталог
        </h2>

        {/* Банки на РФ загран */}
        <CategoryAccordion
          name="Банки на РФ загран"
          subtitle="Европейские IBAN карты"
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          isExpanded={expandedCategory === 'banks'}
          onToggle={() => toggleCategory('banks')}
          products={BANKS}
          onSelectProduct={onSelectProduct}
        />

        {/* Банки на дропов */}
        <CategoryAccordion
          name="Банки на дропов"
          subtitle="Готовые решения"
          icon={<Globe className="w-5 h-5 text-primary" />}
          isExpanded={expandedCategory === 'drops'}
          onToggle={() => toggleCategory('drops')}
          products={DROPS}
          onSelectProduct={onSelectProduct}
        />

        {/* 2-col grid: Services + Coming Soon */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {SERVICES.map((svc) => (
            <button
              key={svc.id}
              onClick={() => {
                try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
                onSelectProduct(svc);
              }}
              className="glass-card p-4 rounded-xl text-left active:scale-95 transition-transform"
            >
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

      {/* ===== AFFILIATE PROMO ===== */}
      <section className="mt-8 px-4 pb-8">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-transparent border border-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1">Партнёрская программа</h3>
            <p className="text-sm text-slate-300 mb-4">
              Приглашай друзей и получай 2 000 ₽ за каждого.
            </p>
            <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-4 rounded-lg border border-white/10 transition-colors">
              Подробнее <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-primary opacity-10" />
        </div>
      </section>
    </motion.main>
  );
}

/* ───────── Sub-components ───────── */

function HeroSlide({
  badge, badgeClass, title, subtitle, gradientFrom,
}: {
  badge: string;
  badgeClass: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
}) {
  return (
    <div className="min-w-[85%] snap-center relative aspect-[16/9] rounded-2xl overflow-hidden flex-shrink-0">
      {/* Decorative background */}
      <div className={`absolute inset-0 bg-gradient-to-t ${gradientFrom} to-surface z-10`} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      {/* Decorative circles */}
      <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
      <div className="absolute bottom-8 left-8 w-16 h-16 rounded-full bg-primary/10 blur-xl" />

      <div className="absolute bottom-0 left-0 p-5 z-20">
        <span
          className={`${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-2 inline-block`}
        >
          {badge}
        </span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-slate-300 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

function CategoryAccordion({
  name, subtitle, icon, isExpanded, onToggle, products, onSelectProduct,
}: {
  name: string;
  subtitle: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  products: Product[];
  onSelectProduct: (p: Product) => void;
}) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 rounded-xl glass-effect transition-all ${
          isExpanded ? 'border-primary/30 active-glow' : 'border-white/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            {icon}
          </div>
          <div className="text-left">
            <p className="font-bold text-white">{name}</p>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-primary transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 mt-3">
              {products.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductRow({
  product, onSelect,
}: {
  product: Product;
  onSelect: (p: Product) => void;
}) {
  return (
    <div className="glass-effect p-3 rounded-xl flex items-center justify-between gap-2">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-8 rounded bg-gradient-to-br ${product.badgeColors} flex items-center justify-center text-[8px] font-bold text-white tracking-widest border flex-shrink-0`}
        >
          {product.badge}
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white leading-tight truncate">
            {product.name}
          </h4>
          <p className="text-[10px] text-primary truncate">{product.tag}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <p className="text-xs font-bold text-white whitespace-nowrap">
          {product.price.toLocaleString('ru-RU')} ₽
        </p>
        <button
          onClick={() => {
            try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
            onSelect(product);
          }}
          className="bg-primary hover:bg-primary/90 text-surface text-xs font-bold px-3 py-2 rounded-lg transition-colors active:scale-95"
        >
          Заказать
        </button>
      </div>
    </div>
  );
}
