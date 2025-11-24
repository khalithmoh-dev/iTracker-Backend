import mongoose, { Schema, Document } from 'mongoose';

export type InvestmentType = 'gold' | 'stocks' | 'crypto' | 'cash';

export interface InvestmentDocument extends Document {
  id: string;
  userId: string;
  type: InvestmentType;
  name: string;
  symbol?: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<InvestmentDocument>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['gold', 'stocks', 'crypto', 'cash'],
      required: true,
    },
    name: { type: String, required: true },
    symbol: { type: String },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseDate: { type: String, required: true },
    currentPrice: { type: Number },
    currentValue: { type: Number },
    profitLoss: { type: Number },
    profitLossPercent: { type: Number },
  },
  { timestamps: true }
);

export const InvestmentModel =
  mongoose.models.Investment ||
  mongoose.model<InvestmentDocument>('Investment', InvestmentSchema);

