import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  collegeName: string;
  collegeId: string;
  role: 'admin';
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  collegeName: { type: String, required: true },
  collegeId: { type: String, required: true, index: true },
  role: { type: String, enum: ['admin'], default: 'admin' },
});

const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
export default Admin;


