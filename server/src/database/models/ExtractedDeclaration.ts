import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { MandatoryDeclarationKey, BoundingBox } from '@sih/shared';

export interface IExtractedDeclarationDocument extends Document {
  scanId: Types.ObjectId;
  inspectionId: Types.ObjectId;
  declarationKey: MandatoryDeclarationKey;
  rawValue: string;
  normalizedValue?: unknown;
  confidenceScore: number;
  boundingBox?: BoundingBox;
  estimatedFontHeightMm?: number;
  isVerifiedByInspector: boolean;
  inspectorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExtractedDeclarationSchema = new Schema<IExtractedDeclarationDocument>(
  {
    scanId: { type: Schema.Types.ObjectId, ref: 'Scan', required: true, index: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
    declarationKey: {
      type: String,
      required: true,
      enum: [
        'manufacturer_details',
        'generic_name',
        'net_quantity',
        'date_of_manufacture',
        'mrp',
        'unit_sale_price',
        'consumer_care',
        'country_of_origin',
      ],
      index: true,
    },
    rawValue: { type: String, required: true },
    normalizedValue: { type: Schema.Types.Mixed },
    confidenceScore: { type: Number, required: true, min: 0, max: 100, index: true },
    boundingBox: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    estimatedFontHeightMm: { type: Number },
    isVerifiedByInspector: { type: Boolean, default: false, index: true },
    inspectorNotes: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding declarations for a specific inspection and key
ExtractedDeclarationSchema.index({ inspectionId: 1, declarationKey: 1 });

export const ExtractedDeclarationModel: Model<IExtractedDeclarationDocument> =
  mongoose.models.ExtractedDeclaration ||
  mongoose.model<IExtractedDeclarationDocument>('ExtractedDeclaration', ExtractedDeclarationSchema);
