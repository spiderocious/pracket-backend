import mongoose, { Schema, type Document } from 'mongoose';

export interface IMessage {
  id: string;
  connectionId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessageDocument extends IMessage, Document {}

const schema = new Schema<IMessageDocument>(
  {
    id: { type: String, required: true, unique: true },
    connectionId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true, collection: 'messages' },
);

schema.index({ connectionId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessageDocument>('Message', schema);
