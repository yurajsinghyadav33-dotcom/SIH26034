import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { ViolationSeverity, ViolationStatus } from '@sih/shared';

export interface IViolationDocument extends Document {
  violationId: string;
  inspectionId: Types.ObjectId;
  complianceResultId: Types.ObjectId;
  productId: Types.ObjectId;
  ruleId: string;
  clause: string;
  severity: ViolationSeverity;
  detectedIssue: string;
  status: ViolationStatus;
  penaltySection: string;
  estimatedFineInr?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ViolationSchema = new Schema<IViolationDocument>(
  {
    violationId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
    complianceResultId: { type: Schema.Types.ObjectId, ref: 'ComplianceResult', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    ruleId: { type: String, required: true, index: true },
    clause: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: ['CRITICAL', 'MAJOR', 'MINOR', 'INFO'],
      default: 'CRITICAL',
      index: true,
    },
    detectedIssue: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['OPEN', 'NOTICE_ISSUED', 'COMPOUNDED', 'RESOLVED', 'DISMISSED'],
      default: 'OPEN',
      index: true,
    },
    penaltySection: {
      type: String,
      required: true,
      default: 'Section 36 of Legal Metrology Act, 2009',
    },
    estimatedFineInr: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding open violations per product
ViolationSchema.index({ productId: 1, status: 1 });
// Compound index for enforcement registers
ViolationSchema.index({ severity: 1, status: 1 });

export const ViolationModel: Model<IViolationDocument> =
  mongoose.models.Violation || mongoose.model<IViolationDocument>('Violation', ViolationSchema);
