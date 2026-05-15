import mongoose, { Schema, type Document } from 'mongoose';

export interface IPost {
  id: string;
  tutorId: string;
  title: string;
  body: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostDocument extends IPost, Document {}

const schema = new Schema<IPostDocument>(
  {
    id: { type: String, required: true, unique: true },
    tutorId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true, collection: 'posts' },
);

schema.index({ tutorId: 1, isPublished: 1, publishedAt: -1 });

export const PostModel = mongoose.model<IPostDocument>('Post', schema);
