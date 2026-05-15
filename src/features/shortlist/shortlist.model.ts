import mongoose, { Schema, type Document } from 'mongoose';

export interface IShortlist {
  id: string;
  userId: string;
  tutorIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IShortlistDocument extends IShortlist, Document {}

const schema = new Schema<IShortlistDocument>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true },
    tutorIds: [{ type: String }],
  },
  { timestamps: true, collection: 'shortlists' },
);

export const ShortlistModel = mongoose.model<IShortlistDocument>('Shortlist', schema);
