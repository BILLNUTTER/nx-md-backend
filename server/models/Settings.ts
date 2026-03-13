import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  subscriptionPrice: number;
  subscriptionDays: number;
  maintenanceMode: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    subscriptionPrice: { type: Number, default: 70 },
    subscriptionDays: { type: Number, default: 30 },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", settingsSchema);
