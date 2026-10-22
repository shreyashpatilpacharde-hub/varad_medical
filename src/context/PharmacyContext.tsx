import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Medicine,
  Receipt,
  CartItem,
  StoreStats,
  BillingRequest,
  LowStockAnnouncement,
  StockTransaction,
} from '../types/pharmacy.js';

interface PharmacyContextType {
  medicines: Medicine[];
  receipts: Receipt[];
  transactions: StockTransaction[];
  announcements: LowStockAnnouncement[];
  stats: StoreStats | null;
  cart: CartItem[];
  isLoading: boolean;
  error: string | null;
  activeReceipt: Receipt | null;
  setActiveReceipt: (receipt: Receipt | null) => void;
  fetchInventory: (filter?: string, search?: string) => Promise<void>;
  fetchReceipts: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchAnnouncements: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  addToCart: (medicine: Medicine, quantity: number, discountPercent?: number) => boolean;
  updateCartQuantity: (medicineId: string, quantity: number) => void;
  removeFromCart: (medicineId: string) => void;
  clearCart: () => void;
  processBilling: (billingData: {
    customerName?: string;
    customerPhone?: string;
    doctorName?: string;
    hospitalName?: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING';
    discountPercent?: number;
  }) => Promise<{ success: boolean; receipt?: Receipt; error?: string }>;
  addNewMedicine: (data: Omit<Medicine, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateMedicine: (id: string, updates: Partial<Medicine>) => Promise<{ success: boolean; error?: string }>;
  deleteMedicine: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [announcements, setAnnouncements] = useState<LowStockAnnouncement[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  const fetchInventory = useCallback(async (filter?: string, search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/inventory?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch medicines`);
      const data = await res.json();
      if (data.success) {
        setMedicines(data.medicines);
      } else {
        setError(data.error || 'Failed to load medicines');
      }
    } catch (err: any) {
      console.error('Fetch inventory error:', err);
      setError(err.message || 'Error connecting to medical store server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/receipts');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch receipts`);
      const data = await res.json();
      if (data.success) {
        setReceipts(data.receipts);
      }
    } catch (err) {
      console.error('Fetch receipts error:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/stats');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch stats`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Fetch stats error:', err);
    }
  }, []);

  // Announcements: Display only medicines whose stock is running low
  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory/announcements');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch announcements`);
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
      }
    } catch (err) {
      console.error('Fetch announcements error:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/transactions');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchInventory();
    fetchReceipts();
    fetchStats();
    fetchAnnouncements();
    fetchTransactions();
  }, [fetchInventory, fetchReceipts, fetchStats, fetchAnnouncements, fetchTransactions]);

  // Add individual tablet quantity to billing cart
  const addToCart = (medicine: Medicine, quantity: number, discountPercent: number = 0): boolean => {
    if (quantity <= 0) return false;

    // Check existing cart quantity
    const existingIndex = cart.findIndex(item => item.medicineId === medicine.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;
    const totalRequired = currentQtyInCart + quantity;

    if (totalRequired > medicine.availableQty) {
      alert(`Only ${medicine.availableQty} ${medicine.unit} available in stock for ${medicine.name}.`);
      return false;
    }

    setCart(prev => {
      const updated = [...prev];
      if (existingIndex > -1) {
        const item = updated[existingIndex];
        const newQty = item.quantity + quantity;
        const subtotal = newQty * item.unitPrice;
        const discountAmount = (subtotal * item.discountPercent) / 100;
        const total = subtotal - discountAmount;

        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          subtotal,
          discountAmount,
          total,
        };
      } else {
        const unitPrice = medicine.mrp; // Rate per individual tablet
        const subtotal = quantity * unitPrice;
        const discountAmount = (subtotal * discountPercent) / 100;
        const total = subtotal - discountAmount;

        updated.push({
          medicineId: medicine.id,
          medicine,
          quantity, // e.g. 1 tablet, 2 tablets, etc.
          unitPrice,
          discountPercent,
          subtotal,
          discountAmount,
          total,
        });
      }
      return updated;
    });

    return true;
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }

    const med = medicines.find(m => m.id === medicineId);
    if (med && quantity > med.availableQty) {
      alert(`Cannot exceed available stock of ${med.availableQty} ${med.unit}.`);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (item.medicineId === medicineId) {
          const subtotal = quantity * item.unitPrice;
          const discountAmount = (subtotal * item.discountPercent) / 100;
          const total = subtotal - discountAmount;
          return {
            ...item,
            quantity,
            subtotal,
            discountAmount,
            total,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart(prev => prev.filter(item => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processBilling = async (billingData: {
    customerName?: string;
    customerPhone?: string;
    doctorName?: string;
    hospitalName?: string;
    paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'NET_BANKING';
    discountPercent?: number;
  }): Promise<{ success: boolean; receipt?: Receipt; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Cannot process sale with an empty cart.' };
    }

    try {
      const payload: BillingRequest = {
        customerName: billingData.customerName,
        customerPhone: billingData.customerPhone,
        doctorName: billingData.doctorName,
        hospitalName: billingData.hospitalName,
        paymentMethod: billingData.paymentMethod,
        discountPercent: billingData.discountPercent || 0,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          discountPercent: item.discountPercent,
        })),
      };

      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to process billing' };
      }

      // Clear cart
      setCart([]);
      
      // Update inventory, receipts, stats, announcements, and transactions state immediately
      await Promise.all([
        fetchInventory(),
        fetchReceipts(),
        fetchStats(),
        fetchAnnouncements(),
        fetchTransactions(),
      ]);

      // Set active receipt to pop up receipt modal for printing
      setActiveReceipt(data.receipt);

      return { success: true, receipt: data.receipt };
    } catch (err: any) {
      console.error('Billing error:', err);
      return { success: false, error: err.message || 'Network error processing sale' };
    }
  };

  const addNewMedicine = async (data: Omit<Medicine, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/inventory/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to add medicine' };
      }

      await Promise.all([
        fetchInventory(),
        fetchStats(),
        fetchAnnouncements(),
        fetchTransactions(),
      ]);
      return { success: true };
    } catch (err: any) {
      console.error('Add medicine error:', err);
      return { success: false, error: err.message || 'Network error adding medicine' };
    }
  };

  const updateMedicine = async (id: string, updates: Partial<Medicine>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to update medicine' };
      }

      await Promise.all([
        fetchInventory(),
        fetchStats(),
        fetchAnnouncements(),
        fetchTransactions(),
      ]);
      return { success: true };
    } catch (err: any) {
      console.error('Update medicine error:', err);
      return { success: false, error: err.message || 'Network error updating medicine' };
    }
  };

  const deleteMedicine = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to delete medicine' };
      }

      await Promise.all([
        fetchInventory(),
        fetchStats(),
        fetchAnnouncements(),
        fetchTransactions(),
      ]);
      return { success: true };
    } catch (err: any) {
      console.error('Delete medicine error:', err);
      return { success: false, error: err.message || 'Network error deleting medicine' };
    }
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        receipts,
        transactions,
        announcements,
        stats,
        cart,
        isLoading,
        error,
        activeReceipt,
        setActiveReceipt,
        fetchInventory,
        fetchReceipts,
        fetchStats,
        fetchAnnouncements,
        fetchTransactions,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        processBilling,
        addNewMedicine,
        updateMedicine,
        deleteMedicine,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
