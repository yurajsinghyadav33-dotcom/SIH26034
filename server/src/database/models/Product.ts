import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { CommodityCategory, PdpDimensions } from '@sih/shared';

export interface IProductDocument extends Document {
  sku: string;
  barcode?: string;
  productName: string;
  brand: string;
  manufacturerName: string;
  manufacturerAddress: string;
  category: CommodityCategory;
  standardNetQuantity?: {
    value: number;
    unit: string;
  };
  pdpDimensions?: PdpDimensions;
  registeredBy: Types.ObjectId;
  inspectionCount: number;
  lastInspectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    barcode: { type: String, sparse: true, index: true, trim: true },
    productName: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    manufacturerName: { type: String, required: true, trim: true },
    manufacturerAddress: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'FOOD',
        'COSMETICS',
        'ELECTRONICS',
        'CHEMICAL_HOUSEHOLD',
        'APPAREL',
        'GENERAL_MERCHANDISE',
      ],
      index: true,
    },
    standardNetQuantity: {
      value: { type: Number },
      unit: { type: String, lowercase: true, trim: true },
    },
    pdpDimensions: {
      heightMm: { type: Number },
      widthMm: { type: Number },
      areaSqCm: { type: Number },
    },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inspectionCount: { type: Number, default: 0 },
    lastInspectedAt: { type: Date, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast brand-category lookups
ProductSchema.index({ brand: 1, category: 1 });

export const ProductModel: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>('Product', ProductSchema);
