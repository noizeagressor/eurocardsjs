'use client';

import { Store, ShoppingBag, Gift, User } from 'lucide-react';
import WebApp from '@twa-dev/sdk';
import type { TabId } from '@/lib/types';

const TABS: { id: TabId; Icon: React.ElementType; label: string }[] = [
  { id: 'home', Icon: Store, label: 'Магазин' },
  { id: 'orders', Icon: ShoppingBag, label: 'Заказы' },
  { id: 'bonuses', Icon: Gift, label: 'Бонусы' },
  { id: 'settings', Icon: User, label: 'Профиль' },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div className="glass-effect rounded-2xl flex items-center justify-between px-2 py-3 border border-primary/20 shadow-2xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                try { WebApp.HapticFeedback.impactOccurred('light'); } catch {}
                onTabChange(tab.id);
              }}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-surface active-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <tab.Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-bold ${
                  isActive ? 'text-primary' : 'text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
