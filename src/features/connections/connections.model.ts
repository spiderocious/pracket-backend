import mongoose, { Schema, type Document } from 'mongoose';

export interface IConnection {
  id: string;
  studentId: string;
  tutorId: string;
  tutorUserId: string;
  amount: number;
  status: 'open' | 'closed';
  openedAt: Date;
  firstReplyAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConnectionDocument extends IConnection, Document {}

const schema = new Schema<IConnectionDocument>(
  {
    id: { type: String, required: true, unique: true },
    studentId: { type: String, required: true, index: true },
    tutorId: { type: String, required: true, index: true },
    tutorUserId: { type: String, required: true },
    amount: { type: Number, default: 0 },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    openedAt: { type: Date, required: true },
    firstReplyAt: { type: Date },
  },
  { timestamps: true, collection: 'connections' },
);

schema.index({ studentId: 1, tutorId: 1 }, { unique: true });

export const ConnectionModel = mongoose.model<IConnectionDocument>('Connection', schema);
