import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { ReportType, ReportStatus } from '@sih/shared';

export interface IReportDocument extends Document {
  reportId: string;
  reportType: ReportType;
  inspectionId?: Types.ObjectId;
  issuedToBrand?: string;
  issuedToManufacturer?: string;
  generatedBy: Types.ObjectId;
  signedByInspector?: string;
  pdfUrl?: string;
  digitalChecksum?: string;
  status: ReportStatus;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    reportId: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    reportType: {
      type: String,
      required: true,
      enum: ['INSPECTION_CERTIFICATE', 'SECTION_36_NOTICE', 'COMPOUNDING_ORDER', 'ZONAL_AUDIT_SUMMARY'],
      index: true,
    },
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', sparse: true, index: true },
    issuedToBrand: { type: String, trim: true },
    issuedToManufacturer: { type: String, trim: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    signedByInspector: { type: String, trim: true },
    pdfUrl: { type: String },
    digitalChecksum: { type: String }, // SHA-256 digital seal / integrity check
    status: {
      type: String,
      required: true,
      enum: ['DRAFT', 'ISSUED', 'DISPATCHED', 'ACCEPTED'],
      default: 'DRAFT',
      index: true,
    },
    generatedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for reports by type and status
ReportSchema.index({ reportType: 1, status: 1 });

export const ReportModel: Model<IReportDocument> =
  mongoose.models.Report || mongoose.model<IReportDocument>('Report', ReportSchema);
