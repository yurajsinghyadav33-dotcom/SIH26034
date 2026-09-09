import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { CommodityCategory, ComplianceStatus } from '@sih/shared';

export interface IInspectionDocument extends Document {
  inspectionId: string;
  productId: Types.ObjectId;
  inspectorId: Types.ObjectId;
  reviewerId?: Types.ObjectId;
  batchNumber: string;
  dateOfManufacture: string;
  mrpDeclared: string;
  unitSalePriceDeclared?: string;
  category: CommodityCategory;
  overallStatus: string;
  processingStatus: 'PENDING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  totalViolations: number;
  criticalViolations: number;
  ruleVersionUsed: string;
  inspectedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionSchema = new Schema<IInspectionDocument>(
  {
    inspectionId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true, index: true },
    batchNumber: { type: String, required: true, trim: true },
    dateOfManufacture: { type: String, required: true, trim: true },
    mrpDeclared: { type: String, required: true, trim: true },
    unitSalePriceDeclared: { type: String, trim: true },
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
    overallStatus: {
      type: String,
      required: true,
      enum: ['COMPLIANT', 'NON_COMPLIANT', 'FLAGGED_FOR_REVIEW', 'INCOMPLETE_DATA', 'FLAGGED', 'NOT_APPLICABLE'],
      default: 'FLAGGED_FOR_REVIEW',
      index: true,
    },
    processingStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'ANALYZING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
      index: true,
    },
    totalViolations: { type: Number, default: 0 },
    criticalViolations: { type: Number, default: 0 },
    ruleVersionUsed: { type: String, required: true, default: '2011.1' },
    inspectedAt: { type: Date, required: true, default: Date.now, index: true },
    reviewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying inspections by product and date
InspectionSchema.index({ productId: 1, inspectedAt: -1 });
// Compound index for officer workload and audit status
InspectionSchema.index({ inspectorId: 1, overallStatus: 1 });

export const InspectionModel: Model<IInspectionDocument> =
  mongoose.models.Inspection || mongoose.model<IInspectionDocument>('Inspection', InspectionSchema);
