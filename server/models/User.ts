import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  isRestricted: boolean;
  whatsappConnected: boolean;
  whatsappNumber: string | null;
  whatsappSessionData: any;
  botEnabled: boolean;
  botPrefix: string;
  botMode: string;
  subscriptionActive: boolean;
  subscriptionExpiry: Date | null;
  botSettings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isRestricted: { type: Boolean, default: false },
    whatsappConnected: { type: Boolean, default: false },
    whatsappNumber: { type: String, default: null },
    whatsappSessionData: { type: Schema.Types.Mixed, default: null },
    botEnabled: { type: Boolean, default: false },
    botPrefix: { type: String, default: "." },
    botMode: { type: String, default: "public" },
    subscriptionActive: { type: Boolean, default: false },
    subscriptionExpiry: { type: Date, default: null },
    botSettings: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
