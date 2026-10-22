import { Router, Request, Response } from 'express';
import { pharmacyStore } from '../data/store.js';

const router = Router();

// POST /api/billing - Process a new sale, automatically deduct inventory, and return formal receipt
router.post('/', (req: Request, res: Response) => {
  try {
    const { customerName, customerPhone, doctorName, hospitalName, paymentMethod, discountPercent, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order items are required to process a sale.',
      });
    }

    const saleResult = pharmacyStore.processSale({
      customerName,
      customerPhone,
      doctorName,
      hospitalName,
      paymentMethod: paymentMethod || 'CASH',
      discountPercent: Number(discountPercent) || 0,
      items,
    });

    if (!saleResult.success || !saleResult.receipt) {
      return res.status(400).json({
        success: false,
        error: saleResult.error || 'Failed to process billing transaction.',
      });
    }

    // Return receipt structure along with updated inventory snapshot
    res.status(201).json({
      success: true,
      message: `Sale successfully completed. Receipt ${saleResult.receipt.receiptNumber} generated.`,
      receipt: saleResult.receipt,
    });
  } catch (error) {
    console.error('Error processing billing:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while processing sale and deducting inventory.',
    });
  }
});

// GET /api/receipts - Fetch list of past generated receipts
router.get('/receipts', (_req: Request, res: Response) => {
  try {
    const receipts = pharmacyStore.getReceipts();
    res.json({
      success: true,
      count: receipts.length,
      receipts,
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipts' });
  }
});

// GET /api/receipts/:id - Fetch single receipt by invoice number or ID
router.get('/receipts/:id', (req: Request, res: Response) => {
  try {
    const receipt = pharmacyStore.getReceiptById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, error: 'Receipt not found' });
    }
    res.json({ success: true, receipt });
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch receipt' });
  }
});

// GET /api/billing/transactions - Fetch all inventory change transactions
router.get('/transactions', (_req: Request, res: Response) => {
  try {
    const txs = pharmacyStore.getTransactions();
    res.json({ success: true, transactions: txs });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
  }
});

export default router;
