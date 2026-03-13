import { IUser } from "../models/User";

export interface CommandContext {
  sock: any;
  msg: any;
  userId: string;
  user: IUser;
  command: string;
  args: string;
  prefix: string;
  replyTo: string;
  isOwner: boolean;
  isGroup: boolean;
  senderJid: string;
  startTime: number;
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

export const DEFAULT_BOT_SETTINGS: Record<string, any> = {
  autobio: false,
  anticall: false,
  chatbot: false,
  antibug: false,
  autotype: false,
  autoread: false,
  fontstyle: false,
  antiedit: "off",
  menustyle: 2,
  autoreact: false,
  autoblock: false,
  autorecord: false,
  antidelete: "off",
  alwaysonline: true,
  autoviewstatus: true,
  autoreactstatus: false,
  autorecordtype: false,
  statusantidelete: true,
  antisticker: false,
  antistickerkick: false,
  antistickerwarn: false,
  antiviewonce: false,
  botname: "NX-MD",
  ownername: "Not Set!",
  ownernumber: "not set",
  statusemoji: "🧡,💚,🔥,✨,❤️,🥰,😎",
  watermark: "Powered by Nutterx Technologies",
  author: "X",
  packname: "NX-MD",
  timezone: "Africa/Nairobi",
  menuimage: "",
  anticallmsg: "",
  warnLimit: 5,
  goodbyemsg: "",
  welcomemsg: "",
  warnings: {},
  allowedCodes: "",
  stickerAliases: {},
  bankInfo: {},
};

export function getSetting(user: IUser, key: string): any {
  const s = (user.botSettings as any) || {};
  return s[key] !== undefined ? s[key] : DEFAULT_BOT_SETTINGS[key];
}

export function fmtBool(val: any): string {
  if (val === true || val === "on") return "ON";
  if (val === false || val === "off") return "OFF";
  return String(val ?? "OFF").toUpperCase();
}

export function parseBoolArg(arg: string): boolean | null {
  const a = arg.trim().toLowerCase();
  if (a === "on" || a === "enable" || a === "true" || a === "1") return true;
  if (a === "off" || a === "disable" || a === "false" || a === "0") return false;
  return null;
}
