import mongoose, { Schema, type Document } from 'mongoose';

export interface ICredential {
  id: string;
  tutorId: string;
  fileKey: string;
  type: 'degree' | 'governmentId' | 'reference';
  reviewStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICredentialDocument extends ICredential, Document {}

const schema = new Schema<ICredentialDocument>(
  {
    id: { type: String, required: true, unique: true },
    tutorId: { type: String, required: true, index: true },
    fileKey: { type: String, required: true },
    type: { type: String, enum: ['degree', 'governmentId', 'reference'], required: true },
    reviewStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true, collection: 'credentials' },
);

schema.index({ reviewStatus: 1, createdAt: -1 });

export const CredentialModel = mongoose.model<ICredentialDocument>('Credential', schema);
