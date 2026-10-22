import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { Medicine } from '../types/pharmacy.js';
import { usePharmacy } from '../context/PharmacyContext.js';
import { formatCurrency } from '../utils/formatters.js';

export const BillingCounter: React.FC = () => {
  const { medicines, cart, addToCart, updateCartQuantity, removeFromCart, clearCart, processBilling } = usePharmacy();

  // Search & Auto-suggest state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [itemDiscount, setItemDiscount] = useState<number>(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Customer & Bill Details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'NET_BANKING'>('CASH');
  const [billDiscountPercent, setBillDiscountPercent] = useState<number>(0);

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter medicines for auto-suggest
  const matchingMedicines = searchQuery.trim()
    ? medicines.filter(
        m =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (med: Medicine) => {
    setSelectedMedicine(med);
    setSearchQuery(med.name);
    setIsDropdownOpen(false);
    setQuantity(1);
    setItemDiscount(0);
  };

  const handleAddItemToCart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedMedicine) {
      setFormError('Please select a medicine from the suggestions list.');
      return;
    }
    if (quantity <= 0) {
      setFormError('Quantity must be at least 1.');
      return;
    }
    if (quantity > selectedMedicine.availableQty) {
      setFormError(`Cannot add ${quantity} units. Only ${selectedMedicine.availableQty} available.`);
      return;
    }

    setFormError(null);
    const added = addToCart(selectedMedicine, quantity, itemDiscount);
    if (added) {
      // Reset input for next medicine entry
      setSelectedMedicine(null);
      setSearchQuery('');
      setQuantity(1);
      setItemDiscount(0);
      searchInputRef.current?.focus();
    }
  };

  // Bill calculations based on cart (No GST)
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const itemDiscountsTotal = cart.reduce((acc, item) => acc + item.discountAmount, 0);

  // Apply overall bill discount or item discounts
  const overallDiscountAmount = (subtotal * billDiscountPercent) / 100;
  const totalDiscount = Math.max(itemDiscountsTotal, overallDiscountAmount);
  const finalPayableAmount = Math.round(subtotal - totalDiscount);

  const handleProcessSale = async () => {
    if (cart.length === 0) {
      setFormError('Cannot process sale. Please add at least one medicine to the cart.');
      return;
    }

    setIsProcessing(true);
    setFormError(null);

    const res = await processBilling({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim() || undefined,
      doctorName: doctorName.trim() || undefined,
      hospitalName: hospitalName.trim() || undefined,
      paymentMethod,
      discountPercent: billDiscountPercent,
    });

    setIsProcessing(false);

    if (res.success) {
      // Clear inputs
      setCustomerName('');
      setCustomerPhone('');
      setDoctorName('');
      setHospitalName('');
      setBillDiscountPercent(0);
    } else {
      setFormError(res.error || 'Failed to complete sale transaction.');
    }
  };

  // Fast popular meds for 1-click addition
  const popularMedicines = medicines.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Medicine Selection & Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Medicine Auto-suggest & Entry Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-teal-600" />
              <span>Add Medicine to Billing Cart</span>
            </h2>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddItemToCart} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicine Name / Generic Salt (Auto-suggest) *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Type brand name (e.g. Paracetamol, Augmentin, Pan-D, Cetzine)..."
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                      if (selectedMedicine && selectedMedicine.name !== e.target.value) {
                        setSelectedMedicine(null);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.trim().length > 0) setIsDropdownOpen(true);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
                  />
                </div>

                {/* Auto-suggest Dropdown */}
                {isDropdownOpen && matchingMedicines.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-lg border border-slate-200 shadow-lg divide-y divide-slate-100"
                  >
                    {matchingMedicines.map(med => {
                      const isLow = med.availableQty < 10 || med.availableQty <= med.reorderLevel;
                      return (
                        <button
                          key={med.id}
                          type="button"
                          onClick={() => handleSelectSuggestion(med)}
                          className="w-full text-left px-4 py-2.5 hover:bg-teal-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{med.name}</div>
                            <div className="text-slate-500 italic mt-0.5">{med.genericName}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Batch: {med.batchNumber} · Exp: {med.expiryDate} · Rack: {med.locationRack}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono font-bold text-slate-900 text-sm">
                              {formatCurrency(med.mrp)}
                            </div>
                            <div
                              className={`text-[11px] font-mono mt-0.5 ${
                                isLow ? 'text-amber-700 font-bold' : 'text-emerald-700 font-medium'
                              }`}
                            >
                              Stock: {med.availableQty} {med.unit}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Medicine Info Banner */}
              {selectedMedicine && (
                <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-teal-950 text-sm">{selectedMedicine.name}</span>
                    <span className="text-teal-700 ml-2">({selectedMedicine.genericName})</span>
                    <div className="text-teal-800 text-[11px] font-mono mt-0.5">
                      Batch: {selectedMedicine.batchNumber} · Expiry: {selectedMedicine.expiryDate} · GST: {selectedMedicine.gstRate}%
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-slate-600">Stock Available: </span>
                    <strong className="text-teal-950 text-sm">{selectedMedicine.availableQty} {selectedMedicine.unit}</strong>
                  </div>
                </div>
              )}

              {/* Quantity, Item Discount, and Add Action */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantity (Tablets to Sell) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMedicine?.availableQty || 999}
                    placeholder="1, 2, 5... tablets"
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Item Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={itemDiscount}
                    onChange={e => setItemDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Est. Line Total (₹)
                  </label>
                  <div className="px-3 py-2 text-sm font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg tabular-nums">
                    {selectedMedicine
                      ? formatCurrency(quantity * selectedMedicine.mrp * (1 - itemDiscount / 100))
                      : '₹0.00'}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleAddItemToCart()}
                    disabled={!selectedMedicine || (selectedMedicine && selectedMedicine.availableQty <= 0)}
                    className="w-full py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Bill</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Fast-Add Medication Tags */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-slate-400 shrink-0 font-medium">Quick Select:</span>
              {popularMedicines.map(med => (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(med)}
                  className="px-2.5 py-1 text-slate-700 hover:text-teal-800 bg-slate-100 hover:bg-teal-50 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 font-medium"
                >
                  {med.name.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Current Cart Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Cart Items</h3>
                <span className="text-xs text-slate-500 font-mono">({cart.length} medications)</span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Cart</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Cart is currently empty</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Search medicines above or select quick pills to begin billing
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">Item Name</th>
                      <th className="py-2.5 px-2 font-mono">Batch</th>
                      <th className="py-2.5 px-2 font-mono text-right">Rate / Tab</th>
                      <th className="py-2.5 px-3 font-mono text-center">Qty (Tabs)</th>
                      <th className="py-2.5 px-2 font-mono text-right">Disc%</th>
                      <th className="py-2.5 px-3 font-mono text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 text-center w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {cart.map(item => (
                      <tr key={item.medicineId} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-sans">
                          <div className="font-semibold text-slate-900 text-sm">{item.medicine.name}</div>
                          <div className="text-[11px] text-slate-500 italic font-mono mt-0.5">
                            {item.medicine.genericName}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-slate-700 font-semibold">{item.medicine.batchNumber}</td>
                        <td className="py-3 px-2 text-right text-slate-800 tabular-nums">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1.5 font-sans">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                              title="Decrease 1 tablet"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-12 text-center font-bold text-slate-900 font-mono">
                              {item.quantity} tab
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                              title="Add 1 tablet"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right text-slate-600 tabular-nums">
                          {item.discountPercent}%
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-950 text-sm tabular-nums">
                          {formatCurrency(item.total)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.medicineId)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Columns: Customer Details & Checkout Calculation Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer & Prescription Details */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Patient, Doctor &amp; Hospital Details
              </h3>
              <span className="text-[11px] text-teal-700 font-medium">Invoice Fields</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sanjay Patil (or Walk-in Patient)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Phone (Optional)
              </label>
              <input
                type="tel"
                placeholder="+91 98XXX XXXXX"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prescribing Doctor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Rahul Desai (MBBS, DNB)"
                value={doctorName}
                onChange={e => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Hospital / Clinic Name
                </label>
              </div>
              <input
                type="text"
                placeholder="e.g. Sub-District Hospital, Gargoti"
                value={hospitalName}
                onChange={e => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
              {/* Quick Suggestion Chips for local Gargoti/Bhudargad hospitals */}
              <div className="flex flex-wrap gap-1 mt-1.5 text-[11px]">
                {['Sub-District Hospital, Gargoti', 'Rural Hospital, Bhudargad', 'More Hospital, Gargoti', 'Self / OTC'].map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setHospitalName(h)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-900 border border-slate-200 rounded text-[10px] transition-colors"
                  >
                    {h.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                    paymentMethod === 'CASH'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                    paymentMethod === 'CARD'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('NET_BANKING')}
                  className={`py-2 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 font-medium transition-colors ${
                    paymentMethod === 'NET_BANKING'
                      ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Net Banking</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bill Calculation Summary Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Billing Summary
            </h3>

            {/* Overall Discount Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Special Bill Discount (%)</label>
                <span className="text-xs text-slate-400 font-mono">{billDiscountPercent}%</span>
              </div>
              <input
                type="number"
                min="0"
                max="50"
                value={billDiscountPercent}
                onChange={e => setBillDiscountPercent(Math.min(50, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
              />
            </div>

            {/* Clean summary lines: Subtotal, Discount Amount, Final Payable Amount */}
            <div className="space-y-2 text-xs pt-2 font-mono divide-y divide-slate-100">
              <div className="flex justify-between text-slate-600 pt-1">
                <span className="font-sans">Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700 pt-1">
                <span className="font-sans">Discount Amount:</span>
                <span className="font-bold tabular-nums">
                  {totalDiscount > 0 ? `- ${formatCurrency(totalDiscount)}` : '₹0.00'}
                </span>
              </div>
            </div>

            {/* Final Payable Amount (Clean & Prominent) */}
            <div className="pt-3 border-t-2 border-slate-900">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-700 block">Final Payable Amount:</span>
                  <span className="text-[10px] text-slate-500 font-normal">Pharmacist: Mr. Sagar Balu Patil</span>
                </div>
                <span className="text-2xl font-bold font-mono text-teal-800 tabular-nums">
                  {formatCurrency(finalPayableAmount)}
                </span>
              </div>
            </div>

            {/* Action Button: Instant Sale & Receipt */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessSale}
                disabled={cart.length === 0 || isProcessing}
                className="w-full py-3 px-4 text-sm font-bold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Deducting Stock &amp; Printing...</span>
                  </>
                ) : (
                  <>
                    <ReceiptIcon className="w-4 h-4" />
                    <span>Generate Bill &amp; Print Receipt</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Stock automatically deducts upon billing. A formal tax invoice receipt is generated instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
