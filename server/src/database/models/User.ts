import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserRole } from '@sih/shared';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  department: string;
  badgeNumber?: string;
  jurisdiction?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['ADMIN', 'ENFORCEMENT_INSPECTOR', 'REVIEWER'],
      default: 'ENFORCEMENT_INSPECTOR',
      index: true,
    },
    department: { type: String, required: true },
    badgeNumber: { type: String, trim: true, sparse: true, index: true },
    jurisdiction: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
