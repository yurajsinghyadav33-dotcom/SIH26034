import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import type { AuditAction } from '@sih/shared';

export interface IAuditLogDocument extends Document {
  auditId: string;
  action: AuditAction;
  entityType: 'INSPECTION' | 'VIOLATION' | 'PRODUCT' | 'RULE' | 'REPORT';
  entityId: string;
  userId: Types.ObjectId;
  previousState?: unknown;
  newState?: unknown;
  justification?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    action: {
      type: String,
      required: true,
      enum: [
        'INSPECTION_CREATED',
        'VIOLATION_FLAGGED',
        'MANUAL_OVERRIDE',
        'STATUS_CHANGED',
        'NOTICE_GENERATED',
        'RULE_UPDATED',
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
      enum: ['INSPECTION', 'VIOLATION', 'PRODUCT', 'RULE', 'REPORT'],
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    justification: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only audit trail
  }
);

// Compound index for querying audit history by entity
AuditLogSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
// Compound index for inspector activity logs
AuditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLogModel: Model<IAuditLogDocument> =
  mongoose.models.AuditLog || mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
