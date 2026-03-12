'use client';

import { useState, useEffect } from 'react';
import WebApp from '@twa-dev/sdk';
import { api } from '@/lib/api';
import type { Product, TabId } from '@/lib/types';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { HomeTab } from '@/components/HomeTab';
import { OrdersTab } from '@/components/OrdersTab';
import { BonusesTab } from '@/components/BonusesTab';
import { SettingsTab } from '@/components/SettingsTab';
import { ProductDrawer } from '@/components/ProductDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOrderMode, setIsOrderMode] = useState(false);

  /* ── Telegram init + auth ── */
  useEffect(() => {
    try {
      WebApp.ready();
      WebApp.expand();
    } catch {}

    api.post('/api/v1/users/auth').catch((e) => {
      console.error('Auth failed:', e);
    });
  }, []);

  /* ── BackButton handling ── */
  useEffect(() => {
    if (!selectedProduct) return;

    try {
      WebApp.BackButton.show();
      const handler = () => {
        if (isOrderMode) {
          setIsOrderMode(false);
        } else {
          setSelectedProduct(null);
        }
      };
      WebApp.BackButton.onClick(handler);
      return () => {
        WebApp.BackButton.offClick(handler);
        WebApp.BackButton.hide();
      };
    } catch {}
  }, [selectedProduct, isOrderMode]);

  /* ── Closing confirmation when form is open ── */
  useEffect(() => {
    try {
      if (isOrderMode) {
        WebApp.enableClosingConfirmation();
      } else {
        WebApp.disableClosingConfirmation();
      }
    } catch {}
  }, [isOrderMode]);

  /* ── Close drawer helper ── */
  const handleCloseDrawer = () => {
    setSelectedProduct(null);
    setIsOrderMode(false);
  };

  return (
    <div className="min-h-screen pb-28">
      <Header />

      {activeTab === 'home' && (
        <HomeTab onSelectProduct={setSelectedProduct} />
      )}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'bonuses' && <BonusesTab />}
      {activeTab === 'settings' && <SettingsTab />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <ProductDrawer
        product={selectedProduct}
        isOrderMode={isOrderMode}
        onClose={handleCloseDrawer}
        onStartOrder={() => setIsOrderMode(true)}
      />
    </div>
  );
}
