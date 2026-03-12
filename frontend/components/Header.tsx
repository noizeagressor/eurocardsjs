'use client';

import WebApp from '@twa-dev/sdk';
import { Wallet } from 'lucide-react';

export function Header() {
  let avatar = '';
  try {
    avatar = WebApp.initDataUnsafe?.user?.photo_url || '';
  } catch {
    // SSR or outside Telegram
  }

  return (
    <header className="sticky top-0 z-50 px-4 py-3 glass-effect border-b border-primary/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Wallet className="w-5 h-5 text-surface" />
          </div>
          <h1 className="text-lg font-extrabold tracking-tight text-white">
            EURO<span className="text-primary">CARDS</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-white/5">
          <img
            src={avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
            className="w-full h-full object-cover"
            alt="avatar"
          />
        </div>
      </div>
    </header>
  );
}
