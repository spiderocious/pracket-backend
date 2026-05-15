import mongoose, { Schema, type Document } from 'mongoose';

export interface IAvailabilityWindow {
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  from: string;
  to: string;
}

export interface ITutor {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  levels: string[];
  rate: number;
  connectionFee: number;
  format: 'online' | 'inPerson' | 'both';
  location: string;
  availability: IAvailabilityWindow[];
  photoKey: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isListed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITutorDocument extends ITutor, Document {}

const schema = new Schema<ITutorDocument>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true },
    bio: { type: String, default: '' },
    subjects: [{ type: String }],
    levels: [{ type: String }],
    rate: { type: Number, default: 0 },
    connectionFee: { type: Number, default: 0 },
    format: { type: String, enum: ['online', 'inPerson', 'both'], default: 'online' },
    location: { type: String, default: '' },
    availability: [
      {
        day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
        from: String,
        to: String,
      },
    ],
    photoKey: { type: String, default: '' },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    isListed: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'tutors' },
);

schema.index({ isListed: 1, verificationStatus: 1 });
schema.index({ location: 1 });
schema.index({ rate: 1 });
schema.index({ subjects: 'text', bio: 'text', levels: 'text' });

export const TutorModel = mongoose.model<ITutorDocument>('Tutor', schema);
