import express, { Request, Response } from 'express';
import { getCryptoPrice, getStockPrice, getGoldPrice } from '../services/priceService';

const router = express.Router();

// Get crypto price
router.get('/crypto/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const price = await getCryptoPrice(symbol);
    if (price) {
      res.json(price);
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get stock price
router.get('/stock/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const price = await getStockPrice(symbol);
    if (price) {
      res.json(price);
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get gold price
router.get('/gold', async (req: Request, res: Response) => {
  try {
    const price = await getGoldPrice();
    if (price) {
      res.json(price);
    } else {
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

