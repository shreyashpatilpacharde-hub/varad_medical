import React, { createContext, useContext, useState, useEffect } from 'react';

const PharmacyContext = createContext(undefined);

export function PharmacyProvider({ children }) {
  // १. ब्राउझरच्या लोकल मेमरीमधून सुरुवातीचा डेटा लोड करणे
  const [medicines, setMedicines] = useState(() => {
    const localData = localStorage.getItem('varad_inventory');
    return localData ? JSON.parse(localData) : [];
  });

  const [receipts, setReceipts] = useState(() => {
    const localReceipts = localStorage.getItem('varad_receipts');
    return localReceipts ? JSON.parse(localReceipts) : [];
  });

  const [activeReceipt, setActiveReceipt] = useState(null);

  // २. जेव्हा जेव्हा नवीन औषध किंवा बिल येईल, ते मेमरीत सेव्ह करणे
  useEffect(() => {
    localStorage.setItem('varad_inventory', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('varad_receipts', JSON.stringify(receipts));
  }, [receipts]);

  // ३. नवीन औषध जोडण्याचे फंक्शन (Add Medicine)
  const addMedicine = async (medicineData) => {
    const newMed = {
      ...medicineData,
      id: Date.now().toString(), // युनिक आयडी देणे
      availableStock: Number(medicineData.availableStock || 0),
      mrp: Number(medicineData.mrp || 0)
    };
    setMedicines((prev) => [...prev, newMed]);
    return { success: true, data: newMed };
  };

  // ४. बिल तयार करण्याचे फंक्शन (Create Receipt)
  const createReceipt = async (receiptData) => {
    const newReceipt = {
      ...receiptData,
      id: `REC-${Date.now()}`,
      date: new Date().toISOString()
    };
    setReceipts((prev) => [newReceipt, ...prev]);
    
    // बिल बनवल्यावर स्टॉक वजा करणे
    receiptData.items.forEach(item => {
      setMedicines(prevMeds => prevMeds.map(med => {
        if (med.id === item.medicineId || med.tabletName === item.name) {
          return { ...med, availableStock: Math.max(0, med.availableStock - item.quantity) };
        }
        return med;
      }));
    });

    setActiveReceipt(newReceipt);
    return { success: true, data: newReceipt };
  };

  return (
    <PharmacyContext.Provider value={{
      medicines,
      receipts,
      activeReceipt,
      setActiveReceipt,
      addMedicine,
      createReceipt,
      loading: false,
      error: null
    }}>
      {children}
    </PharmacyContext.Provider>
  );
}

export function usePharmacy() {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
}
