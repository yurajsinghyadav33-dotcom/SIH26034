import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { ComplianceStatus } from '@sih/shared';

export interface IComplianceResultDocument extends Document {
  inspectionId: Types.ObjectId;
  ruleId: string;
  ruleVersion: string;
  status: string;
  statutoryClause: string;
  statutoryReason: string;
  evidenceSummary: string;
  evidence?: Record<string, unknown>;
  suggestedRemedy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplianceResultSchema = new Schema<IComplianceResultDocument>(
  {
    inspectionId: { type: Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
    ruleId: { type: String, required: true, index: true },
    ruleVersion: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['PASS', 'FAIL', 'NOT_APPLICABLE', 'UNCERTAIN', 'NOT_DETECTED', 'COMPLIANT', 'NON_COMPLIANT', 'FLAGGED'],
      index: true,
    },
    statutoryClause: { type: String, required: true },
    statutoryReason: { type: String, required: true },
    evidenceSummary: { type: String, required: true },
    evidence: { type: Schema.Types.Mixed },
    suggestedRemedy: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding results for an inspection
ComplianceResultSchema.index({ inspectionId: 1, status: 1 });

export const ComplianceResultModel: Model<IComplianceResultDocument> =
  mongoose.models.ComplianceResult ||
  mongoose.model<IComplianceResultDocument>('ComplianceResult', ComplianceResultSchema);
