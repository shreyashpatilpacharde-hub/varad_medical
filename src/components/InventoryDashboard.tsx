import React, { useState } from 'react';
import {
  Search,
  AlertTriangle,
  Package,
  Layers,
  CalendarClock,
  ShoppingCart,
  Edit2,
  Trash2,
  RotateCw,
  Clock,
} from 'lucide-react';
import { Medicine } from '../types/pharmacy.js';
import { usePharmacy } from '../context/PharmacyContext.js';
import { formatCurrency, formatDate, isExpiringSoon, isExpired } from '../utils/formatters.js';
import { EditStockModal } from './EditStockModal.js';

interface InventoryDashboardProps {
  onOpenAddModal: () => void;
  onNavigateToBilling: () => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onOpenAddModal,
  onNavigateToBilling,
}) => {
  const { medicines, stats, isLoading, error, fetchInventory, addToCart, deleteMedicine } = usePharmacy();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'expiring_soon'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(medicines.map(m => m.category))).sort();

  // Client-side filtering in addition to backend
  const filteredMedicines = medicines.filter(med => {
    // Search
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      med.name.toLowerCase().includes(term) ||
      med.genericName.toLowerCase().includes(term) ||
      med.batchNumber.toLowerCase().includes(term) ||
      med.manufacturer.toLowerCase().includes(term) ||
      med.locationRack.toLowerCase().includes(term);

    // Filter type
    let matchesFilter = true;
    if (filterType === 'low_stock') {
      matchesFilter = med.availableQty < 10 || med.availableQty <= med.reorderLevel;
    } else if (filterType === 'expiring_soon') {
      matchesFilter = isExpiringSoon(med.expiryDate) || isExpired(med.expiryDate);
    }

    // Category
    const matchesCategory = selectedCategory === 'all' || med.category === selectedCategory;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const handleQuickAddBill = (med: Medicine) => {
    if (med.availableQty <= 0) {
      alert(`Cannot add ${med.name} to bill. Current stock is 0.`);
      return;
    }
    const added = addToCart(med, 1);
    if (added) {
      onNavigateToBilling();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove "${name}" from store inventory?`)) {
      await deleteMedicine(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Medicine SKUs</span>
            <Package className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats?.totalMedicines ?? medicines.length}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Registered formulations &amp; batches
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Units In Stock</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900 tabular-nums">
            {stats?.totalStockUnits?.toLocaleString('en-IN') ?? '...'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Available across all shelves
          </div>
        </div>

        <div className={`p-4 rounded-xl border shadow-xs transition-colors ${
          (stats?.lowStockCount || 0) > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium">
            <span className={stats && stats.lowStockCount > 0 ? 'text-amber-900 font-semibold' : 'text-slate-500'}>
              Low Stock Alerts (&lt;10)
            </span>
            <AlertTriangle className={`w-4 h-4 ${stats && stats.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-700 tabular-nums">
            {stats?.lowStockCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-amber-800">
            Medicines requiring immediate reorder
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Expiring Within 6 Mo</span>
            <CalendarClock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-700 tabular-nums">
            {stats?.expiringSoonCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Batch expiry monitoring
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand name, generic salt, batch, rack..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Interactive Filter Tabs (Functional Segmented Control) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Medicines ({medicines.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('low_stock')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  filterType === 'low_stock'
                    ? 'bg-amber-500 text-white shadow-xs font-semibold'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Low Stock (&lt;10)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterType('expiring_soon')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  filterType === 'expiring_soon'
                    ? 'bg-rose-600 text-white shadow-xs font-semibold'
                    : 'text-rose-700 hover:text-rose-900'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Expiring Soon</span>
              </button>
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => fetchInventory()}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh inventory"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading && (
          <div className="p-8 text-center text-slate-500 text-sm">
            <div className="animate-spin w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            Loading store inventory and live batch data...
          </div>
        )}

        {error && !isLoading && (
          <div className="p-6 text-center text-red-600 text-sm bg-red-50">
            {error}
          </div>
        )}

        {!isLoading && filteredMedicines.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No medicines found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || filterType !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your search terms or filters.'
                : 'Your store inventory is empty. Add new stock to begin.'}
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
            >
              Add First Medicine
            </button>
          </div>
        )}

        {!isLoading && filteredMedicines.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Medicine &amp; Generic Composition</th>
                  <th className="py-3 px-3">Category / Mfg</th>
                  <th className="py-3 px-3 font-mono">Batch No.</th>
                  <th className="py-3 px-3 font-mono">Expiry Date</th>
                  <th className="py-3 px-3 text-right font-mono">Available Stock (Tablets)</th>
                  <th className="py-3 px-3 text-right font-mono">Reorder Lvl</th>
                  <th className="py-3 px-3 text-right font-mono">MRP (₹)</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredMedicines.map(med => {
                  const isLow = med.availableQty < 10 || med.availableQty <= med.reorderLevel;
                  const nearExpiry = isExpiringSoon(med.expiryDate);
                  const expired = isExpired(med.expiryDate);

                  return (
                    <tr
                      key={med.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Name & Composition */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span>{med.name}</span>
                          {isLow && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono">
                              LOW STOCK
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 italic">
                          {med.genericName}
                        </div>
                      </td>

                      {/* Category & Manufacturer */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-slate-800 font-medium">{med.category}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{med.manufacturer}</div>
                      </td>

                      {/* Batch Number */}
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-slate-700">
                        {med.batchNumber}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-mono text-xs">
                        <div className={`flex items-center gap-1 ${
                          expired
                            ? 'text-red-700 font-bold'
                            : nearExpiry
                            ? 'text-rose-600 font-semibold'
                            : 'text-slate-700'
                        }`}>
                          <span>{formatDate(med.expiryDate)}</span>
                          {nearExpiry && !expired && (
                            <span className="text-[10px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-sans">
                              Soon
                            </span>
                          )}
                          {expired && (
                            <span className="text-[10px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-sans">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Available Qty */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span
                            className={`text-base font-bold tabular-nums ${
                              isLow
                                ? 'text-amber-700'
                                : 'text-slate-900'
                            }`}
                          >
                            {med.availableQty}
                          </span>
                          <span className="text-xs text-slate-500 font-sans font-normal">
                            {med.unit}
                          </span>
                        </div>
                      </td>

                      {/* Reorder Level */}
                      <td className="py-3 px-3 text-right font-mono text-xs text-slate-600 tabular-nums">
                        {med.reorderLevel} {med.unit}
                      </td>

                      {/* MRP */}
                      <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {formatCurrency(med.mrp)}
                      </td>

                      {/* Shelf Location */}
                      <td className="py-3 px-3 text-xs text-slate-600 font-mono">
                        {med.locationRack}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAddBill(med)}
                            disabled={med.availableQty <= 0}
                            title="Add to Billing Cart"
                            className="p-1.5 text-teal-700 hover:text-teal-900 hover:bg-teal-50 rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMedicine(med)}
                            title="Edit Stock & Details"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(med.id, med.name)}
                            title="Delete Item"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Restock Modal */}
      <EditStockModal
        medicine={editingMedicine}
        isOpen={!!editingMedicine}
        onClose={() => setEditingMedicine(null)}
      />
    </div>
  );
};
