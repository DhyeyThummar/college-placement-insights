import mongoose, { Document, Schema } from 'mongoose';

export interface ICollegeAdminKey extends Document {
  collegeId: string;
  collegeName: string;
  adminKey: string;
  isActive: boolean;
  createdBy: string; // Admin who created this key
  createdAt: Date;
  updatedAt: Date;
}

const CollegeAdminKeySchema = new Schema<ICollegeAdminKey>({
  collegeId: { type: String, required: true, unique: true, index: true },
  collegeName: { type: String, required: true },
  adminKey: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CollegeAdminKeySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CollegeAdminKey = mongoose.model<ICollegeAdminKey>('CollegeAdminKey', CollegeAdminKeySchema);
export default CollegeAdminKey;
