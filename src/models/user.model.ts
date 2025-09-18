
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password?: string;
  images?: string[];
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  images: {
    type: [String],
    validate: [v => Array.isArray(v) && v.length <= 3, 'You can upload a maximum of 3 images.']
  },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
