/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext.js';
import { Header } from './components/Header.js';
import { InventoryDashboard } from './components/InventoryDashboard.js';
import { BillingCounter } from './components/BillingCounter.js';
import { HistoryView } from './components/HistoryView.js';
import { AnnouncementsView } from './components/AnnouncementsView.js';
import { ReceiptModal } from './components/ReceiptModal.js';
import { AddMedicineModal } from './components/AddMedicineModal.js';
import { EditStockModal } from './components/EditStockModal.js';
import { Medicine } from './types/pharmacy.js';
import { ShieldCheck, HeartPulse, MapPin, Phone } from 'lucide-react';

function PharmacyApp() {
  const [activeTab, setActiveTab] = useState<'billing' | 'inventory' | 'announcements' | 'history'>('billing');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [restockMedicine, setRestockMedicine] = useState<Medicine | null>(null);
  const { activeReceipt, setActiveReceipt } = usePharmacy();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Top Header with Varad Medical Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* Section 1: Billing Counter (POS) */}
        {activeTab === 'billing' && <BillingCounter />}

        {/* Section 2: Inventory Management */}
        {activeTab === 'inventory' && (
          <InventoryDashboard
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateToBilling={() => setActiveTab('billing')}
          />
        )}

        {/* Section 3: Announcements (Separate section displaying ONLY low-stock medicines) */}
        {activeTab === 'announcements' && (
          <AnnouncementsView onNavigateToBilling={() => setActiveTab('billing')} />
        )}

        {/* Section 4: History & Transactions Audit */}
        {activeTab === 'history' && (
          <HistoryView onNavigateToBilling={() => setActiveTab('billing')} />
        )}
      </main>

      {/* Footer with Prominent Varad Medical Address & Drug License */}
      <footer className="no-print bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <HeartPulse className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Varad Medical</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Vani Galli, Gargoti, Tal. Bhudargad, Dist. Kolhapur – 416209</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-600 font-mono text-[11px]">
            <span className="flex items-center gap-1 font-sans">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>DL No: DL-20B/21B-MH-KLP-51289</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Pharmacist: Mr. Sagar Balu Patil</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-sans">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>+91 98220 54321</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditStockModal
        medicine={restockMedicine}
        isOpen={!!restockMedicine}
        onClose={() => setRestockMedicine(null)}
      />

      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onNewSale={() => {
            setActiveReceipt(null);
            setActiveTab('billing');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <PharmacyProvider>
      <PharmacyApp />
    </PharmacyProvider>
  );
}
