export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  mrp: number; // Price per individual tablet
  purchaseRate: number;
  availableQty: number; // In individual tablets
  reorderLevel: number; // In individual tablets
  unit: string; // 'tablets', 'bottles', 'tubes', etc.
  manufacturer: string;
  gstRate?: number;
  locationRack: string;
}

export interface CartItem {
  medicineId: string;
  medicine: Medicine;
  quantity: number; // In individual tablets
  unitPrice: number; // Price per tablet
  discountPercent: number;
  subtotal: number;
  discountAmount: number;
  total: number; // Line item final amount
  gstRate?: number;
}

export interface ReceiptItem {
  medicineId: string;
  name: string;
  genericName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number; // Individual tablet quantity
  unit: string; // 'tablets'
  unitPrice: number; // Rate per tablet
  discountPercent: number;
  discountAmount: number;
  total: number;
  gstRate?: number;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  invoiceDate: string; // ISO string
  customerName: string; // Patient Name
  customerPhone?: string;
  doctorName?: string; // Doctor Name
  hospitalName?: string; // Hospital Name
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING';
  items: ReceiptItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  finalPayableAmount: number; // Final payable amount without GST
  netPayable: number; // Alias for finalPayableAmount
  roundOff: number;
  pharmacist: string; // Strictly "Mr. Sagar Balu Patil"
  storeDetails: {
    storeName: string; // "Varad Medical"
    address: string; // "Vani Galli, Gargoti, Tal. Bhudargad, Dist. Kolhapur – 416209"
    phone: string;
    email?: string;
    dlNumber?: string;
    gstin?: string;
  };
  totalGst?: number;
  taxableAmount?: number;
  cgstTotal?: number;
  sgstTotal?: number;
  grandTotal?: number;
}

export interface BillingRequest {
  customerName?: string;
  customerPhone?: string;
  doctorName?: string;
  hospitalName?: string;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING';
  discountPercent?: number;
  items: {
    medicineId: string;
    quantity: number; // Individual tablet quantity
    discountPercent?: number;
  }[];
}

export interface StockTransaction {
  id: string;
  date: string;
  type: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'INITIAL';
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantityChange: number; // in individual tablets
  remainingStock: number;
  referenceId?: string;
  notes?: string;
}

export type AnnouncementType = 'LOW_STOCK' | 'EXPIRY_ALERT';

export interface AnnouncementItem {
  id: string;
  type: AnnouncementType;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  currentStock: number; // in total individual tablets
  reorderLevel: number;
  unit: string; // 'tablets'
  locationRack: string;
  expiryDate: string;
  daysToExpiry?: number;
  message: string;
  severity?: 'critical' | 'warning';
}

export type LowStockAnnouncement = AnnouncementItem;

export interface StockAlert {
  id: string;
  medicineId: string;
  medicineName: string;
  genericName: string;
  batchNumber: string;
  type: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'EXPIRED' | 'EXPIRING_SOON';
  message: string;
  severity: 'critical' | 'warning';
  currentStock: number;
  reorderLevel: number;
  expiryDate: string;
  daysToExpiry?: number;
}

export interface StoreStats {
  totalMedicines: number;
  totalStockUnits: number;
  lowStockCount: number;
  expiringSoonCount: number;
  totalSalesToday: number;
  todayRevenue: number;
}
