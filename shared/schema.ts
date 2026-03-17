import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const paymentSchema = z.object({
  phoneNumber: z.string().min(10, "Enter a valid phone number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;

export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string;
  isActive: boolean;
  isRestricted: boolean;
  whatsappConnected: boolean;
  whatsappNumber: string | null;
  botEnabled: boolean;
  subscriptionActive: boolean;
  subscriptionExpiry: string | null;
  botSettings: {
    autoReply: boolean;
    welcomeMessage: boolean;
    antiSpam: boolean;
    mediaDownloader: boolean;
    groupManager: boolean;
    scheduler: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  phoneNumber: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  transactionId: string;
  createdAt: string;
}

export interface AdminSettings {
  subscriptionPrice: number;
  subscriptionDays: number;
  maintenanceMode: boolean;
}
