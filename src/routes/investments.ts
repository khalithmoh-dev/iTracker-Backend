import express, { Response } from 'express';
import { InvestmentModel } from '../models/Investment';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all investments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const investments = await InvestmentModel.find({ userId }).sort({ createdAt: -1 });
    res.json(
      investments.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        symbol: item.symbol || undefined,
        quantity: item.quantity,
        purchasePrice: item.purchasePrice,
        purchaseDate: item.purchaseDate,
        currentPrice: item.currentPrice || undefined,
        currentValue: item.currentValue || undefined,
        profitLoss: item.profitLoss || undefined,
        profitLossPercent: item.profitLossPercent || undefined,
      }))
    );
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new investment
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const investment = req.body;

    const created = await InvestmentModel.create({
      userId,
      id: investment.id,
      type: investment.type,
      name: investment.name,
      symbol: investment.symbol || null,
      quantity: investment.quantity,
      purchasePrice: investment.purchasePrice,
      purchaseDate: investment.purchaseDate,
      currentPrice: investment.currentPrice || null,
      currentValue: investment.currentValue || null,
      profitLoss: investment.profitLoss || null,
      profitLossPercent: investment.profitLossPercent || null,
    });

    res.json({
      id: created.id,
      type: created.type,
      name: created.name,
      symbol: created.symbol || undefined,
      quantity: created.quantity,
      purchasePrice: created.purchasePrice,
      purchaseDate: created.purchaseDate,
      currentPrice: created.currentPrice || undefined,
      currentValue: created.currentValue || undefined,
      profitLoss: created.profitLoss || undefined,
      profitLossPercent: created.profitLossPercent || undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update investment
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.symbol !== undefined) updateData.symbol = updates.symbol || null;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice;
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate;
    if (updates.currentPrice !== undefined) updateData.current_price = updates.currentPrice || null;
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue || null;
    if (updates.profitLoss !== undefined) updateData.profit_loss = updates.profitLoss || null;
    if (updates.profitLossPercent !== undefined) updateData.profit_loss_percent = updates.profitLossPercent || null;

    const updated = await InvestmentModel.findOneAndUpdate(
      { id, userId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({
      id: updated.id,
      type: updated.type,
      name: updated.name,
      symbol: updated.symbol || undefined,
      quantity: updated.quantity,
      purchasePrice: updated.purchasePrice,
      purchaseDate: updated.purchaseDate,
      currentPrice: updated.currentPrice || undefined,
      currentValue: updated.currentValue || undefined,
      profitLoss: updated.profitLoss || undefined,
      profitLossPercent: updated.profitLossPercent || undefined,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete investment
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const deleted = await InvestmentModel.findOneAndDelete({ id, userId });

    if (!deleted) {
      return res.status(404).json({ error: 'Investment not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk update investments (for price updates)
router.post('/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const investments = req.body;

    await InvestmentModel.deleteMany({ userId });

    // Insert all investments
    if (investments.length > 0) {
      const investmentsToInsert = investments.map((inv: any) => ({
        userId,
        id: inv.id,
        type: inv.type,
        name: inv.name,
        symbol: inv.symbol || null,
        quantity: inv.quantity,
        purchasePrice: inv.purchasePrice,
        purchaseDate: inv.purchaseDate,
        currentPrice: inv.currentPrice || null,
        currentValue: inv.currentValue || null,
        profitLoss: inv.profitLoss || null,
        profitLossPercent: inv.profitLossPercent || null,
      }));

      await InvestmentModel.insertMany(investmentsToInsert);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

