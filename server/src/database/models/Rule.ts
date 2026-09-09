import mongoose, { Schema, Document, Model } from 'mongoose';
import type { ViolationSeverity } from '@sih/shared';

export interface IRuleDocument extends Document {
  ruleId: string;
  version: string;
  clause: string;
  title: string;
  category: string;
  description: string;
  statutoryReference: string;
  severity: ViolationSeverity;
  parameters?: Record<string, unknown>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema = new Schema<IRuleDocument>(
  {
    ruleId: { type: String, required: true, trim: true, index: true },
    version: { type: String, required: true, trim: true, default: '2011.1', index: true },
    clause: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    statutoryReference: { type: String, required: true },
    severity: {
      type: String,
      required: true,
      enum: ['CRITICAL', 'MAJOR', 'MINOR', 'INFO'],
      default: 'CRITICAL',
      index: true,
    },
    parameters: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Versioning index: Rule ID + Version must be uniquely versioned
RuleSchema.index({ ruleId: 1, version: 1 }, { unique: true });

export const RuleModel: Model<IRuleDocument> =
  mongoose.models.Rule || mongoose.model<IRuleDocument>('Rule', RuleSchema);
