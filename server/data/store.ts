import {
  Medicine,
  Receipt,
  ReceiptItem,
  BillingRequest,
  StoreStats,
  StockTransaction,
  LowStockAnnouncement,
  AnnouncementItem,
} from '../../src/types/pharmacy.js';

// Medical store metadata for bill receipt (Prominently displayed at top)
export const STORE_DETAILS = {
  storeName: 'Varad Medical',
  address: 'Vani Galli, Gargoti, Tal. Bhudargad, Dist. Kolhapur – 416209',
  phone: '+91 98220 54321 / (02324) 222450',
  email: 'contact@varadmedical.in',
  dlNumber: 'DL-20B/21B-MH-KLP-51289',
  gstin: '27AWQPV4812K1ZY',
};

// Required Pharmacist Name on the bill (Strictly Mr. Sagar Balu Patil)
export const OFFICIAL_PHARMACIST_NAME = 'Mr. Sagar Balu Patil';

// Medicines stored and sold in individual tablet quantities
const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-101',
    name: 'Paracetamol 650mg (Dolo)',
    genericName: 'Paracetamol / Acetaminophen',
    category: 'Analgesic & Antipyretic',
    batchNumber: 'DL-2410A',
    expiryDate: '2027-08-31',
    mrp: 3.50, // ₹3.50 per individual tablet
    purchaseRate: 2.10,
    availableQty: 180, // 180 individual tablets
    reorderLevel: 30, // 30 tablets
    unit: 'tablets',
    manufacturer: 'Micro Labs Ltd',
    locationRack: 'Rack A-01',
  },
  {
    id: 'med-102',
    name: 'Amoxicillin & Potassium Clavulanate (Augmentin 625)',
    genericName: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'Antibiotic',
    batchNumber: 'AUG-8840',
    expiryDate: '2027-04-15',
    mrp: 20.40, // ₹20.40 per tablet
    purchaseRate: 14.50,
    availableQty: 7, // LOW STOCK (<10 tablets)
    reorderLevel: 15,
    unit: 'tablets',
    manufacturer: 'GlaxoSmithKline (GSK)',
    locationRack: 'Rack B-03',
  },
  {
    id: 'med-103',
    name: 'Azithromycin 500mg (Azithral)',
    genericName: 'Azithromycin',
    category: 'Antibiotic',
    batchNumber: 'AZT-9022',
    expiryDate: '2026-11-20',
    mrp: 23.60, // ₹23.60 per tablet
    purchaseRate: 16.50,
    availableQty: 5, // LOW STOCK (<10 tablets)
    reorderLevel: 12,
    unit: 'tablets',
    manufacturer: 'Alembic Pharma',
    locationRack: 'Rack B-04',
  },
  {
    id: 'med-104',
    name: 'Pantoprazole 40mg + Domperidone (Pan-D)',
    genericName: 'Pantoprazole 40mg + Domperidone 30mg',
    category: 'Gastrointestinal & Antacid',
    batchNumber: 'PND-7331',
    expiryDate: '2027-11-20',
    mrp: 19.80, // ₹19.80 per tablet/capsule
    purchaseRate: 13.00,
    availableQty: 92, // 92 tablets
    reorderLevel: 25,
    unit: 'tablets',
    manufacturer: 'Alkem Laboratories',
    locationRack: 'Rack C-02',
  },
  {
    id: 'med-105',
    name: 'Metformin Hydrochloride 500mg (Glycomet)',
    genericName: 'Metformin HCl (Sustained Release)',
    category: 'Antidiabetic',
    batchNumber: 'GLY-3319',
    expiryDate: '2028-02-10',
    mrp: 4.50, // ₹4.50 per tablet
    purchaseRate: 2.90,
    availableQty: 140, // 140 tablets
    reorderLevel: 30,
    unit: 'tablets',
    manufacturer: 'USV Ltd',
    locationRack: 'Rack D-01',
  },
  {
    id: 'med-106',
    name: 'Atorvastatin 10mg (Atorva)',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular & Statin',
    batchNumber: 'ATV-5104',
    expiryDate: '2027-09-30',
    mrp: 9.60, // ₹9.60 per tablet
    purchaseRate: 6.40,
    availableQty: 8, // LOW STOCK (<10 tablets)
    reorderLevel: 20,
    unit: 'tablets',
    manufacturer: 'Zydus Cadila',
    locationRack: 'Rack D-05',
  },
  {
    id: 'med-107',
    name: 'Cetirizine 10mg (Cetzine)',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Antihistamine & Allergy',
    batchNumber: 'CTZ-1190',
    expiryDate: '2026-11-08', // Expiring within 1 month (~17 days)
    mrp: 2.20, // ₹2.20 per tablet
    purchaseRate: 1.25,
    availableQty: 240, // 240 tablets
    reorderLevel: 40,
    unit: 'tablets',
    manufacturer: 'Dr. Reddy\'s Labs',
    locationRack: 'Rack A-05',
  },
  {
    id: 'med-108',
    name: 'Telmisartan 40mg (Telma 40)',
    genericName: 'Telmisartan',
    category: 'Cardiovascular & Antihypertensive',
    batchNumber: 'TLM-4890',
    expiryDate: '2027-07-22',
    mrp: 11.00, // ₹11.00 per tablet
    purchaseRate: 7.40,
    availableQty: 65, // 65 tablets
    reorderLevel: 20,
    unit: 'tablets',
    manufacturer: 'Glenmark Pharma',
    locationRack: 'Rack D-03',
  },
  {
    id: 'med-109',
    name: 'Montelukast 10mg + Levocetirizine 5mg (Montair-LC)',
    genericName: 'Montelukast Sodium + Levocetirizine',
    category: 'Respiratory & Allergy',
    batchNumber: 'MLC-6112',
    expiryDate: '2027-10-15',
    mrp: 21.50, // ₹21.50 per tablet
    purchaseRate: 15.00,
    availableQty: 4, // LOW STOCK (<10 tablets)
    reorderLevel: 15,
    unit: 'tablets',
    manufacturer: 'Cipla Ltd',
    locationRack: 'Rack B-01',
  },
  {
    id: 'med-110',
    name: 'Omeprazole 20mg (Omez)',
    genericName: 'Omeprazole Gastro-resistant',
    category: 'Gastrointestinal & Antacid',
    batchNumber: 'OMZ-8891',
    expiryDate: '2027-06-30',
    mrp: 6.20, // ₹6.20 per tablet
    purchaseRate: 3.80,
    availableQty: 115,
    reorderLevel: 25,
    unit: 'tablets',
    manufacturer: 'Dr. Reddy\'s Labs',
    locationRack: 'Rack C-01',
  },
  {
    id: 'med-111',
    name: 'Ibuprofen 400mg + Paracetamol 325mg (Combiflam)',
    genericName: 'Ibuprofen + Paracetamol',
    category: 'Analgesic & NSAID',
    batchNumber: 'CMB-4402',
    expiryDate: '2027-12-10',
    mrp: 4.80, // ₹4.80 per tablet
    purchaseRate: 3.10,
    availableQty: 85,
    reorderLevel: 20,
    unit: 'tablets',
    manufacturer: 'Sanofi India',
    locationRack: 'Rack A-02',
  },
  {
    id: 'med-112',
    name: 'Vitamin C 500mg Chewable (Limcee)',
    genericName: 'Ascorbic Acid (Vitamin C)',
    category: 'Vitamins & Supplements',
    batchNumber: 'LMC-2231',
    expiryDate: '2027-03-25',
    mrp: 2.80, // ₹2.80 per tablet
    purchaseRate: 1.60,
    availableQty: 160,
    reorderLevel: 30,
    unit: 'tablets',
    manufacturer: 'Abbott Healthcare',
    locationRack: 'Rack E-01',
  },
  {
    id: 'med-113',
    name: 'Budecort 200 Inhaler (Budesonide 200mcg)',
    genericName: 'Budesonide Inhalation Aerosol',
    category: 'Respiratory & Inhaler',
    batchNumber: 'BDC-0914',
    expiryDate: '2026-11-15',
    mrp: 380.00,
    purchaseRate: 275.00,
    availableQty: 6, // LOW STOCK (<10)
    reorderLevel: 10,
    unit: 'bottles',
    manufacturer: 'Cipla Ltd',
    locationRack: 'Rack F-02',
  },
  {
    id: 'med-114',
    name: 'Betadine 10% Ointment 20g',
    genericName: 'Povidone Iodine 10% w/w',
    category: 'Antiseptic & Wound Care',
    batchNumber: 'BTD-6672',
    expiryDate: '2028-01-15',
    mrp: 125.00,
    purchaseRate: 85.00,
    availableQty: 42,
    reorderLevel: 12,
    unit: 'tubes',
    manufacturer: 'Win-Medicare',
    locationRack: 'Rack G-01',
  },
  {
    id: 'med-115',
    name: 'Oral Rehydration Salts (Electral sachet)',
    genericName: 'WHO Recommended Formula ORS',
    category: 'Electrolytes & Rehydration',
    batchNumber: 'ELC-3389',
    expiryDate: '2028-08-30',
    mrp: 24.00,
    purchaseRate: 16.00,
    availableQty: 190,
    reorderLevel: 50,
    unit: 'sachets',
    manufacturer: 'FDC Limited',
    locationRack: 'Rack E-04',
  }
];

class MemoryPharmacyStore {
  private medicines: Medicine[] = [...INITIAL_MEDICINES];
  private receipts: Receipt[] = [];
  private transactions: StockTransaction[] = [];
  private invoiceCounter = 1040;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const today = new Date();
    const twoHoursAgo = new Date(today.getTime() - 2 * 3600 * 1000).toISOString();
    const yesterday = new Date(today.getTime() - 24 * 3600 * 1000).toISOString();
    const threeDaysAgo = new Date(today.getTime() - 72 * 3600 * 1000).toISOString();

    // Initial receipt 1 (sold in tablet quantities, clean bill without GST, Pharmacist Mr. Sagar Balu Patil)
    this.receipts.push({
      id: 'inv-1039',
      receiptNumber: 'INV-2026-1039',
      invoiceDate: twoHoursAgo,
      customerName: 'Sanjay Anandrao Patil',
      customerPhone: '+91 98224 81920',
      doctorName: 'Dr. Rahul R. Desai (MBBS, DNB)',
      hospitalName: 'Sub-District Hospital, Gargoti',
      paymentMethod: 'UPI',
      items: [
        {
          medicineId: 'med-101',
          name: 'Paracetamol 650mg (Dolo)',
          genericName: 'Paracetamol / Acetaminophen',
          batchNumber: 'DL-2410A',
          expiryDate: '2027-08-31',
          quantity: 10, // 10 tablets
          unit: 'tablets',
          unitPrice: 3.50,
          discountPercent: 0,
          discountAmount: 0,
          total: 35.00,
        },
        {
          medicineId: 'med-104',
          name: 'Pantoprazole 40mg + Domperidone (Pan-D)',
          genericName: 'Pantoprazole 40mg + Domperidone 30mg',
          batchNumber: 'PND-7331',
          expiryDate: '2027-11-20',
          quantity: 5, // 5 tablets
          unit: 'tablets',
          unitPrice: 19.80,
          discountPercent: 0,
          discountAmount: 0,
          total: 99.00,
        }
      ],
      itemCount: 2,
      subtotal: 134.00,
      discountAmount: 14.00,
      discountPercent: 10,
      finalPayableAmount: 120.00,
      netPayable: 120.00,
      roundOff: 0.00,
      pharmacist: OFFICIAL_PHARMACIST_NAME,
      storeDetails: STORE_DETAILS
    });

    // Initial receipt 2
    this.receipts.push({
      id: 'inv-1038',
      receiptNumber: 'INV-2026-1038',
      invoiceDate: yesterday,
      customerName: 'Pooja Vishwanath Kamble',
      customerPhone: '+91 97632 11450',
      doctorName: 'Dr. Suhas K. More (MS Ortho)',
      hospitalName: 'More Hospital & Accident Center, Gargoti',
      paymentMethod: 'CASH',
      items: [
        {
          medicineId: 'med-111',
          name: 'Ibuprofen 400mg + Paracetamol 325mg (Combiflam)',
          genericName: 'Ibuprofen + Paracetamol',
          batchNumber: 'CMB-4402',
          expiryDate: '2027-12-10',
          quantity: 6, // 6 tablets
          unit: 'tablets',
          unitPrice: 4.80,
          discountPercent: 0,
          discountAmount: 0,
          total: 28.80,
        },
        {
          medicineId: 'med-107',
          name: 'Cetirizine 10mg (Cetzine)',
          genericName: 'Cetirizine Hydrochloride',
          batchNumber: 'CTZ-1190',
          expiryDate: '2028-05-18',
          quantity: 10, // 10 tablets
          unit: 'tablets',
          unitPrice: 2.20,
          discountPercent: 0,
          discountAmount: 0,
          total: 22.00,
        }
      ],
      itemCount: 2,
      subtotal: 50.80,
      discountAmount: 0.80,
      discountPercent: 0,
      finalPayableAmount: 50.00,
      netPayable: 50.00,
      roundOff: 0.00,
      pharmacist: OFFICIAL_PHARMACIST_NAME,
      storeDetails: STORE_DETAILS
    });

    // Initial receipt 3
    this.receipts.push({
      id: 'inv-1037',
      receiptNumber: 'INV-2026-1037',
      invoiceDate: threeDaysAgo,
      customerName: 'Baburao Ramchandra Desai',
      customerPhone: '+91 94238 90123',
      doctorName: 'Dr. Sneha V. Joshi (MD Medicine)',
      hospitalName: 'Bhudargad Rural Health Clinic',
      paymentMethod: 'UPI',
      items: [
        {
          medicineId: 'med-105',
          name: 'Metformin Hydrochloride 500mg (Glycomet)',
          genericName: 'Metformin HCl (Sustained Release)',
          batchNumber: 'GLY-3319',
          expiryDate: '2028-02-10',
          quantity: 20, // 20 tablets
          unit: 'tablets',
          unitPrice: 4.50,
          discountPercent: 0,
          discountAmount: 0,
          total: 90.00,
        },
        {
          medicineId: 'med-108',
          name: 'Telmisartan 40mg (Telma 40)',
          genericName: 'Telmisartan',
          batchNumber: 'TLM-4890',
          expiryDate: '2027-07-22',
          quantity: 10, // 10 tablets
          unit: 'tablets',
          unitPrice: 11.00,
          discountPercent: 0,
          discountAmount: 0,
          total: 110.00,
        }
      ],
      itemCount: 2,
      subtotal: 200.00,
      discountAmount: 10.00,
      discountPercent: 5,
      finalPayableAmount: 190.00,
      netPayable: 190.00,
      roundOff: 0.00,
      pharmacist: OFFICIAL_PHARMACIST_NAME,
      storeDetails: STORE_DETAILS
    });

    // Seed transaction log
    this.transactions.push({
      id: 'tx-1',
      date: twoHoursAgo,
      type: 'SALE',
      medicineId: 'med-101',
      medicineName: 'Paracetamol 650mg (Dolo)',
      batchNumber: 'DL-2410A',
      quantityChange: -10,
      remainingStock: 180,
      referenceId: 'INV-2026-1039',
      notes: 'Sold 10 tablets to Sanjay Anandrao Patil',
    });
    this.transactions.push({
      id: 'tx-2',
      date: twoHoursAgo,
      type: 'SALE',
      medicineId: 'med-104',
      medicineName: 'Pantoprazole 40mg + Domperidone (Pan-D)',
      batchNumber: 'PND-7331',
      quantityChange: -5,
      remainingStock: 92,
      referenceId: 'INV-2026-1039',
      notes: 'Sold 5 tablets to Sanjay Anandrao Patil',
    });
  }

  public getMedicines(filter?: string, search?: string): Medicine[] {
    let result = [...this.medicines];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        m =>
          m.name.toLowerCase().includes(q) ||
          m.genericName.toLowerCase().includes(q) ||
          m.batchNumber.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q)
      );
    }

    if (filter === 'low_stock') {
      result = result.filter(m => m.availableQty <= m.reorderLevel || m.availableQty < 10);
    } else if (filter === 'expiring_soon') {
      const threshold = new Date();
      threshold.setMonth(threshold.getMonth() + 6);
      result = result.filter(m => new Date(m.expiryDate) <= threshold);
    }

    return result.sort((a, b) => {
      const aLow = a.availableQty <= a.reorderLevel || a.availableQty < 10;
      const bLow = b.availableQty <= b.reorderLevel || b.availableQty < 10;
      if (aLow && !bLow) return -1;
      if (!aLow && bLow) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  public getMedicineById(id: string): Medicine | undefined {
    return this.medicines.find(m => m.id === id);
  }

  public addMedicine(medData: Omit<Medicine, 'id'>): Medicine {
    const newId = `med-${Date.now().toString().slice(-5)}`;
    const newMedicine: Medicine = {
      ...medData,
      id: newId,
      name: medData.name.trim(),
      batchNumber: medData.batchNumber.trim().toUpperCase(),
      availableQty: Number(medData.availableQty) || 0,
      reorderLevel: Number(medData.reorderLevel) || 10,
      mrp: Number(medData.mrp) || 0,
      purchaseRate: Number(medData.purchaseRate) || 0,
      unit: medData.unit || 'tablets',
    };

    this.medicines.unshift(newMedicine);

    this.transactions.unshift({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      type: 'RESTOCK',
      medicineId: newMedicine.id,
      medicineName: newMedicine.name,
      batchNumber: newMedicine.batchNumber,
      quantityChange: newMedicine.availableQty,
      remainingStock: newMedicine.availableQty,
      notes: `New stock registered at Varad Medical: ${newMedicine.availableQty} ${newMedicine.unit}`,
    });

    return newMedicine;
  }

  public updateMedicine(id: string, updates: Partial<Medicine>): Medicine | null {
    const index = this.medicines.findIndex(m => m.id === id);
    if (index === -1) return null;

    const existing = this.medicines[index];
    const oldQty = existing.availableQty;

    const updated: Medicine = {
      ...existing,
      ...updates,
      availableQty: updates.availableQty !== undefined ? Number(updates.availableQty) : existing.availableQty,
      reorderLevel: updates.reorderLevel !== undefined ? Number(updates.reorderLevel) : existing.reorderLevel,
      mrp: updates.mrp !== undefined ? Number(updates.mrp) : existing.mrp,
      purchaseRate: updates.purchaseRate !== undefined ? Number(updates.purchaseRate) : existing.purchaseRate,
    };

    this.medicines[index] = updated;

    if (updates.availableQty !== undefined && updates.availableQty !== oldQty) {
      const delta = updated.availableQty - oldQty;
      this.transactions.unshift({
        id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        type: delta > 0 ? 'RESTOCK' : 'ADJUSTMENT',
        medicineId: updated.id,
        medicineName: updated.name,
        batchNumber: updated.batchNumber,
        quantityChange: delta,
        remainingStock: updated.availableQty,
        notes: `Stock quantity manual adjustment (${delta > 0 ? `+${delta}` : delta} ${updated.unit})`,
      });
    }

    return updated;
  }

  public deleteMedicine(id: string): boolean {
    const idx = this.medicines.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.medicines.splice(idx, 1);
    return true;
  }

  // Process sale with individual tablet quantities and NO GST
  public processSale(billingReq: BillingRequest): { success: boolean; receipt?: Receipt; error?: string } {
    if (!billingReq.items || billingReq.items.length === 0) {
      return { success: false, error: 'Cannot generate bill with an empty cart.' };
    }

    // Step 1: Pre-validate all medicines and stock levels in tablet units
    for (const item of billingReq.items) {
      const med = this.medicines.find(m => m.id === item.medicineId);
      if (!med) {
        return { success: false, error: `Medicine with ID ${item.medicineId} not found in inventory.` };
      }
      if (item.quantity <= 0) {
        return { success: false, error: `Invalid quantity for ${med.name}. Must be at least 1 ${med.unit}.` };
      }
      if (med.availableQty < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${med.name}". Available: ${med.availableQty} ${med.unit}, requested: ${item.quantity} ${med.unit}.`
        };
      }
    }

    // Step 2: Compute line items and deduct individual tablet stock
    const receiptItems: ReceiptItem[] = [];
    let grossSubtotal = 0;
    let totalDiscount = 0;

    const globalDiscountPercent = billingReq.discountPercent || 0;

    for (const orderItem of billingReq.items) {
      const med = this.medicines.find(m => m.id === orderItem.medicineId)!;
      
      // Deduct individual tablet quantity from stock
      med.availableQty -= orderItem.quantity;

      const qty = orderItem.quantity;
      const unitPrice = med.mrp; // Rate per individual tablet
      const itemSubtotal = qty * unitPrice;
      
      const effectiveDiscountPercent = Math.max(orderItem.discountPercent || 0, globalDiscountPercent);
      const discountVal = (itemSubtotal * effectiveDiscountPercent) / 100;
      const lineTotal = itemSubtotal - discountVal;

      grossSubtotal += itemSubtotal;
      totalDiscount += discountVal;

      receiptItems.push({
        medicineId: med.id,
        name: med.name,
        genericName: med.genericName,
        batchNumber: med.batchNumber,
        expiryDate: med.expiryDate,
        quantity: qty,
        unit: med.unit, // 'tablets'
        unitPrice: Number(unitPrice.toFixed(2)),
        discountPercent: effectiveDiscountPercent,
        discountAmount: Number(discountVal.toFixed(2)),
        total: Number(lineTotal.toFixed(2)),
      });

      // Log stock transaction
      this.transactions.unshift({
        id: `tx-${Date.now()}-${med.id}`,
        date: new Date().toISOString(),
        type: 'SALE',
        medicineId: med.id,
        medicineName: med.name,
        batchNumber: med.batchNumber,
        quantityChange: -qty,
        remainingStock: med.availableQty,
        referenceId: `INV-2026-${this.invoiceCounter + 1}`,
        notes: `Sold ${qty} ${med.unit} to ${billingReq.customerName || 'Patient'}`,
      });
    }

    this.invoiceCounter += 1;
    const invNumber = `INV-2026-${this.invoiceCounter}`;
    const rawTotal = grossSubtotal - totalDiscount;
    const finalPayableAmount = Math.round(rawTotal);
    const roundOff = Number((finalPayableAmount - rawTotal).toFixed(2));

    // Clean formal receipt displaying only required details:
    // Medical Name & Address, Patient, Doctor, Hospital, Pharmacist Mr. Sagar Balu Patil,
    // Discount Amount, Final Payable Amount. NO GST displayed.
    const receipt: Receipt = {
      id: `inv-${this.invoiceCounter}`,
      receiptNumber: invNumber,
      invoiceDate: new Date().toISOString(),
      customerName: billingReq.customerName?.trim() || 'Walk-in Patient',
      customerPhone: billingReq.customerPhone?.trim() || undefined,
      doctorName: billingReq.doctorName?.trim() || undefined,
      hospitalName: billingReq.hospitalName?.trim() || undefined,
      paymentMethod: billingReq.paymentMethod || 'CASH',
      items: receiptItems,
      itemCount: receiptItems.length,
      subtotal: Number(grossSubtotal.toFixed(2)),
      discountAmount: Number(totalDiscount.toFixed(2)),
      discountPercent: globalDiscountPercent,
      finalPayableAmount,
      netPayable: finalPayableAmount,
      roundOff,
      pharmacist: OFFICIAL_PHARMACIST_NAME, // Mr. Sagar Balu Patil
      storeDetails: STORE_DETAILS
    };

    this.receipts.unshift(receipt);

    return { success: true, receipt };
  }

  public getReceipts(): Receipt[] {
    return [...this.receipts];
  }

  public getReceiptById(id: string): Receipt | undefined {
    return this.receipts.find(r => r.id === id || r.receiptNumber === id);
  }

  public getTransactions(): StockTransaction[] {
    return [...this.transactions];
  }

  // Announcements: Display medicines running low on stock AND medicines expiring within the next 1 month
  public getLowStockAnnouncements(): AnnouncementItem[] {
    const announcements: AnnouncementItem[] = [];
    const now = new Date();

    // 1. Medicine Expiry Alerts (expiring within the next 1 month / 30 days)
    for (const m of this.medicines) {
      const expDate = new Date(m.expiryDate);
      const diffTime = expDate.getTime() - now.getTime();
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // If medicine expires within 30 days (next one month) or is already expired
      if (daysToExpiry <= 30) {
        let msg = '';
        if (daysToExpiry < 0) {
          msg = `Expired ${Math.abs(daysToExpiry)} days ago on ${m.expiryDate}. Remove from active dispensary immediately!`;
        } else if (daysToExpiry === 0) {
          msg = `Expires TODAY (${m.expiryDate}). Action required.`;
        } else {
          msg = `Expiring in ${daysToExpiry} days (${m.expiryDate}). Near expiry alert for Varad Medical.`;
        }

        announcements.push({
          id: `exp-${m.id}`,
          type: 'EXPIRY_ALERT',
          medicineId: m.id,
          medicineName: m.name,
          genericName: m.genericName,
          batchNumber: m.batchNumber,
          currentStock: m.availableQty,
          reorderLevel: m.reorderLevel,
          unit: m.unit, // 'tablets'
          locationRack: m.locationRack,
          expiryDate: m.expiryDate,
          daysToExpiry,
          message: msg,
          severity: daysToExpiry <= 10 ? 'critical' : 'warning',
        });
      }
    }

    // 2. Low-Stock Alerts (stock is running low: < 10 tablets or <= reorder level)
    for (const m of this.medicines) {
      if (m.availableQty < 10 || m.availableQty <= m.reorderLevel) {
        announcements.push({
          id: `low-${m.id}`,
          type: 'LOW_STOCK',
          medicineId: m.id,
          medicineName: m.name,
          genericName: m.genericName,
          batchNumber: m.batchNumber,
          currentStock: m.availableQty,
          reorderLevel: m.reorderLevel,
          unit: m.unit, // 'tablets'
          locationRack: m.locationRack,
          expiryDate: m.expiryDate,
          message: `Only ${m.availableQty} ${m.unit} remaining in stock (Reorder threshold: ${m.reorderLevel} ${m.unit}).`,
          severity: m.availableQty <= 5 ? 'critical' : 'warning',
        });
      }
    }

    return announcements;
  }

  public getStats(): StoreStats {
    const totalMedicines = this.medicines.length;
    const totalStockUnits = this.medicines.reduce((acc, m) => acc + m.availableQty, 0);
    const lowStockCount = this.medicines.filter(m => m.availableQty <= m.reorderLevel || m.availableQty < 10).length;
    
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    const expiringSoonCount = this.medicines.filter(m => new Date(m.expiryDate) <= sixMonthsFromNow).length;

    const today = new Date().toISOString().slice(0, 10);
    const todayReceipts = this.receipts.filter(r => r.invoiceDate.slice(0, 10) === today);
    const totalSalesToday = todayReceipts.length;
    const todayRevenue = todayReceipts.reduce((acc, r) => acc + r.finalPayableAmount, 0);

    return {
      totalMedicines,
      totalStockUnits,
      lowStockCount,
      expiringSoonCount,
      totalSalesToday,
      todayRevenue: Number(todayRevenue.toFixed(2)),
    };
  }
}

export const pharmacyStore = new MemoryPharmacyStore();
