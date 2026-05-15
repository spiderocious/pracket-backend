import mongoose, { Schema, type Document } from 'mongoose';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'tutor' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

const schema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['student', 'tutor', 'admin'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'users' },
);

export const UserModel = mongoose.model<IUserDocument>('User', schema);
