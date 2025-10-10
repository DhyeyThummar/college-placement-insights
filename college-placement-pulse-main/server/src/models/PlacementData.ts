import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacementData extends Document {
  collegeId: string;
  batchYear: any;
  studentName: string;
  branch: string;
  company: string;
  package: any;
  status: string;
  createdAt: Date;
}

const PlacementDataSchema = new Schema<IPlacementData>({
  collegeId: { type: String, required: true, index: true },
  batchYear: { type: Schema.Types.Mixed, required: true },
  studentName: { type: String, required: true },
  branch: { type: String, required: true },
  company: { type: String, required: true },
  package: { type: Schema.Types.Mixed, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

PlacementDataSchema.index({ collegeId: 1, batchYear: 1 });

const PlacementData = mongoose.model<IPlacementData>('PlacementData', PlacementDataSchema);
export default PlacementData;


