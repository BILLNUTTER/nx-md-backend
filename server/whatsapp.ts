import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import pino from "pino";
import User from "./models/User";
import Session from "./models/Session";
import { useMongoDBAuthState } from "./mongoAuthState";
import { log } from "./index";
import QRCode from "qrcode";
import { handleCommand } from "./commands/index";
import { getSetting, DEFAULT_BOT_SETTINGS } from "./commands/types";

const baileysLogger = pino({ level: "silent" });

const activeSessions = new Map<string, any>();
const qrCodes = new Map<string, string>();
const pairingCodes = new Map<string, string>();
const connectionStatus = new Map<string, string>();
const sessionStartTimes = new Map<string, number>();
const alwaysOnlineIntervals = new Map<string, NodeJS.Timeout>();
const autobioIntervals = new Map<string, NodeJS.Timeout>();
const messageStore = new Map<string, Map<string, any>>();

export function getQRCode(userId: string): string | null {
  return qrCodes.get(userId) || null;
}

export function getPairingCode(userId: string): string | null {
  return pairingCodes.get(userId) || null;
}

export function getConnectionStatus(userId: string): string {
  return connectionStatus.get(userId) || "disconnected";
}

export function isSessionActive(userId: string): boolean {
  return activeSessions.has(userId);
}

function getNumberJid(sock: any): string | null {
  const id = sock.user?.id;
  if (!id) return null;
  const number = id.split(":")[0].split("@")[0];
  return `${number}@s.whatsapp.net`;
}

function storeMessage(userId: string, msg: any) {
  const id = msg.key?.id;
  if (!id) return;
  const store = messageStore.get(userId) || new Map();
  store.set(id, msg);
  if (store.size > 500) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
  messageStore.set(userId, store);
}

function startAlwaysOnline(userId: string, sock: any) {
  if (alwaysOnlineIntervals.has(userId)) clearInterval(alwaysOnlineIntervals.get(userId)!);
  const interval = setInterval(async () => {
    try {
      const user = await User.findById(userId);
      if (!user) return;
      if (getSetting(user, "alwaysonline")) await sock.sendPresenceUpdate("available");
    } catch {}
  }, 5 * 60 * 1000);
  alwaysOnlineIntervals.set(userId, interval);
}

function stopAlwaysOnline(userId: string) {
  if (alwaysOnlineIntervals.has(userId)) {
    clearInterval(alwaysOnlineIntervals.get(userId)!);
    alwaysOnlineIntervals.delete(userId);
  }
}

function startAutobio(userId: string, sock: any) {
  if (autobioIntervals.has(userId)) clearInterval(autobioIntervals.get(userId)!);
  const interval = setInterval(async () => {
    try {
      const user = await User.findById(userId);
      if (!user || !getSetting(user, "autobio")) return;
      const tz = getSetting(user, "timezone") || "Africa/Nairobi";
      const time = new Date().toLocaleTimeString("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: true });
      const botname = getSetting(user, "botname") || "NX-MD";
      await sock.updateProfileStatus(`${botname} | ${time} | Online ✅`);
    } catch {}
  }, 5 * 60 * 1000);
  autobioIntervals.set(userId, interval);
}

function stopAutobio(userId: string) {
  if (autobioIntervals.has(userId)) {
    clearInterval(autobioIntervals.get(userId)!);
    autobioIntervals.delete(userId);
  }
}

export async function cancelWhatsAppSession(userId: string) {
  const sock = activeSessions.get(userId);
  if (sock) {
    try { sock.end(undefined); } catch {}
    activeSessions.delete(userId);
  }
  qrCodes.delete(userId);
  pairingCodes.delete(userId);
  connectionStatus.set(userId, "disconnected");
  stopAlwaysOnline(userId);
  stopAutobio(userId);
}

export async function startWhatsAppSession(userId: string, usePairingCode?: boolean, phoneNumber?: string) {
  if (activeSessions.has(userId)) {
    const currentStatus = connectionStatus.get(userId);
    if (currentStatus === "connected") return { status: "already_connected" };
    const existingSock = activeSessions.get(userId);
    try { existingSock?.end(undefined); } catch {}
    activeSessions.delete(userId);
  }

  qrCodes.delete(userId);
  pairingCodes.delete(userId);
  connectionStatus.set(userId, "connecting");

  try {
    const { state, saveCreds, clearAll } = await useMongoDBAuthState(userId);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      logger: baileysLogger,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
      },
      printQRInTerminal: false,
      generateHighQualityLinkPreview: !usePairingCode,
      syncFullHistory: false,
      browser: usePairingCode
        ? ["Ubuntu", "Chrome", "22.0.0.0"]
        : ["NX-MD BOT", "Chrome", "4.0.0"],
    });

    if (usePairingCode && phoneNumber && !state.creds.registered) {
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
      setTimeout(async () => {
        try {
          log(`Requesting pairing code for ${cleanNumber}...`, "whatsapp");
          const code = await sock.requestPairingCode(cleanNumber);
          const formatted = code.match(/.{1,4}/g)?.join("-") || code;
          pairingCodes.set(userId, formatted);
          connectionStatus.set(userId, "pairing_ready");
          log(`Pairing code for user ${userId}: ${formatted}`, "whatsapp");
        } catch (err: any) {
          log(`Pairing code request failed: ${err.message}`, "whatsapp");
          pairingCodes.set(userId, "ERROR");
          connectionStatus.set(userId, "error");
        }
      }, 5000);
    }

    activeSessions.set(userId, sock);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("call", async (calls: any[]) => {
      try {
        const user = await User.findById(userId);
        if (!user) return;
        if (!getSetting(user, "anticall")) return;
        for (const call of calls) {
          if (call.status === "offer") {
            try { await sock.rejectCall(call.id, call.from); } catch {}
            if (getSetting(user, "autoblock")) {
              try { await sock.updateBlockStatus(call.from, "block"); } catch {}
            }
            const anticallmsg = getSetting(user, "anticallmsg");
            try {
              await sock.sendMessage(call.from, {
                text: anticallmsg || `❌ Sorry, calls are not allowed.\n\n_Anti-Call is enabled by the bot owner._`,
              });
            } catch {}
          }
        }
      } catch (e: any) {
        log(`Call handler error: ${e.message}`, "whatsapp");
      }
    });

    sock.ev.on("group-participants.update", async (update: any) => {
      try {
        const user = await User.findById(userId);
        if (!user || !user.botEnabled || !user.subscriptionActive) return;
        const { id: groupJid, participants, action } = update;
        const metadata = await sock.groupMetadata(groupJid).catch(() => null);
        const groupName = metadata?.subject || "the group";
        const count = metadata?.participants?.length || "?";

        if (action === "add") {
          const welcomemsg = getSetting(user, "welcomemsg");
          for (const jid of participants) {
            const num = jid.split("@")[0];
            const defaultMsg = `👋 Welcome @${num} to *${groupName}*!\n\nYou are member #${count}. Enjoy your stay! 🎉`;
            const msgText = (welcomemsg || defaultMsg)
              .replace(/\{name\}/g, `@${num}`)
              .replace(/\{group\}/g, groupName)
              .replace(/\{count\}/g, String(count));
            try {
              let ppUrl: string | null = null;
              try { ppUrl = await sock.profilePictureUrl(jid, "image"); } catch {}
              if (ppUrl) {
                await sock.sendMessage(groupJid, { image: { url: ppUrl }, caption: msgText, mentions: [jid] });
              } else {
                await sock.sendMessage(groupJid, { text: msgText, mentions: [jid] });
              }
            } catch {}
          }
        }

        if (action === "remove") {
          const goodbyemsg = getSetting(user, "goodbyemsg");
          if (goodbyemsg) {
            for (const jid of participants) {
              const num = jid.split("@")[0];
              const msgText = goodbyemsg
                .replace(/\{name\}/g, `@${num}`)
                .replace(/\{group\}/g, groupName);
              try {
                await sock.sendMessage(groupJid, { text: msgText, mentions: [jid] });
              } catch {}
            }
          }
        }
      } catch (e: any) {
        log(`Group participant update error: ${e.message}`, "whatsapp");
      }
    });

    sock.ev.on("messages.update", async (updates: any[]) => {
      for (const update of updates) {
        try {
          const user = await User.findById(userId);
          if (!user || !user.botEnabled || !user.subscriptionActive) continue;

          const proto = update.update?.message?.protocolMessage;
          const remoteJid = update.key?.remoteJid || "";
          const inGroup = remoteJid.endsWith("@g.us");

          if (proto?.type === 0) {
            const antidelete = getSetting(user, "antidelete");
            if (!antidelete || antidelete === "off") continue;
            if (antidelete === "group" && !inGroup) continue;
            if (antidelete === "private" && inGroup) continue;

            const deletedId = proto.key?.id || "";
            const storedMsg = messageStore.get(userId)?.get(deletedId);
            if (!storedMsg) continue;

            const senderJid = storedMsg.key?.participant || storedMsg.key?.remoteJid || "";
            const senderNum = senderJid.split("@")[0];
            const m = storedMsg.message;
            if (!m) continue;

            const caption = `⚠️ *Anti Delete* — @${senderNum} deleted a message:\n\n`;
            try {
              if (m.conversation || m.extendedTextMessage?.text) {
                const text = m.conversation || m.extendedTextMessage?.text;
                await sock.sendMessage(remoteJid, { text: caption + text, mentions: senderJid ? [senderJid] : [] });
              } else if (m.imageMessage) {
                const buf = await downloadMediaMessage(storedMsg, "buffer", {});
                await sock.sendMessage(remoteJid, { image: buf as Buffer, caption: caption + (m.imageMessage.caption || "") });
              } else if (m.videoMessage) {
                const buf = await downloadMediaMessage(storedMsg, "buffer", {});
                await sock.sendMessage(remoteJid, { video: buf as Buffer, caption: caption + (m.videoMessage.caption || "") });
              } else if (m.audioMessage) {
                const buf = await downloadMediaMessage(storedMsg, "buffer", {});
                await sock.sendMessage(remoteJid, { audio: buf as Buffer, mimetype: "audio/mp4", ptt: !!m.audioMessage.ptt });
              } else if (m.stickerMessage) {
                const buf = await downloadMediaMessage(storedMsg, "buffer", {});
                await sock.sendMessage(remoteJid, { sticker: buf as Buffer });
              } else {
                await sock.sendMessage(remoteJid, { text: caption + "[Media message]" });
              }
            } catch {}
          }

          const antiedit = getSetting(user, "antiedit");
          if (antiedit && antiedit !== "off") {
            const editedMsgContainer = update.update?.message?.editedMessage;
            if (!editedMsgContainer) continue;
            if (antiedit === "private" && inGroup) continue;

            const originalId = editedMsgContainer.key?.id || update.key?.id || "";
            const storedMsg = messageStore.get(userId)?.get(originalId);
            if (!storedMsg) continue;

            const senderJid = storedMsg.key?.participant || storedMsg.key?.remoteJid || "";
            const senderNum = senderJid.split("@")[0];
            const originalText = storedMsg.message?.conversation || storedMsg.message?.extendedTextMessage?.text || "";
            if (originalText) {
              try {
                await sock.sendMessage(remoteJid, {
                  text: `✏️ *Anti Edit* — @${senderNum} edited a message\n\n*Original:* ${originalText}`,
                  mentions: senderJid ? [senderJid] : [],
                });
              } catch {}
            }
          }
        } catch {}
      }
    });

    sock.ev.on("messages.upsert", async (msgUpdate: any) => {
      const messages = msgUpdate.messages;
      if (!messages || msgUpdate.type !== "notify") return;

      for (const msg of messages) {
        try {
          const user = await User.findById(userId);
          if (!user) continue;

          const remoteJid = msg.key.remoteJid || "";

          storeMessage(userId, msg);

          if (remoteJid === "status@broadcast") {
            if (!user.botEnabled || !user.subscriptionActive) continue;
            if (getSetting(user, "autoviewstatus")) {
              try { await sock.readMessages([msg.key]); } catch {}
            }
            if (getSetting(user, "autoreactstatus")) {
              const emojis = (getSetting(user, "statusemoji") || DEFAULT_BOT_SETTINGS.statusemoji)
                .split(",").map((e: string) => e.trim()).filter(Boolean);
              const senderJid = msg.key.participant || "";
              if (emojis.length && senderJid) {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                try {
                  await sock.sendMessage("status@broadcast", { react: { text: emoji, key: msg.key } }, { statusJidList: [senderJid] });
                } catch {}
              }
            }
            continue;
          }

          const prefix = user.botPrefix ?? ".";
          const mode = user.botMode ?? "public";
          const ownerNumber = user.whatsappNumber;
          const isFromMe = msg.key.fromMe === true;
          const isGroup = remoteJid.endsWith("@g.us");
          const senderJid = isGroup
            ? (msg.key.participant || msg.key.remoteJid || "")
            : remoteJid;
          const senderNumber = senderJid.split("@")[0].split(":")[0];
          const isOwner = isFromMe || (!!ownerNumber && senderNumber === ownerNumber);

          const rawText =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption ||
            "";

          const replyTo = remoteJid;

          if (!user.botEnabled || !user.subscriptionActive) continue;

          if (!isFromMe) {
            if (getSetting(user, "autoread")) {
              try { await sock.readMessages([msg.key]); } catch {}
            }

            if (rawText && getSetting(user, "autotype")) {
              try {
                await sock.sendPresenceUpdate("composing", replyTo);
                setTimeout(async () => { try { await sock.sendPresenceUpdate("paused", replyTo); } catch {} }, 2000);
              } catch {}
            }

            if (rawText && getSetting(user, "autorecord")) {
              try {
                await sock.sendPresenceUpdate("recording", replyTo);
                setTimeout(async () => { try { await sock.sendPresenceUpdate("paused", replyTo); } catch {} }, 3000);
              } catch {}
            }

            if (rawText && getSetting(user, "autoreact")) {
              const emojis = (getSetting(user, "statusemoji") || DEFAULT_BOT_SETTINGS.statusemoji)
                .split(",").map((e: string) => e.trim()).filter(Boolean);
              if (emojis.length) {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                try { await sock.sendMessage(replyTo, { react: { text: emoji, key: msg.key } }); } catch {}
              }
            }

            const antibug = getSetting(user, "antibug");
            if (antibug) {
              const isBug =
                (rawText.length > 3000 && rawText.split(" ").some((w: string) => w.length > 2000)) ||
                !!msg.message?.viewOnceMessageV2Extension;
              if (isBug) {
                try { await sock.sendMessage(remoteJid, { delete: msg.key }); } catch {}
                try { await sock.sendMessage(replyTo, { text: `🛡️ *Anti Bug* — A suspicious message was blocked.` }); } catch {}
                continue;
              }
            }

            if (isGroup && msg.message?.stickerMessage) {
              const antisticker = getSetting(user, "antisticker");
              if (antisticker) {
                try { await sock.sendMessage(remoteJid, { delete: msg.key }); } catch {}
                const antistickerkick = getSetting(user, "antistickerkick");
                const antistickerwarn = getSetting(user, "antistickerwarn");
                if (antistickerkick) {
                  try {
                    await sock.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
                    await sock.sendMessage(remoteJid, { text: `👢 @${senderNumber} was removed for sending a sticker.`, mentions: [senderJid] });
                  } catch {}
                } else if (antistickerwarn) {
                  const warnings: Record<string, number> = (user.botSettings as any)?.warnings || {};
                  warnings[senderJid] = (warnings[senderJid] || 0) + 1;
                  const warnLimit = getSetting(user, "warnLimit") || 5;
                  await User.findByIdAndUpdate(userId, { $set: { "botSettings.warnings": warnings } });
                  const cnt = warnings[senderJid];
                  await sock.sendMessage(remoteJid, {
                    text: `⚠️ @${senderNumber} warning *${cnt}/${warnLimit}* — Stickers are not allowed here!`,
                    mentions: [senderJid],
                  });
                  if (cnt >= warnLimit) {
                    try {
                      await sock.groupParticipantsUpdate(remoteJid, [senderJid], "remove");
                      await sock.sendMessage(remoteJid, { text: `👢 @${senderNumber} removed after ${warnLimit} warnings.`, mentions: [senderJid] });
                    } catch {}
                  }
                } else {
                  await sock.sendMessage(remoteJid, { text: `❌ @${senderNumber} stickers are not allowed!`, mentions: [senderJid] });
                }
                continue;
              }
            }

            const antiviewonce = getSetting(user, "antiviewonce");
            if (antiviewonce) {
              const vom = msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message;
              if (vom) {
                try {
                  if (vom.imageMessage) {
                    const buf = await downloadMediaMessage(msg, "buffer", {});
                    await sock.sendMessage(replyTo, {
                      image: buf as Buffer,
                      caption: `👁️ *Anti ViewOnce* — from @${senderNumber}\n${vom.imageMessage.caption || ""}`,
                      mentions: [senderJid],
                    });
                  } else if (vom.videoMessage) {
                    const buf = await downloadMediaMessage(msg, "buffer", {});
                    await sock.sendMessage(replyTo, {
                      video: buf as Buffer,
                      caption: `👁️ *Anti ViewOnce* — from @${senderNumber}\n${vom.videoMessage.caption || ""}`,
                      mentions: [senderJid],
                    });
                  }
                } catch {}
              }
            }
          }

          if (!rawText) continue;

          let command = "";
          let args = "";

          if (!prefix) {
            const parts = rawText.trim().split(/\s+/);
            command = parts[0].toLowerCase();
            args = parts.slice(1).join(" ");
          } else {
            if (!rawText.startsWith(prefix)) {
              if (getSetting(user, "chatbot") && !isFromMe && !isGroup) {
                try {
                  const { default: https } = await import("https");
                  const botname = getSetting(user, "botname") || "NX-MD";
                  const promptText = `You are ${botname}, a helpful WhatsApp bot. Keep responses short and friendly (under 200 words).\n\nUser: ${rawText}\nBot:`;
                  const reply: string = await new Promise((resolve, reject) => {
                    const req = https.get(
                      `https://text.pollinations.ai/${encodeURIComponent(promptText)}`,
                      { headers: { "User-Agent": "NX-MD-Bot/1.0" } },
                      (res: any) => {
                        let data = "";
                        res.on("data", (c: any) => { data += c; });
                        res.on("end", () => resolve(data.trim()));
                      }
                    );
                    req.on("error", reject);
                    req.setTimeout(12000, () => { req.destroy(); reject(new Error("timeout")); });
                  });
                  if (reply) await sock.sendMessage(replyTo, { text: `🤖 ${reply}` });
                } catch {}
              }
              continue;
            }
            const body = rawText.slice(prefix.length).trim();
            const parts = body.split(/\s+/);
            command = parts[0].toLowerCase();
            args = parts.slice(1).join(" ");
          }

          if (!command) continue;

          if (mode === "private" && !isOwner) continue;

          const startTime = sessionStartTimes.get(userId) || Date.now();

          const ctx = {
            sock,
            msg,
            userId,
            user,
            command,
            args,
            prefix,
            replyTo,
            isOwner: !!isOwner,
            isGroup,
            senderJid,
            startTime,
          };

          const handled = await handleCommand(ctx);
          if (!handled) {
            await sock.sendMessage(replyTo, {
              text: `❓ Unknown command: *${prefix}${command}*\nType *${prefix}menu* to see all commands or *${prefix}help* for guidance.`,
            });
          }

        } catch (cmdErr: any) {
          log(`Command error: ${cmdErr.message}`, "whatsapp");
        }
      }
    });

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr && !usePairingCode) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
          qrCodes.set(userId, qrDataUrl);
          connectionStatus.set(userId, "qr_ready");
          log(`QR code generated for user ${userId}`, "whatsapp");
        } catch (err: any) {
          log(`QR code generation error: ${err.message}`, "whatsapp");
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        log(`Connection closed for user ${userId}. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`, "whatsapp");

        activeSessions.delete(userId);
        qrCodes.delete(userId);
        pairingCodes.delete(userId);
        stopAlwaysOnline(userId);
        stopAutobio(userId);

        if (shouldReconnect) {
          connectionStatus.set(userId, "reconnecting");
          setTimeout(() => startWhatsAppSession(userId), 3000);
        } else {
          connectionStatus.set(userId, "disconnected");
          sessionStartTimes.delete(userId);
          messageStore.delete(userId);
          await User.findByIdAndUpdate(userId, {
            whatsappConnected: false,
            whatsappNumber: null,
          });
          await clearAll();
        }
      }

      if (connection === "open") {
        connectionStatus.set(userId, "connected");
        qrCodes.delete(userId);
        pairingCodes.delete(userId);
        sessionStartTimes.set(userId, Date.now());

        const numberJid = getNumberJid(sock);
        const number = numberJid?.split("@")[0] || null;

        await User.findByIdAndUpdate(userId, {
          whatsappConnected: true,
          whatsappNumber: number,
        });

        log(`WhatsApp connected for user ${userId} - Number: ${number}`, "whatsapp");

        try { await sock.sendPresenceUpdate("available"); } catch {}
        startAlwaysOnline(userId, sock);
        startAutobio(userId, sock);

        if (numberJid) {
          setTimeout(async () => {
            try {
              const user = await User.findById(userId);
              const p = user?.botPrefix ?? ".";
              await sock.sendMessage(numberJid, {
                text: `🤖 *NX-MD BOT has been linked to your device!*\n\n✅ Bot is now active and running.\n\n• Test: *${p}ping*\n• Menu: *${p}menu*\n• Settings: *${p}getsettings*\n• Help: *${p}help*\n\nIf having any trouble, contact:\n📞 0758891491\n🏢 Nutterx Technologies\n\n_Powered by NX-MD BOT v2.0.0_`,
              });
              log(`Confirmation DM sent to ${number}`, "whatsapp");
            } catch (err: any) {
              log(`Failed to send confirmation DM: ${err.message}`, "whatsapp");
            }
          }, 3000);
        }
      }
    });

    return { status: "connecting" };
  } catch (error: any) {
    log(`Error starting session for user ${userId}: ${error.message}`, "whatsapp");
    connectionStatus.set(userId, "error");
    activeSessions.delete(userId);
    return { status: "error", message: error.message };
  }
}

export async function disconnectWhatsApp(userId: string) {
  const sock = activeSessions.get(userId);
  if (sock) {
    try { await sock.logout(); } catch {}
    activeSessions.delete(userId);
  }
  qrCodes.delete(userId);
  pairingCodes.delete(userId);
  connectionStatus.set(userId, "disconnected");
  sessionStartTimes.delete(userId);
  messageStore.delete(userId);
  stopAlwaysOnline(userId);
  stopAutobio(userId);
  await Session.deleteMany({ userId });
  await User.findByIdAndUpdate(userId, {
    whatsappConnected: false,
    whatsappNumber: null,
  });
}

export async function reconnectAllSessions() {
  try {
    const users = await User.find({ whatsappConnected: true });
    log(`Reconnecting ${users.length} WhatsApp sessions from MongoDB...`, "whatsapp");
    for (const user of users) {
      const hasCreds = await Session.findOne({ userId: user._id.toString(), sessionId: "creds" });
      if (hasCreds) {
        log(`Restoring session for user ${user.username} (${user._id})`, "whatsapp");
        await startWhatsAppSession(user._id.toString());
      } else {
        log(`No stored credentials for user ${user.username}, marking as disconnected`, "whatsapp");
        await User.findByIdAndUpdate(user._id, { whatsappConnected: false, whatsappNumber: null });
      }
    }
  } catch (error: any) {
    log(`Error reconnecting sessions: ${error.message}`, "whatsapp");
  }
}

export async function checkExpiredSubscriptions() {
  try {
    const now = new Date();
    const expiredUsers = await User.find({
      subscriptionActive: true,
      subscriptionExpiry: { $lte: now },
    });
    for (const user of expiredUsers) {
      await User.findByIdAndUpdate(user._id, {
        subscriptionActive: false,
        botEnabled: false,
      });
      log(`Subscription expired for user ${user.username}`, "subscription");
    }
  } catch (error: any) {
    log(`Error checking subscriptions: ${error.message}`, "subscription");
  }
}
