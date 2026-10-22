import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Calendar,
  Building,
  User,
  Stethoscope,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { usePharmacy } from '../context/PharmacyContext.js';
import { Receipt, StockTransaction } from '../types/pharmacy.js';
import { formatCurrency, formatDateTime, formatDate } from '../utils/formatters.js';

interface HistoryViewProps {
  onNavigateToBilling: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onNavigateToBilling }) => {
  const { receipts, transactions, setActiveReceipt } = usePharmacy();
  const [activeSubTab, setActiveSubTab] = useState<'sales' | 'inventory_log'>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING'>('ALL');

  // Filter receipts
  const filteredReceipts = receipts.filter(r => {
    // Search
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.receiptNumber.toLowerCase().includes(term) ||
      r.customerName.toLowerCase().includes(term) ||
      (r.doctorName && r.doctorName.toLowerCase().includes(term)) ||
      (r.hospitalName && r.hospitalName.toLowerCase().includes(term)) ||
      (r.customerPhone && r.customerPhone.includes(term));

    // Payment
    const matchesPayment = paymentFilter === 'ALL' || r.paymentMethod === paymentFilter;

    // Time
    const rDate = new Date(r.invoiceDate);
    const now = new Date();
    let matchesTime = true;

    if (timeFilter === 'today') {
      matchesTime = rDate.toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
    } else if (timeFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
      matchesTime = rDate >= sevenDaysAgo;
    } else if (timeFilter === 'month') {
      matchesTime =
        rDate.getMonth() === now.getMonth() && rDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesPayment && matchesTime;
  });

  // Filter stock movement transactions
  const filteredTransactions = transactions.filter(tx => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      tx.medicineName.toLowerCase().includes(term) ||
      tx.batchNumber.toLowerCase().includes(term) ||
      tx.type.toLowerCase().includes(term) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(term)) ||
      (tx.notes && tx.notes.toLowerCase().includes(term))
    );
  });

  // Overall Sales Computations (Requirement: Total Sales and Current Month Sales)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // 1. Total Sales: The total sales amount across all receipts
  const totalSalesAllTime = receipts.reduce((sum, r) => sum + (r.finalPayableAmount || r.netPayable), 0);

  // 2. Current Month Sales: The total sales amount for the current calendar month
  const currentMonthReceipts = receipts.filter(r => {
    const d = new Date(r.invoiceDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const currentMonthSales = currentMonthReceipts.reduce((sum, r) => sum + (r.finalPayableAmount || r.netPayable), 0);

  // Filtered view metrics
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + (r.finalPayableAmount || r.netPayable), 0);
  const totalDiscount = filteredReceipts.reduce((sum, r) => sum + r.discountAmount, 0);
  const totalItemsSold = filteredReceipts.reduce((sum, r) => sum + r.items.reduce((acc, it) => acc + it.quantity, 0), 0);

  // CSV Export for accounting
  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Date & Time',
      'Patient Name',
      'Patient Phone',
      'Doctor Name',
      'Hospital Name',
      'Payment Mode',
      'Tablets Count',
      'Subtotal',
      'Discount Amount',
      'Final Payable Amount',
      'Pharmacist',
    ];

    const rows = filteredReceipts.map(r => [
      `"${r.receiptNumber}"`,
      `"${formatDateTime(r.invoiceDate)}"`,
      `"${r.customerName}"`,
      `"${r.customerPhone || ''}"`,
      `"${r.doctorName || ''}"`,
      `"${r.hospitalName || ''}"`,
      `"${r.paymentMethod}"`,
      r.items.reduce((acc, it) => acc + it.quantity, 0),
      r.subtotal.toFixed(2),
      r.discountAmount.toFixed(2),
      (r.finalPayableAmount || r.netPayable).toFixed(2),
      `"Mr. Sagar Balu Patil"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Varad_Medical_Sales_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Transaction History &amp; Audit Logs
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Complete record of patient sales, doctor prescriptions, and inventory adjustments for Varad Medical
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredReceipts.length === 0}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToBilling}
              className="flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              <span>New Bill</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip - Requirement: Total Sales and Current Month Sales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Card 1: Total Sales */}
          <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-teal-800 font-bold uppercase tracking-wider">
                Total Sales
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                All-Time
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-teal-950 mt-1.5 tabular-nums">
              {formatCurrency(totalSalesAllTime)}
            </div>
            <div className="text-xs text-teal-700 mt-1">
              Total sales amount ({receipts.length} bills recorded)
            </div>
          </div>

          {/* Card 2: Current Month Sales */}
          <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-sky-800 font-bold uppercase tracking-wider">
                Current Month Sales
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                {currentMonthName}
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-sky-950 mt-1.5 tabular-nums">
              {formatCurrency(currentMonthSales)}
            </div>
            <div className="text-xs text-sky-700 mt-1">
              Sales amount for {currentMonthName} ({currentMonthReceipts.length} bills)
            </div>
          </div>

          {/* Card 3: Total Discount Given */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                Total Discount Given
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-700 mt-1.5 tabular-nums">
              {formatCurrency(totalDiscount)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Total patient savings given on bills
            </div>
          </div>

          {/* Card 4: Tablets Dispensed */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                Tablets Dispensed
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900 mt-1.5 tabular-nums">
              {totalItemsSold} tablets
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Total individual tablet units sold
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Sub-tab switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveSubTab('sales')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sales Invoices ({receipts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('inventory_log')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeSubTab === 'inventory_log'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Movement Log ({transactions.length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'sales'
                  ? 'Search by patient, doctor, hospital, invoice #...'
                  : 'Search by medicine, batch, restock note...'
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Time & Payment filters (for sales tab) */}
          {activeSubTab === 'sales' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="all">All Dates</option>
                <option value="today">Today Only</option>
                <option value="7days">Last 7 Days</option>
                <option value="month">This Month</option>
              </select>

              <select
                value={paymentFilter}
                onChange={e => setPaymentFilter(e.target.value as any)}
                className="px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <option value="ALL">All Payment Modes</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI / QR</option>
                <option value="CARD">Card</option>
                <option value="NET_BANKING">Net Banking</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {activeSubTab === 'sales' ? (
          filteredReceipts.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700">No sales transactions found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || timeFilter !== 'all' || paymentFilter !== 'ALL'
                  ? 'No records match the current filter criteria.'
                  : 'No sales have been generated yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                    <th className="py-3 px-4 font-mono">Invoice #</th>
                    <th className="py-3 px-3">Date &amp; Time</th>
                    <th className="py-3 px-4">Patient (Customer)</th>
                    <th className="py-3 px-4">Doctor &amp; Hospital</th>
                    <th className="py-3 px-3 text-center">Tablets</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-4 text-right font-mono">Final Payable (₹)</th>
                    <th className="py-3 px-4 text-right">Receipt Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredReceipts.map(receipt => (
                    <tr key={receipt.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Invoice # */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {receipt.receiptNumber}
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 font-sans text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formatDateTime(receipt.invoiceDate)}</span>
                        </div>
                      </td>

                      {/* Patient Name & Phone */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{receipt.customerName}</span>
                        </div>
                        {receipt.customerPhone && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5 ml-5">
                            {receipt.customerPhone}
                          </div>
                        )}
                      </td>

                      {/* Doctor & Hospital Details (Explicitly required by user!) */}
                      <td className="py-3 px-4 font-sans">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>{receipt.doctorName || 'Self / OTC'}</span>
                        </div>
                        {receipt.hospitalName ? (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 ml-5">
                            <Building className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={receipt.hospitalName}>
                              {receipt.hospitalName}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 ml-5 italic">
                            Direct walk-in
                          </div>
                        )}
                      </td>

                      {/* Items Count in Tablets */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-slate-800 font-mono">
                          {receipt.items.reduce((acc, it) => acc + it.quantity, 0)} tabs
                        </span>
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-3 font-sans">
                        <span className="inline-block text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {receipt.paymentMethod}
                        </span>
                      </td>

                      {/* Final Payable */}
                      <td className="py-3 px-4 text-right font-bold text-slate-950 text-sm tabular-nums">
                        {formatCurrency(receipt.finalPayableAmount || receipt.netPayable)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right font-sans">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveReceipt(receipt)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-md transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Bill</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceipt(receipt);
                              setTimeout(() => window.print(), 250);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded transition-colors"
                            title="Print Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* Inventory Movement Log */
          filteredTransactions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-semibold text-slate-700">No inventory movements recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase">
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Medicine Name</th>
                    <th className="py-3 px-3 font-mono">Batch</th>
                    <th className="py-3 px-3 text-right font-mono">Stock Change</th>
                    <th className="py-3 px-3 text-right font-mono">Remaining Stock</th>
                    <th className="py-3 px-4">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-sans text-slate-600 whitespace-nowrap">
                        {formatDateTime(tx.date)}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                            tx.type === 'SALE'
                              ? 'bg-rose-50 text-rose-700'
                              : tx.type === 'RESTOCK'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {tx.type === 'SALE' ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {tx.medicineName}
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-semibold">{tx.batchNumber}</td>
                      <td
                        className={`py-3 px-3 text-right font-bold tabular-nums ${
                          tx.quantityChange < 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {tx.quantityChange > 0 ? `+${tx.quantityChange}` : tx.quantityChange}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {tx.remainingStock}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">
                        {tx.referenceId && (
                          <span className="font-mono text-slate-900 font-semibold mr-1.5">
                            [{tx.referenceId}]
                          </span>
                        )}
                        <span>{tx.notes}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
