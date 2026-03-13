import type { Express } from "express";
import { type Server } from "http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import User from "./models/User";
import Payment from "./models/Payment";
import Settings from "./models/Settings";
import Session from "./models/Session";
import { authMiddleware, adminMiddleware, AuthRequest } from "./middleware/auth";
import {
  startWhatsAppSession,
  disconnectWhatsApp,
  cancelWhatsAppSession,
  getQRCode,
  getPairingCode,
  getConnectionStatus,
} from "./whatsapp";
import { registerSchema, loginSchema, paymentSchema } from "../shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { username, email, password } = parsed.data;

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await User.create({ username, email, password: hashedPassword });

      const jwtSecret = process.env.SESSION_SECRET;
      if (!jwtSecret) return res.status(500).json({ message: "Server configuration error" });

      const token = jwt.sign(
        { userId: user._id },
        jwtSecret,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          isRestricted: user.isRestricted,
          whatsappConnected: user.whatsappConnected,
          whatsappNumber: user.whatsappNumber,
          botEnabled: user.botEnabled,
          subscriptionActive: user.subscriptionActive,
          subscriptionExpiry: user.subscriptionExpiry,
          botSettings: user.botSettings,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      if (user.isRestricted) {
        return res.status(403).json({ message: "Your account has been restricted. Contact admin." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const jwtSecret = process.env.SESSION_SECRET;
      if (!jwtSecret) return res.status(500).json({ message: "Server configuration error" });

      const token = jwt.sign(
        { userId: user._id },
        jwtSecret,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          isRestricted: user.isRestricted,
          whatsappConnected: user.whatsappConnected,
          whatsappNumber: user.whatsappNumber,
          botEnabled: user.botEnabled,
          subscriptionActive: user.subscriptionActive,
          subscriptionExpiry: user.subscriptionExpiry,
          botSettings: user.botSettings,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.userId).select("-password -whatsappSessionData");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/whatsapp/connect", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { method, phoneNumber } = req.body;
      const usePairingCode = method === "pairing";

      const result = await startWhatsAppSession(
        req.userId!,
        usePairingCode,
        phoneNumber
      );

      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/whatsapp/disconnect", authMiddleware, async (req: AuthRequest, res) => {
    try {
      await disconnectWhatsApp(req.userId!);
      return res.json({ message: "Disconnected successfully" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/whatsapp/cancel", authMiddleware, async (req: AuthRequest, res) => {
    try {
      await cancelWhatsAppSession(req.userId!);
      return res.json({ message: "Connection attempt cancelled" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/whatsapp/status", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const status = getConnectionStatus(req.userId!);
      const qr = getQRCode(req.userId!);
      const pairingCode = getPairingCode(req.userId!);
      const user = await User.findById(req.userId).select("whatsappConnected whatsappNumber");

      return res.json({
        status,
        qr,
        pairingCode,
        whatsappConnected: user?.whatsappConnected || false,
        whatsappNumber: user?.whatsappNumber || null,
      });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/payment/initiate", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const parsed = paymentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.errors[0].message });
      }

      const settings = await Settings.findOne();
      const amount = settings?.subscriptionPrice || 70;
      const transactionId = `TXN-${Date.now()}-${randomUUID().slice(0, 8)}`;

      const payment = await Payment.create({
        userId: req.userId,
        phoneNumber: parsed.data.phoneNumber,
        amount,
        status: "pending",
        transactionId,
      });

      setTimeout(async () => {
        try {
          await Payment.findByIdAndUpdate(payment._id, { status: "completed" });
          const days = settings?.subscriptionDays || 30;
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + days);

          await User.findByIdAndUpdate(req.userId, {
            subscriptionActive: true,
            subscriptionExpiry: expiry,
            botEnabled: true,
          });
        } catch (err) {
          console.error("Payment confirmation error:", err);
        }
      }, 5000);

      return res.json({
        transactionId,
        amount,
        phoneNumber: parsed.data.phoneNumber,
        message: `Payment prompt of KSh ${amount} sent to ${parsed.data.phoneNumber}. Enter your M-Pesa PIN to complete.`,
      });
    } catch (error: any) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payment/status/:transactionId", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const payment = await Payment.findOne({
        transactionId: req.params.transactionId,
        userId: req.userId,
      });
      if (!payment) return res.status(404).json({ message: "Payment not found" });
      return res.json(payment);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/payment/history", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const payments = await Payment.find({ userId: req.userId }).sort({ createdAt: -1 });
      return res.json(payments);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bot/config", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const { botPrefix, botMode } = req.body;
      const update: any = {};
      if (botPrefix !== undefined) update.botPrefix = botPrefix;
      if (botMode !== undefined) update.botMode = botMode;
      const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password -whatsappSessionData");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json({ botPrefix: user.botPrefix, botMode: user.botMode });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bot/settings", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const updatedSettings = { ...(user.botSettings as any), ...req.body };
      user.botSettings = updatedSettings;
      user.markModified("botSettings");
      await user.save();
      return res.json({ botSettings: user.botSettings });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/bot/toggle", authMiddleware, async (req: AuthRequest, res) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) <= new Date()) {
        user.subscriptionActive = false;
        user.botEnabled = false;
        await user.save();
      }
      if (!user.subscriptionActive) {
        return res.status(403).json({ message: "Active subscription required" });
      }

      user.botEnabled = !user.botEnabled;
      await user.save();
      return res.json({ botEnabled: user.botEnabled });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await Settings.findOne();
      return res.json(settings || { subscriptionPrice: 70, subscriptionDays: 30, maintenanceMode: false });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/users", adminMiddleware, async (_req, res) => {
    try {
      const users = await User.find().select("-password -whatsappSessionData").sort({ createdAt: -1 });
      return res.json(users);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/stats", adminMiddleware, async (_req, res) => {
    try {
      const totalUsers = await User.countDocuments();
      const activeSubscriptions = await User.countDocuments({ subscriptionActive: true });
      const connectedDevices = await User.countDocuments({ whatsappConnected: true });
      const totalPayments = await Payment.countDocuments({ status: "completed" });
      const revenue = await Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      return res.json({
        totalUsers,
        activeSubscriptions,
        connectedDevices,
        totalPayments,
        totalRevenue: revenue[0]?.total || 0,
      });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/user/:userId", adminMiddleware, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.isRestricted !== undefined) updates.isRestricted = req.body.isRestricted;
      if (req.body.botEnabled !== undefined) updates.botEnabled = req.body.botEnabled;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
      if (req.body.subscriptionActive !== undefined) {
        updates.subscriptionActive = req.body.subscriptionActive;
        if (req.body.subscriptionActive) {
          const days = req.body.days || 30;
          updates.subscriptionExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
          updates.botEnabled = true;
        } else {
          updates.botEnabled = false;
        }
      }
      const user = await User.findByIdAndUpdate(req.params.userId, updates, { new: true })
        .select("-password -whatsappSessionData");
      if (!user) return res.status(404).json({ message: "User not found" });
      return res.json(user);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/user/:userId", adminMiddleware, async (req, res) => {
    try {
      await Session.deleteMany({ userId: req.params.userId });
      await Payment.deleteMany({ userId: req.params.userId });
      await User.findByIdAndDelete(req.params.userId);
      return res.json({ message: "User deleted successfully" });
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/settings", adminMiddleware, async (req, res) => {
    try {
      const settings = await Settings.findOneAndUpdate({}, req.body, {
        new: true,
        upsert: true,
      });
      return res.json(settings);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/payments", adminMiddleware, async (_req, res) => {
    try {
      const payments = await Payment.find()
        .populate("userId", "username email")
        .sort({ createdAt: -1 });
      return res.json(payments);
    } catch {
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
