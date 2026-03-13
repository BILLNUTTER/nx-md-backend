import os from "os";
import { CommandContext, getSetting } from "./types";

function formatUptime(startTime: number): string {
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const hrs = Math.floor(diff / 3600).toString().padStart(2, "0");
  const mins = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
  const secs = (diff % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}

function getRamBar(): string {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const pct = Math.round((used / total) * 100);
  const filled = Math.round(pct / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  return `[${bar}] ${pct}%`;
}

export async function cmd_ping(ctx: CommandContext) {
  const { sock, replyTo, startTime } = ctx;
  const before = Date.now();
  await sock.sendMessage(replyTo, { text: "🏓 Pinging..." });
  const speed = Date.now() - before;
  await sock.sendMessage(replyTo, {
    text: `🏓 *Pong!*\n⚡ *Speed:* ${speed}ms\n⏱️ *Uptime:* ${formatUptime(startTime)}`,
  });
}

export async function cmd_ping2(ctx: CommandContext) {
  await cmd_ping(ctx);
}

export async function cmd_runtime(ctx: CommandContext) {
  const { sock, replyTo, startTime } = ctx;
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const days = Math.floor(diff / 86400);
  const hrs = Math.floor((diff % 86400) / 3600);
  const mins = Math.floor((diff % 3600) / 60);
  const secs = diff % 60;
  await sock.sendMessage(replyTo, {
    text: `⏱️ *NX-MD BOT Runtime*\n\n🔧 *Version:* 1.9.0\n📅 *Days:* ${days}\n🕐 *Hours:* ${hrs}\n⏳ *Minutes:* ${mins}\n⏱️ *Seconds:* ${secs}\n\n_Total: ${formatUptime(startTime)}_`,
  });
}

export async function cmd_botstatus(ctx: CommandContext) {
  const { sock, replyTo, user, startTime, prefix } = ctx;
  const mode = user.botMode || "public";
  const botname = getSetting(user, "botname");
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const usedMem = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
  await sock.sendMessage(replyTo, {
    text: `🤖 *${botname} Status*\n\n✅ *Status:* Online\n⏱️ *Uptime:* ${formatUptime(startTime)}\n🔧 *Version:* 1.9.0\n📋 *Mode:* ${mode === "private" ? "Private" : "Public"}\n🔤 *Prefix:* ${prefix || "(none)"}\n💾 *RAM:* ${usedMem}/${totalMem} MB\n${getRamBar()}\n\n_Powered by Nutterx Technologies_`,
  });
}

export async function cmd_owner(ctx: CommandContext) {
  const { sock, replyTo, user } = ctx;
  await sock.sendMessage(replyTo, {
    text: `👑 *Bot Owner Info*\n\n📛 *Owner:* ${user.username}\n📞 *Number:* ${user.whatsappNumber || "Unknown"}\n\n🏢 *Company:* Nutterx Technologies\n📱 *Contact:* 0758891491\n🔗 *WhatsApp:* https://wa.me/254758891491\n\n_NX-MD BOT v1.9.0_`,
  });
}

export async function cmd_repo(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `📦 *NX-MD BOT Repository*\n\n🤖 *Name:* NX-MD BOT\n🔖 *Version:* 1.9.0\n👥 *Dev:* Nutterx Technologies\n📞 *Support:* 0758891491\n🔗 *WhatsApp:* https://wa.me/254758891491\n\n_The most feature-rich WhatsApp bot in Kenya 🇰🇪_`,
  });
}

export async function cmd_disk(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const freeMem = Math.round(os.freemem() / 1024 / 1024);
  const usedMem = totalMem - freeMem;
  const cpus = os.cpus();
  const platform = os.platform();
  const arch = os.arch();
  const hostname = os.hostname();
  await sock.sendMessage(replyTo, {
    text: `💻 *System Info*\n\n🖥️ *Platform:* ${platform}\n⚙️ *Arch:* ${arch}\n🖧 *Host:* ${hostname}\n🧠 *CPU:* ${cpus[0]?.model || "Unknown"} (${cpus.length} cores)\n💾 *RAM Used:* ${usedMem} MB / ${totalMem} MB\n📊 *RAM Free:* ${freeMem} MB\n${getRamBar()}`,
  });
}

export async function cmd_time(ctx: CommandContext) {
  const { sock, replyTo, user } = ctx;
  const tz = getSetting(user, "timezone") || "Africa/Nairobi";
  const now = new Date();
  let timeStr: string;
  try {
    timeStr = now.toLocaleString("en-KE", { timeZone: tz, hour12: true, weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    timeStr = now.toUTCString();
  }
  await sock.sendMessage(replyTo, {
    text: `🕐 *Current Time*\n\n📍 *Timezone:* ${tz}\n📅 ${timeStr}`,
  });
}

export async function cmd_pair(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `📱 *Bot Pairing*\n\nThis bot is already connected to your device.\n\nTo link a new device, go to:\n🌐 https://nxmdbot.nutterx.com\n📞 Support: 0758891491`,
  });
}

export async function cmd_help(ctx: CommandContext) {
  const { sock, replyTo, prefix, user } = ctx;
  const mode = user.botMode || "public";
  const p = prefix || "(no prefix)";
  await sock.sendMessage(replyTo, {
    text: `📚 *NX-MD BOT Help Guide*\n\n*How to use commands:*\n• All commands start with your prefix: *${p}*\n• Example: type *${prefix}ping* to test the bot\n• Example: type *${prefix}menu* to see all commands\n\n*Command syntax:*\n› *${prefix}command* — basic command\n› *${prefix}command argument* — command with input\n› Example: *${prefix}weather Nairobi*\n\n*Settings:*\n› Type *${prefix}getsettings* to view all settings\n› Toggle settings: *${prefix}anticall on* or *${prefix}anticall off*\n› Typing just *${prefix}anticall* shows its usage\n\n*Bot Mode:* ${mode === "private" ? "🔒 Private (only you)" : "🌐 Public (everyone)"}\n› Change with: *${prefix}mode private* or *${prefix}mode public*\n\n*Prefix:* ${p}\n› Change with: *${prefix}setprefix !*\n\n*Need help?*\n📞 0758891491\n🔗 https://wa.me/254758891491`,
  });
}
