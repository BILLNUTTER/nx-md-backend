import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  userId?: string;
}

function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    const user = await User.findById(decoded.userId).select("isRestricted isActive");
    if (!user || user.isRestricted || !user.isActive) {
      return res.status(403).json({ message: "Account restricted or inactive" });
    }
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  const adminKey = req.headers["x-admin-key"];
  const serverKey = process.env.ADMIN_KEY;
  if (!serverKey || !adminKey || adminKey !== serverKey) {
    return res.status(403).json({ message: "Unauthorized: Invalid admin key" });
  }
  next();
}
