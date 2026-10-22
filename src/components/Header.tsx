import React from 'react';
import { Pill, PlusCircle, ShoppingBag, History, AlertTriangle, Layers } from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext.js';

interface HeaderProps {
  activeTab: 'billing' | 'inventory' | 'announcements' | 'history';
  setActiveTab: (tab: 'billing' | 'inventory' | 'announcements' | 'history') => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAddModal }) => {
  const { cart, stats, announcements } = usePharmacy();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          {/* Zone 1: Medical Store Name & Address */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Pill className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Varad Medical
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline truncate max-w-[280px]">
                Vani Galli, Gargoti, Tal. Bhudargad, Dist. Kolhapur – 416209
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Billing, Inventory, Announcements, History) */}
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'billing'
                  ? 'bg-slate-100 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-600" />
              <span>Billing</span>
              {totalCartCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-teal-600 text-white rounded">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'inventory'
                  ? 'bg-slate-100 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Inventory</span>
              {stats && stats.lowStockCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-100 text-amber-800 rounded">
                  {stats.lowStockCount}
                </span>
              )}
            </button>

            {/* Separate, dedicated Announcements Section */}
            <button
              type="button"
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'announcements'
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 ${announcements.length > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
              <span>Announcements</span>
              {announcements.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-mono font-bold bg-amber-200 text-amber-900 rounded">
                  {announcements.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === 'history'
                  ? 'bg-slate-100 text-teal-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>History</span>
            </button>
          </nav>

          {/* Zone 3: Add Medicine stock action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3 py-2 text-xs sm:text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden xs:inline">Add Stock</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
