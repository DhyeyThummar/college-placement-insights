import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  collegeId?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  collegeId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;


