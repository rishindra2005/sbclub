
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IMessage {
  sender: 'user' | 'assistant';
  text?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface ITrial extends Document {
  _id: string;
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  messages: IMessage[];
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, enum: ['user', 'assistant'], required: true },
  text: { type: String },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const TrialSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, default: 'New Trial' },
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

const Trial = models.Trial || mongoose.model<ITrial>('Trial', TrialSchema);

export default Trial;
