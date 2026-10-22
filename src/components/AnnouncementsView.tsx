import React, { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Search,
  Package,
  Plus,
  RotateCw,
  ArrowRight,
  Clock,
  Pill,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext.js';
import { AnnouncementItem, Medicine } from '../types/pharmacy.js';
import { formatDate } from '../utils/formatters.js';
import { EditStockModal } from './EditStockModal.js';

interface AnnouncementsViewProps {
  onNavigateToBilling: () => void;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ onNavigateToBilling }) => {
  const { announcements, medicines, fetchAnnouncements } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPIRY' | 'LOW_STOCK'>('ALL');
  const [selectedMedicineForRestock, setSelectedMedicineForRestock] = useState<Medicine | null>(null);

  // Breakdown of announcement types
  const expiryAlerts = announcements.filter(a => a.type === 'EXPIRY_ALERT');
  const lowStockAlerts = announcements.filter(a => a.type === 'LOW_STOCK');

  const filteredAnnouncements = announcements.filter(item => {
    // Type filter
    if (filterType === 'EXPIRY' && item.type !== 'EXPIRY_ALERT') return false;
    if (filterType === 'LOW_STOCK' && item.type !== 'LOW_STOCK') return false;

    // Search filter
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      item.medicineName.toLowerCase().includes(term) ||
      item.genericName.toLowerCase().includes(term) ||
      item.batchNumber.toLowerCase().includes(term) ||
      item.locationRack.toLowerCase().includes(term) ||
      item.message.toLowerCase().includes(term)
    );
  });

  const handleOpenRestock = (item: AnnouncementItem) => {
    const med = medicines.find(m => m.id === item.medicineId);
    if (med) {
      setSelectedMedicineForRestock(med);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900">
                  Store Announcements &amp; Alerts
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-amber-100 text-amber-800">
                  {announcements.length} Active Alerts
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time alerts for medicines running low on stock and medicines expiring within the next 1 month
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchAnnouncements()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh announcements"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onNavigateToBilling}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Billing Counter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dual Announcement Quick Stat Strips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Expiry Alert Summary Box */}
          <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-950">
            <div className="flex items-center gap-2.5">
              <CalendarClock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block">Medicine Expiry Alerts (&lt; 1 Month):</span>
                <span className="text-rose-700 text-[11px]">Medicines expiring within the next 30 days</span>
              </div>
            </div>
            <span className="font-mono font-bold text-base bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
              {expiryAlerts.length}
            </span>
          </div>

          {/* Low Stock Summary Box */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">Low-Stock Alerts (&lt; 10 Tablets):</span>
                <span className="text-amber-700 text-[11px]">Medicines needing distributor restock</span>
              </div>
            </div>
            <span className="font-mono font-bold text-base bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
              {lowStockAlerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterType === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('EXPIRY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              filterType === 'EXPIRY'
                ? 'bg-rose-50 text-rose-800 shadow-2xs font-bold border border-rose-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock className="w-3.5 h-3.5 text-rose-600" />
            <span>Expiry Alerts ({expiryAlerts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('LOW_STOCK')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              filterType === 'LOW_STOCK'
                ? 'bg-amber-50 text-amber-800 shadow-2xs font-bold border border-amber-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Low Stock ({lowStockAlerts.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand name, tablet name, batch..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
          />
        </div>
      </div>

      {/* Announcements List Grid */}
      {filteredAnnouncements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-xs text-slate-400">
          <Package className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
          <h3 className="text-base font-semibold text-slate-700">No Active Announcements</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm || filterType !== 'ALL'
              ? 'No announcements match your search or filter.'
              : 'All medicines have sufficient stock and none are expiring within the next 1 month.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnnouncements.map(item => {
            const isExpiry = item.type === 'EXPIRY_ALERT';
            const isCritical = item.severity === 'critical' || item.currentStock <= 5;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm ${
                  isExpiry
                    ? 'border-rose-300 bg-rose-50/10 hover:border-rose-400 ring-1 ring-rose-200/50'
                    : isCritical
                    ? 'border-amber-400 ring-1 ring-amber-300/60 bg-amber-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        {item.medicineName}
                      </h3>
                      <p className="text-xs text-slate-500 italic mt-0.5">{item.genericName}</p>
                    </div>

                    {/* Announcement Type Badge */}
                    {isExpiry ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {item.daysToExpiry !== undefined && item.daysToExpiry > 0
                            ? `In ${item.daysToExpiry} Days`
                            : item.daysToExpiry === 0
                            ? 'Expires Today'
                            : 'Expired'}
                        </span>
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          isCritical ? 'bg-amber-200 text-amber-900' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    )}
                  </div>

                  {/* Announcement message banner */}
                  <div
                    className={`mt-3 p-2.5 rounded-lg text-xs leading-relaxed border ${
                      isExpiry
                        ? 'bg-rose-50 text-rose-900 border-rose-200/80 font-medium'
                        : 'bg-amber-50 text-amber-900 border-amber-200/60'
                    }`}
                  >
                    {item.message}
                  </div>

                  {/* Stock Metrics (Requirement 2: total individual tablets) */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Available Stock</span>
                      <strong className={`text-base ${isExpiry ? 'text-slate-900' : 'text-amber-700'}`}>
                        {item.currentStock} {item.unit}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Expiry Date</span>
                      <strong className={`text-sm ${isExpiry ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {formatDate(item.expiryDate)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Batch Number</span>
                      <strong className="text-slate-800">{item.batchNumber}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans">Shelf Location</span>
                      <strong className="text-slate-800">{item.locationRack}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {isExpiry ? 'Near Expiry Alert (< 1 mo)' : 'Reorder Threshold: ' + item.reorderLevel + ' tabs'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenRestock(item)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage Stock</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Restock Modal */}
      <EditStockModal
        medicine={selectedMedicineForRestock}
        isOpen={!!selectedMedicineForRestock}
        onClose={() => setSelectedMedicineForRestock(null)}
      />
    </div>
  );
};
