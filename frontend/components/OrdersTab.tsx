'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Archive } from 'lucide-react';
import { api } from '@/lib/api';
import type { Order } from '@/lib/types';

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/v1/orders/my');
        setOrders(res.data);
      } catch (e) {
        console.error('Fetch orders failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-primary text-surface';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-white/10 text-white';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачен';
      case 'completed': return 'Готов';
      case 'processing': return 'В работе';
      case 'pending': return 'Ожидает';
      default: return status;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 pt-8 max-w-md mx-auto"
    >
      <h1 className="text-2xl font-extrabold mb-6 tracking-tight">Мои заказы</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
              <div className="h-3 bg-white/5 rounded w-1/2 mb-2" />
              <div className="h-6 bg-white/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-24 opacity-20">
          <Archive className="w-20 h-20 mb-6" />
          <p className="font-bold text-sm uppercase">История пуста</p>
        </div>
      ) : (
        <div className="space-y-3 pb-24">
          {orders.map((order) => (
            <div
              key={order.id}
              className="glass-card rounded-xl p-4 border border-white/5"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-base capitalize text-white">
                  {order.bank_id}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${statusColor(
                    order.status,
                  )}`}
                >
                  {statusLabel(order.status)}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-1">{order.full_name}</p>
              <p className="text-lg font-extrabold text-white">
                {order.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
