import React from 'react';
import { Printer, X, CheckCircle2, Copy } from 'lucide-react';
import { Receipt } from '../types/pharmacy.js';
import { formatCurrency, formatDateTime, numberToWords } from '../utils/formatters.js';

interface ReceiptModalProps {
  receipt: Receipt;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose, onNewSale }) => {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDetails = () => {
    const summary = `Varad Medical Bill #${receipt.receiptNumber}\nDate: ${formatDateTime(receipt.invoiceDate)}\nPatient: ${receipt.customerName}\nDoctor: ${receipt.doctorName || 'Self'}\nHospital: ${receipt.hospitalName || 'Direct'}\nFinal Amount: ${formatCurrency(receipt.finalPayableAmount || receipt.netPayable)}\nPharmacist: Mr. Sagar Balu Patil`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalAmount = receipt.finalPayableAmount || receipt.netPayable;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="print-receipt-modal relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Action bar (Hidden when printing) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-slate-800 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Bill Generated Successfully</span>
            <span className="text-xs text-slate-300 font-mono">({receipt.receiptNumber})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDetails}
              className="px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clean, Simple, Professional Medical Bill Sheet */}
        <div className="p-6 sm:p-8 text-slate-900 bg-white">
          {/* Prominent Medical Store Name and Address */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 uppercase">
              Varad Medical
            </h1>
            <p className="text-sm font-medium text-slate-700 mt-1 max-w-xl mx-auto">
              Vani Galli, Gargoti, Tal. Bhudargad, Dist. Kolhapur – 416209
            </p>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Phone: {receipt.storeDetails.phone}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-mono text-slate-700">
              <div>
                <strong>Bill No:</strong> {receipt.receiptNumber}
              </div>
              <div>
                <strong>Date &amp; Time:</strong> {formatDateTime(receipt.invoiceDate)}
              </div>
            </div>
          </div>

          {/* Billing Details: Patient Name, Doctor Name, Hospital Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 px-3.5 border border-slate-200 rounded-lg text-xs mb-5 bg-slate-50">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold tracking-wider">Patient Name:</span>
              <strong className="text-sm text-slate-900 block mt-0.5">{receipt.customerName}</strong>
              {receipt.customerPhone && (
                <span className="text-[11px] text-slate-600 font-mono mt-0.5 block">Ph: {receipt.customerPhone}</span>
              )}
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold tracking-wider">Doctor Name:</span>
              <strong className="text-sm text-slate-900 block mt-0.5">
                {receipt.doctorName || 'Self / OTC'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold tracking-wider">Hospital Name:</span>
              <strong className="text-sm text-slate-900 block mt-0.5">
                {receipt.hospitalName || 'Direct / Private Clinic'}
              </strong>
              <span className="text-[11px] text-slate-600 font-mono mt-0.5 block">
                Mode: <strong>{receipt.paymentMethod}</strong>
              </span>
            </div>
          </div>

          {/* Items Table - Clean, individual tablet quantities, NO GST */}
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-100 text-slate-800">
                  <th className="py-2.5 px-2 font-semibold w-8 text-center">#</th>
                  <th className="py-2.5 px-3 font-semibold">Medicine Description</th>
                  <th className="py-2.5 px-2 font-semibold font-mono text-center">Batch</th>
                  <th className="py-2.5 px-2 font-semibold font-mono text-center">Expiry</th>
                  <th className="py-2.5 px-3 font-semibold font-mono text-right">Quantity</th>
                  <th className="py-2.5 px-3 font-semibold font-mono text-right">Rate (₹)</th>
                  <th className="py-2.5 px-2 font-semibold font-mono text-right">Disc%</th>
                  <th className="py-2.5 px-3 font-semibold font-mono text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {receipt.items.map((item, idx) => (
                  <tr key={item.medicineId} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-slate-500 font-normal italic">{item.genericName}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-700 font-semibold">{item.batchNumber}</td>
                    <td className="py-2.5 px-2 text-center text-slate-700">{item.expiryDate}</td>
                    {/* Individual tablet quantities */}
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-2 text-right text-slate-700">{item.discountPercent}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-950">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Billing Amount Details: Discount Amount, Final Payable Amount (NO GST) */}
          <div className="border-t-2 border-slate-900 pt-4 mb-6">
            <div className="max-w-xs ml-auto space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-700">
                <span className="font-sans">Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatCurrency(receipt.subtotal)}</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span className="font-sans">Discount Amount:</span>
                <span className="font-bold tabular-nums">
                  {receipt.discountAmount > 0 ? `- ${formatCurrency(receipt.discountAmount)}` : '₹0.00'}
                </span>
              </div>

              <div className="flex justify-between py-2 text-base font-extrabold text-slate-950 border-t-2 border-slate-900 mt-2 pt-2 bg-slate-50 px-2.5 rounded">
                <span className="font-sans">Final Payable Amount:</span>
                <span className="text-teal-900 tabular-nums">{formatCurrency(finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Pharmacist Name - Mr. Sagar Balu Patil ONLY */}
          <div className="mt-8 pt-4 border-t border-slate-300 flex justify-end text-xs">
            <div className="text-right">
              <div className="font-bold text-sm text-slate-900 font-sans">
                Pharmacist Name: Mr. Sagar Balu Patil
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden when printing) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            {onNewSale && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNewSale();
                }}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors"
              >
                Start New Bill
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 text-xs sm:text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
