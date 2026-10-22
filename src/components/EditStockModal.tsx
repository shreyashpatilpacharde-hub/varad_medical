import React, { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { Medicine } from '../types/pharmacy.js';
import { usePharmacy } from '../context/PharmacyContext.js';

interface EditStockModalProps {
  medicine: Medicine | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({ medicine, isOpen, onClose }) => {
  const { updateMedicine } = usePharmacy();
  const [isSaving, setIsSaving] = useState(false);
  const [stockDelta, setStockDelta] = useState('0');
  const [formData, setFormData] = useState({
    availableQty: medicine?.availableQty || 0,
    mrp: medicine?.mrp || 0,
    batchNumber: medicine?.batchNumber || '',
    expiryDate: medicine?.expiryDate || '',
    reorderLevel: medicine?.reorderLevel || 10,
    locationRack: medicine?.locationRack || '',
  });

  React.useEffect(() => {
    if (medicine) {
      setFormData({
        availableQty: medicine.availableQty,
        mrp: medicine.mrp,
        batchNumber: medicine.batchNumber,
        expiryDate: medicine.expiryDate,
        reorderLevel: medicine.reorderLevel,
        locationRack: medicine.locationRack,
      });
      setStockDelta('0');
    }
  }, [medicine]);

  if (!isOpen || !medicine) return null;

  const handleApplyDelta = (delta: number) => {
    const current = Number(formData.availableQty);
    const updated = Math.max(0, current + delta);
    setFormData(prev => ({ ...prev, availableQty: updated }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const deltaNum = parseInt(stockDelta, 10) || 0;
    const finalQty = Math.max(0, Number(formData.availableQty) + deltaNum);

    const res = await updateMedicine(medicine.id, {
      availableQty: finalQty,
      mrp: Number(formData.mrp),
      batchNumber: formData.batchNumber.toUpperCase().trim(),
      expiryDate: formData.expiryDate,
      reorderLevel: Number(formData.reorderLevel),
      locationRack: formData.locationRack.trim(),
    });

    setIsSaving(false);
    if (res.success) {
      onClose();
    } else {
      alert(res.error || 'Failed to update stock');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Restock / Edit Stock</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{medicine.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Quick Restock Adder */}
          <div className="p-3.5 bg-teal-50/60 border border-teal-200 rounded-lg">
            <label className="block text-xs font-semibold text-teal-900 mb-1.5">
              Quick Restock Addition (+ Individual Tablets)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                value={stockDelta}
                onChange={e => setStockDelta(e.target.value)}
                className="w-28 px-3 py-1.5 text-sm font-mono border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              <div className="flex gap-1.5">
                {[+10, +25, +50, +100].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleApplyDelta(val)}
                    className="px-2 py-1 text-xs font-mono font-medium text-teal-800 bg-white hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                  >
                    +{val} tabs
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[10px] text-teal-700 mt-1">
              Example: Adding 5 strips of 10 tablets = enter <strong>+50</strong> tablets
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Stock (Total Tablets) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.availableQty}
                onChange={e => setFormData({ ...formData, availableQty: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Threshold Level
              </label>
              <input
                type="number"
                min="1"
                value={formData.reorderLevel}
                onChange={e => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batch Number
              </label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MRP (₹ per {medicine.unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={formData.mrp}
                onChange={e => setFormData({ ...formData, mrp: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Shelf / Rack Location
              </label>
              <input
                type="text"
                value={formData.locationRack}
                onChange={e => setFormData({ ...formData, locationRack: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>
          </div>

          {Number(formData.availableQty) < Number(formData.reorderLevel) && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Stock quantity is at or below the reorder threshold ({formData.reorderLevel} {medicine.unit}).</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
