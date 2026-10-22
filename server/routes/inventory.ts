import { Router, Request, Response } from 'express';
import { pharmacyStore } from '../data/store.js';

const router = Router();

// GET /api/inventory - Fetch all available medicines and their stock levels
router.get('/', (req: Request, res: Response) => {
  try {
    const { filter, search } = req.query;
    const medicines = pharmacyStore.getMedicines(
      typeof filter === 'string' ? filter : undefined,
      typeof search === 'string' ? search : undefined
    );
    const stats = pharmacyStore.getStats();

    res.json({
      success: true,
      count: medicines.length,
      lowStockCount: stats.lowStockCount,
      medicines,
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ success: false, error: 'Internal server error while fetching inventory' });
  }
});

// GET /api/inventory/stats - Dashboard summary metrics
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = pharmacyStore.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve stats' });
  }
});

// GET /api/inventory/announcements - Displays ONLY medicines whose stock is running low
router.get('/announcements', (_req: Request, res: Response) => {
  try {
    const announcements = pharmacyStore.getLowStockAnnouncements();
    res.json({ success: true, count: announcements.length, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve announcements' });
  }
});

// GET /api/inventory/:id - Single medicine details
router.get('/:id', (req: Request, res: Response) => {
  try {
    const med = pharmacyStore.getMedicineById(req.params.id);
    if (!med) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, medicine: med });
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve medicine' });
  }
});

// POST /api/inventory/add - Add new medicine stock to the store
router.post('/add', (req: Request, res: Response) => {
  try {
    const {
      name,
      genericName,
      category,
      batchNumber,
      expiryDate,
      mrp,
      purchaseRate,
      availableQty,
      reorderLevel,
      unit,
      manufacturer,
      gstRate,
      locationRack,
    } = req.body;

    if (!name || !expiryDate || availableQty === undefined || mrp === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing: Brand Name, Expiry Date, Available Stock, and MRP are mandatory.',
      });
    }

    // Auto-generate batch number if not manually specified in simplified form
    const brandPrefix = (name || 'MED').replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
    const finalBatch = batchNumber && batchNumber.trim()
      ? batchNumber.trim().toUpperCase()
      : `${brandPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMedicine = pharmacyStore.addMedicine({
      name: name.trim(),
      genericName: (genericName || name).trim(),
      category: category || 'General Medicine',
      batchNumber: finalBatch,
      expiryDate,
      mrp: Number(mrp),
      purchaseRate: purchaseRate ? Number(purchaseRate) : Number(mrp) * 0.7,
      availableQty: Number(availableQty),
      reorderLevel: reorderLevel ? Number(reorderLevel) : 10,
      unit: unit || 'tablets',
      manufacturer: manufacturer || 'Varad Pharma Suppliers',
      gstRate: gstRate !== undefined ? Number(gstRate) : 12,
      locationRack: locationRack || 'Rack A-01',
    });

    res.status(201).json({
      success: true,
      message: `Stock for ${newMedicine.name} (Batch: ${newMedicine.batchNumber}) added successfully.`,
      medicine: newMedicine,
    });
  } catch (error) {
    console.error('Error adding medicine:', error);
    res.status(500).json({ success: false, error: 'Failed to add medicine' });
  }
});

// PUT /api/inventory/:id - Update existing stock or medicine information
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = pharmacyStore.updateMedicine(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({
      success: true,
      message: `Updated ${updated.name} successfully.`,
      medicine: updated,
    });
  } catch (error) {
    console.error('Error updating medicine:', error);
    res.status(500).json({ success: false, error: 'Failed to update medicine' });
  }
});

// DELETE /api/inventory/:id - Remove medicine item
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = pharmacyStore.deleteMedicine(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Medicine not found' });
    }
    res.json({ success: true, message: 'Medicine removed from inventory.' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    res.status(500).json({ success: false, error: 'Failed to delete medicine' });
  }
});

export default router;
