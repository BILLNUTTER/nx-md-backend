import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: string;
  sessionId: string;
  data: string;
}

const sessionSchema = new Schema<ISession>(
  {
    userId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true },
    data: { type: String, required: true },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model<ISession>("Session", sessionSchema);
