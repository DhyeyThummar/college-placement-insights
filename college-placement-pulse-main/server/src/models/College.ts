import mongoose, { Document, Schema } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  location: string;
  code: string;
  established?: number;
  ranking?: number;
  totalStudents?: number;
  placementOfficer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSchema = new Schema<ICollege>({
  name: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  established: { type: Number },
  ranking: { type: Number },
  totalStudents: { type: Number },
  placementOfficer: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CollegeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const College = mongoose.model<ICollege>('College', CollegeSchema);
export default College;
