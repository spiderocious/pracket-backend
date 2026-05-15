import mongoose, { Schema, type Document } from 'mongoose';

export interface IReport {
  id: string;
  connectionId: string;
  reporterId: string;
  tutorId: string;
  reason: string;
  status: 'pending' | 'resolved';
  adminNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportDocument extends IReport, Document {}

const schema = new Schema<IReportDocument>(
  {
    id: { type: String, required: true, unique: true },
    connectionId: { type: String, required: true, index: true },
    reporterId: { type: String, required: true },
    tutorId: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
    adminNote: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true, collection: 'reports' },
);

schema.index({ status: 1, createdAt: -1 });

export const ReportModel = mongoose.model<IReportDocument>('Report', schema);
