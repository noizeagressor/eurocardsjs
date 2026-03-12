'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Heart, ShieldCheck, Globe, Zap,
  Lock, Wallet, CreditCard, Clock, Percent, Smartphone,
  Wifi, CheckCircle2,
} from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { api } from '@/lib/api';
import type { Product, PromoStatus, ProductFeature } from '@/lib/types';

/* ── Icon map for product features ── */
const FEATURE_ICONS: Record<ProductFeature['icon'], React.ElementType> = {
  shield: ShieldCheck,
  globe: Globe,
  zap: Zap,
  lock: Lock,
  wallet: Wallet,
  'credit-card': CreditCard,
  clock: Clock,
  percent: Percent,
  smartphone: Smartphone,
};

/* ── Form schema (outside component — no re-creation) ── */
const orderSchema = z.object({
  fullName: z.string().regex(/^[a-zA-Z\s]+$/, 'Только латиница'),
  tgUsername: z.string().min(1, 'Обязательное поле'),
  birthDate: z.string().refine((date) => {
    const birth = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
  }, 'Вам должно быть 18+'),
  promoCode: z.string().optional(),
});
type OrderFormData = z.infer<typeof orderSchema>;

/* ── Props ── */
interface ProductDrawerProps {
  product: Product | null;
  isOrderMode: boolean;
  onClose: () => void;
  onStartOrder: () => void;
}

/* ══════════════════════════════════════════ */
/*           PRODUCT DRAWER                  */
/* ══════════════════════════════════════════ */
export function ProductDrawer({
  product, isOrderMode, onClose, onStartOrder,
}: ProductDrawerProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoStatus, setPromoStatus] = useState<PromoStatus | null>(null);

  const {
    register, handleSubmit, watch, formState: { errors }, reset,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    mode: 'onChange',
  });

  const promoCodeValue = watch('promoCode');

  /* ── Promo validation with debounce + abort ── */
  useEffect(() => {
    if (!promoCodeValue || promoCodeValue.length < 3) {
      setPromoStatus(null);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await api.post(
          '/api/v1/promocodes/validate',
          { code: promoCodeValue },
          { signal: controller.signal },
        );
        if (res.data.valid) {
          setPromoStatus(res.data);
          try { WebApp.HapticFeedback.notificationOccurred('success'); } catch {}
        } else {
          setPromoStatus({ valid: false, message: res.data.message });
          try { WebApp.HapticFeedback.notificationOccurred('error'); } catch {}
        }
      } catch (e) {
        if (!axios.isCancel(e)) setPromoStatus(null);
      }
    }, 800);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [promoCodeValue]);

  /* ── Reset on product change ── */
  useEffect(() => {
    if (!product) {
      setIsSuccess(false);
      setPromoStatus(null);
      reset();
    }
  }, [product, reset]);

  /* ── Calculated price ── */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    if (!promoStatus?.valid) return product.price;
    if (promoStatus.discount_type === 'percent') {
      return Math.floor(product.price * (1 - (promoStatus.discount_amount || 0) / 100));
    }
    return Math.max(0, product.price - (promoStatus.discount_amount || 0));
  }, [product, promoStatus]);

  /* ── Submit order ── */
  const onSubmitOrder = async (data: OrderFormData) => {
    if (!product) return;
    try {
      try { WebApp.HapticFeedback.impactOccurred('medium'); } catch {}
      const res = await api.post('/api/v1/orders/create', {
        bank_id: product.id,
        full_name: data.fullName,
        tg_username: data.tgUsername,
        price: product.price,
        promo_code: data.promoCode,
      });
      if (res.data) {
        try { WebApp.HapticFeedback.notificationOccurred('success'); } catch {}
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      }
    } catch {
      try { WebApp.HapticFeedback.notificationOccurred('error'); } catch {}
    }
  };

  /* ── Max date for 18+ ── */
  const maxBirthDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split('T')[0];
  }, []);

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 150) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-[101] glass-effect rounded-t-[28px] max-h-[90vh] overflow-hidden flex flex-col border-t border-primary/20"
          >
            {/* Drag handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />

            <div className="px-6 pb-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <SuccessView key="success" />
                ) : isOrderMode ? (
                  <OrderFormView
                    key="form"
                    product={product}
                    register={register}
                    errors={errors}
                    promoStatus={promoStatus}
                    finalPrice={finalPrice}
                    maxBirthDate={maxBirthDate}
                    onSubmit={handleSubmit(onSubmitOrder)}
                  />
                ) : (
                  <ProductDetailView
                    key="detail"
                    product={product}
                    onStartOrder={onStartOrder}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────── */
/*  SUB-VIEWS                                  */
/* ─────────────────────────────────────────── */

function SuccessView() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="py-16 flex flex-col items-center text-center"
    >
      <CheckCircle2 className="w-20 h-20 text-primary mb-6" />
      <h2 className="text-3xl font-extrabold uppercase tracking-tight text-white">
        Успешно!
      </h2>
      <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
        Заявка создана. Ожидайте сообщения.
      </p>
    </motion.div>
  );
}

function ProductDetailView({
  product, onStartOrder,
}: {
  product: Product;
  onStartOrder: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {product.lto && (
              <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Limited
              </span>
            )}
            <span className="text-slate-400 text-sm">•</span>
            <span className="text-slate-400 text-sm">
              Выдача: {product.deliveryTime}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-primary">
            {product.price.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>

      {/* Card Preview */}
      <div
        className="relative w-full aspect-video rounded-xl mb-8 overflow-hidden border border-white/10"
        style={{ background: product.gradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4/5 h-3/5 glass-card rounded-lg border border-white/20 relative p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex justify-between items-start">
              <Wifi className="w-7 h-7 text-white/50" />
              <div className="text-white/40 font-black italic text-lg tracking-tighter">
                {product.name.split(' ')[0].toUpperCase()}
              </div>
            </div>
            <div>
              <div className="w-1/2 h-2 bg-white/10 rounded mb-2" />
              <div className="w-1/3 h-2 bg-white/10 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6 mb-8">
        <div>
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-widest opacity-60">
            Преимущества
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {product.features.map((feat, i) => {
              const Icon = FEATURE_ICONS[feat.icon] || ShieldCheck;
              return (
                <div key={i} className="flex items-start gap-4 glass-card p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{feat.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest opacity-60">
            Описание
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">{product.fullDesc}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4 border-t border-white/5 pb-4">
        <button
          onClick={() => {
            try { WebApp.HapticFeedback.impactOccurred('medium'); } catch {}
            onStartOrder();
          }}
          className="flex-1 h-14 bg-primary text-surface font-black text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)]"
        >
          Оформить
          <ChevronRight className="w-5 h-5" />
        </button>
        <button className="w-14 h-14 rounded-xl glass-card flex items-center justify-center hover:bg-white/10 transition-colors">
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function OrderFormView({
  product, register, errors, promoStatus, finalPrice, maxBirthDate, onSubmit,
}: {
  product: Product;
  register: any;
  errors: any;
  promoStatus: PromoStatus | null;
  finalPrice: number;
  maxBirthDate: string;
  onSubmit: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-white">Оформление заявки</h2>
        <p className="text-sm text-slate-400 mt-1">{product.name}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <input
            {...register('fullName')}
            placeholder="ИМЯ ФАМИЛИЯ (LATIN)"
            className={`w-full bg-white/5 border ${
              errors.fullName ? 'border-red-500' : 'border-white/10'
            } rounded-xl p-4 font-bold uppercase text-white outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600`}
          />
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1 pl-2">
              {errors.fullName.message as string}
            </p>
          )}
        </div>

        {/* Telegram Username */}
        <div>
          <input
            {...register('tgUsername')}
            placeholder="@username"
            className={`w-full bg-white/5 border ${
              errors.tgUsername ? 'border-red-500' : 'border-white/10'
            } rounded-xl p-4 font-bold text-white outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600`}
          />
          {errors.tgUsername && (
            <p className="text-red-400 text-xs mt-1 pl-2">
              {errors.tgUsername.message as string}
            </p>
          )}
        </div>

        {/* Birth Date */}
        <div>
          <label className="text-xs text-slate-500 pl-2 mb-1 block uppercase font-bold">
            Дата рождения
          </label>
          <input
            type="date"
            {...register('birthDate')}
            max={maxBirthDate}
            className={`w-full bg-white/5 border ${
              errors.birthDate ? 'border-red-500' : 'border-white/10'
            } rounded-xl p-4 font-bold text-white outline-none focus:border-primary/50 transition-colors`}
          />
          {errors.birthDate && (
            <p className="text-red-400 text-xs mt-1 pl-2">
              {errors.birthDate.message as string}
            </p>
          )}
        </div>

        {/* Promo Code */}
        <div>
          <input
            {...register('promoCode')}
            placeholder="ПРОМОКОД (ЕСЛИ ЕСТЬ)"
            className={`w-full bg-white/5 border ${
              promoStatus?.valid
                ? 'border-primary'
                : promoStatus?.valid === false
                ? 'border-red-500'
                : 'border-white/10'
            } rounded-xl p-4 font-bold uppercase text-white outline-none focus:border-primary/50 transition-colors placeholder:text-slate-600`}
          />
          {promoStatus && (
            <p
              className={`text-xs mt-1 pl-2 font-bold ${
                promoStatus.valid ? 'text-primary' : 'text-red-400'
              }`}
            >
              {promoStatus.message}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center px-2 py-2">
          <span className="text-sm font-bold text-slate-400">Итого:</span>
          <div className="text-right">
            {promoStatus?.valid ? (
              <>
                <span className="text-sm line-through text-white/30 mr-2">
                  {product.price.toLocaleString('ru-RU')} ₽
                </span>
                <span className="text-xl font-black text-primary">
                  {finalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </>
            ) : (
              <span className="text-xl font-black text-white">
                {product.price.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full h-14 bg-primary text-surface font-black text-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(191,255,0,0.3)]"
        >
          Подтвердить заказ
        </button>
      </form>
    </motion.div>
  );
}
