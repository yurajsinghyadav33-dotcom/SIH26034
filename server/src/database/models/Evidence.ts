import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { EvidenceType, BoundingBox } from '@sih/shared';

export interface IEvidenceDocument extends Document {
  evidenceId: string;
  violationId: Types.ObjectId;
  inspectionId: Types.ObjectId;
  scanId: Types.ObjectId;
  evidenceType: EvidenceType;
  fileUrl: string;
  fileHash: string; // SHA-256 checksum for court-admissible integrity
  boundingBox?: BoundingBox;
  detectedSnippet: string;
  statutoryCitation: string;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<IEvidenceDocument>(
  {
    evidenceId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    violationId: { type: Schema.Types.ObjectId, ref: 'Violation', required: true, index: true },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
    scanId: { type: Schema.Types.ObjectId, ref: 'Scan', required: true, index: true },
    evidenceType: {
      type: String,
      required: true,
      enum: ['CROPPED_DECLARATION', 'FULL_PACKAGING', 'OCR_TRANSCRIPT', 'MEASUREMENT_OVERLAY'],
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileHash: { type: String, required: true, index: true },
    boundingBox: {
      x: { type: Number },
      y: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
    detectedSnippet: { type: String, required: true },
    statutoryCitation: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding all evidence for a violation
EvidenceSchema.index({ violationId: 1, evidenceType: 1 });

export const EvidenceModel: Model<IEvidenceDocument> =
  mongoose.models.Evidence || mongoose.model<IEvidenceDocument>('Evidence', EvidenceSchema);
