import mongoose, { Schema, type Document } from 'mongoose';

export interface IReview {
  id: string;
  connectionId: string;
  studentId: string;
  tutorId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

const schema = new Schema<IReviewDocument>(
  {
    id: { type: String, required: true, unique: true },
    connectionId: { type: String, required: true, unique: true, index: true },
    studentId: { type: String, required: true, index: true },
    tutorId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true, collection: 'reviews' },
);

export const ReviewModel = mongoose.model<IReviewDocument>('Review', schema);
