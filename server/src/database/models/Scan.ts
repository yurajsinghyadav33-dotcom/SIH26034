import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { SurfaceType, BoundingBox } from '@sih/shared';

export interface IScanDocument extends Document {
  scanId: string;
  inspectionId: Types.ObjectId;
  productId?: Types.ObjectId;
  imageUrl: string;
  imageHash: string;
  surfaceType: SurfaceType;
  pdpAreaPercentage?: number;
  ocrRawText?: string;
  ocrBlocks?: Array<{
    text: string;
    confidence?: number;
    boundingBox?: BoundingBox;
  }>;
  ocrProvider: string;
  processingStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
  capturedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ScanSchema = new Schema<IScanDocument>(
  {
    scanId: { type: String, required: true, unique: true, index: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', sparse: true, index: true },
    imageUrl: { type: String, required: true },
    imageHash: { type: String, required: true, index: true }, // SHA-256 evidence integrity
    surfaceType: {
      type: String,
      required: true,
      enum: ['FRONT', 'BACK', 'SIDE', 'MRP_LABEL', 'BOTTOM', 'TOP'],
      index: true,
    },
    pdpAreaPercentage: { type: Number, min: 0, max: 100 },
    ocrRawText: { type: String },
    ocrBlocks: [
      {
        text: { type: String, required: true },
        confidence: { type: Number },
        boundingBox: {
          x: { type: Number },
          y: { type: Number },
          width: { type: Number },
          height: { type: Number },
        },
      },
    ],
    ocrProvider: { type: String, required: true, default: 'mock' },
    processingStatus: {
      type: String,
      required: true,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for retrieval by inspection & surface
ScanSchema.index({ inspectionId: 1, surfaceType: 1 });

export const ScanModel: Model<IScanDocument> =
  mongoose.models.Scan || mongoose.model<IScanDocument>('Scan', ScanSchema);
