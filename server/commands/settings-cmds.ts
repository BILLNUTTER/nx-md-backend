import User from "../models/User";
import { CommandContext, DEFAULT_BOT_SETTINGS, getSetting, fmtBool, parseBoolArg } from "./types";

export async function cmd_getsettings(ctx: CommandContext) {
  const { sock, replyTo, user, prefix } = ctx;
  const s = (user.botSettings as any) || {};
  const g = (k: string) => s[k] !== undefined ? s[k] : DEFAULT_BOT_SETTINGS[k];

  const lines = [
    `⚙️ *Current Bot Settings:*\n`,
    `🔸 *prefix*: ${prefix || "(none)"}`,
    `🔸 *mode*: ${user.botMode || "public"}`,
    `🔸 *autobio*: ${fmtBool(g("autobio"))}`,
    `🔸 *anticall*: ${fmtBool(g("anticall"))}`,
    `🔸 *chatbot*: ${fmtBool(g("chatbot"))}`,
    `🔸 *antibug*: ${fmtBool(g("antibug"))}`,
    `🔸 *autotype*: ${fmtBool(g("autotype"))}`,
    `🔸 *autoread*: ${fmtBool(g("autoread"))}`,
    `🔸 *fontstyle*: ${fmtBool(g("fontstyle"))}`,
    `🔸 *antiedit*: ${String(g("antiedit")).toLowerCase()}`,
    `🔸 *menustyle*: ${g("menustyle") ?? 2}`,
    `🔸 *autoreact*: ${fmtBool(g("autoreact"))}`,
    `🔸 *autoblock*: ${fmtBool(g("autoblock"))}`,
    `🔸 *autorecord*: ${fmtBool(g("autorecord"))}`,
    `🔸 *antidelete*: ${String(g("antidelete")).toLowerCase()}`,
    `🔸 *alwaysonline*: ${fmtBool(g("alwaysonline"))}`,
    `🔸 *autoviewstatus*: ${fmtBool(g("autoviewstatus"))}`,
    `🔸 *autoreactstatus*: ${fmtBool(g("autoreactstatus"))}`,
    `🔸 *autorecordtype*: ${fmtBool(g("autorecordtype"))}`,
    `🔸 *statusantidelete*: ${fmtBool(g("statusantidelete"))}`,
    `🔸 *botname*: ${g("botname")}`,
    `🔸 *ownername*: ${g("ownername")}`,
    `🔸 *ownernumber*: ${g("ownernumber")}`,
    `🔸 *statusemoji*: ${g("statusemoji")}`,
    `🔸 *watermark*: ${g("watermark")}`,
    `🔸 *author*: ${g("author")}`,
    `🔸 *packname*: ${g("packname")}`,
    `🔸 *timezone*: ${g("timezone")}`,
    `🔸 *menuimage*: ${g("menuimage") || ""}`,
    `🔸 *anticallmsg*: ${g("anticallmsg") || ""}`,
    `🔸 *warnLimit*: ${g("warnLimit")}`,
    `🔸 *goodbyemsg*: ${g("goodbyemsg") || ""}`,
    `🔸 *welcomemsg*: ${g("welcomemsg") || ""}`,
    `🔸 *antisticker*: ${fmtBool(g("antisticker"))}`,
    `🔸 *antistickerkick*: ${fmtBool(g("antistickerkick"))}`,
    `🔸 *antistickerwarn*: ${fmtBool(g("antistickerwarn"))}`,
    `🔸 *antiviewonce*: ${fmtBool(g("antiviewonce"))}`,
  ];

  await sock.sendMessage(replyTo, { text: lines.join("\n") });
}

async function toggleSetting(ctx: CommandContext, settingKey: string, label: string, onMsg: string, offMsg: string) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) {
    await sock.sendMessage(replyTo, { text: `❌ Only the bot owner can change *${settingKey}*.` });
    return;
  }
  const val = parseBoolArg(args);
  if (val === null) {
    const cur = getSetting(user, settingKey);
    await sock.sendMessage(replyTo, {
      text: `⚙️ *${label}*\n\nUsage:\n• *${prefix}${settingKey} on* — ${onMsg}\n• *${prefix}${settingKey} off* — ${offMsg}\n\nCurrent: *${fmtBool(cur)}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { [`botSettings.${settingKey}`]: val });
  await sock.sendMessage(replyTo, {
    text: `✅ *${label}* is now *${val ? "ON" : "OFF"}*`,
  });
}

async function setStringSetting(ctx: CommandContext, settingKey: string, label: string, usage: string) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) {
    await sock.sendMessage(replyTo, { text: `❌ Only the bot owner can change *${settingKey}*.` });
    return;
  }
  if (!args.trim()) {
    const cur = getSetting(user, settingKey);
    await sock.sendMessage(replyTo, {
      text: `⚙️ *${label}*\n\nUsage: *${prefix}${settingKey} ${usage}*\n\nCurrent: *${cur || "(not set)"}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { [`botSettings.${settingKey}`]: args.trim() });
  await sock.sendMessage(replyTo, { text: `✅ *${label}* updated to: *${args.trim()}*` });
}

export const cmd_anticall = (ctx: CommandContext) =>
  toggleSetting(ctx, "anticall", "Anti Call", "Reject all incoming calls", "Allow incoming calls");

export const cmd_chatbot = (ctx: CommandContext) =>
  toggleSetting(ctx, "chatbot", "Chatbot", "Bot replies to all messages with AI", "Disable AI replies");

export const cmd_antibug = (ctx: CommandContext) =>
  toggleSetting(ctx, "antibug", "Anti Bug", "Block exploit messages", "Disable bug protection");

export const cmd_autotype = (ctx: CommandContext) =>
  toggleSetting(ctx, "autotype", "Auto Type", "Show typing indicator on messages", "Disable typing indicator");

export const cmd_autoread = (ctx: CommandContext) =>
  toggleSetting(ctx, "autoread", "Auto Read", "Automatically mark messages as read", "Stop auto-reading messages");

export const cmd_autoreact = (ctx: CommandContext) =>
  toggleSetting(ctx, "autoreact", "Auto React", "React to every message with an emoji", "Disable auto-reactions");

export const cmd_autoblock = (ctx: CommandContext) =>
  toggleSetting(ctx, "autoblock", "Auto Block", "Block numbers that call when anticall is ON", "Disable auto-block on calls");

export const cmd_alwaysonline = (ctx: CommandContext) =>
  toggleSetting(ctx, "alwaysonline", "Always Online", "Always show as online", "Stop always-online mode");

export const cmd_autobio = (ctx: CommandContext) =>
  toggleSetting(ctx, "autobio", "Auto Bio", "Automatically update profile bio with time", "Disable auto bio update");

export const cmd_antisticker = (ctx: CommandContext) =>
  toggleSetting(ctx, "antisticker", "Anti Sticker", "Delete stickers in groups", "Allow stickers in groups");

export const cmd_antiviewonce = (ctx: CommandContext) =>
  toggleSetting(ctx, "antiviewonce", "Anti View Once", "Resend view-once media for saving", "Disable view-once bypass");

export async function cmd_antidelete(ctx: CommandContext) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const a = args.trim().toLowerCase();
  const options = ["off", "everyone", "private", "group"];
  if (!a || !options.includes(a)) {
    const cur = getSetting(user, "antidelete");
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Anti Delete*\n\nUsage:\n• *${prefix}antidelete off* — Disable\n• *${prefix}antidelete everyone* — Recover all deleted messages\n• *${prefix}antidelete private* — Recover in DMs only\n• *${prefix}antidelete group* — Recover in groups only\n\nCurrent: *${cur || "off"}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { "botSettings.antidelete": a });
  await sock.sendMessage(replyTo, { text: `✅ *Anti Delete* set to *${a}*` });
}

export async function cmd_antiedit(ctx: CommandContext) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const a = args.trim().toLowerCase();
  const options = ["off", "private", "everyone"];
  if (!a || !options.includes(a)) {
    const cur = getSetting(user, "antiedit");
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Anti Edit*\n\nUsage:\n• *${prefix}antiedit off* — Disable\n• *${prefix}antiedit private* — Track edits in DMs\n• *${prefix}antiedit everyone* — Track all edits\n\nCurrent: *${cur || "off"}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { "botSettings.antiedit": a });
  await sock.sendMessage(replyTo, { text: `✅ *Anti Edit* set to *${a}*` });
}

export async function cmd_setbotname(ctx: CommandContext) {
  await setStringSetting(ctx, "botname", "Bot Name", "<name>");
}

export async function cmd_setwelcome(ctx: CommandContext) {
  await setStringSetting(ctx, "welcomemsg", "Welcome Message", "<message>");
}

export async function cmd_setfont(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Font Style*\n\nUsage: *${prefix}setfont <style>*\nStyles: normal, bold, italic, mono, fancy\n\nExample: *${prefix}setfont bold*`,
    });
    return;
  }
  const style = args.trim().toLowerCase();
  await User.findByIdAndUpdate(ctx.userId, { "botSettings.fontstyle": style });
  await sock.sendMessage(replyTo, { text: `✅ *Font style* set to: *${style}*` });
}

export async function cmd_addbadword(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Add Bad Word*\n\nUsage: *${prefix}addbadword <word>*\nAdds a word to the blocked words list for group anti-bad-word.`,
    });
    return;
  }
  await sock.sendMessage(replyTo, { text: `✅ Word *"${args.trim()}"* added to bad words list.` });
}

export async function cmd_setwarn(ctx: CommandContext) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const num = parseInt(args.trim());
  if (isNaN(num) || num < 1) {
    const cur = getSetting(user, "warnLimit");
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Warning Limit*\n\nUsage: *${prefix}setwarn <number>*\nExample: *${prefix}setwarn 3*\n\nCurrent limit: *${cur}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { "botSettings.warnLimit": num });
  await sock.sendMessage(replyTo, { text: `✅ Warning limit set to *${num}*` });
}

export async function cmd_resetsetting(ctx: CommandContext) {
  const { sock, replyTo, isOwner, prefix } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  await User.findByIdAndUpdate(ctx.userId, { botSettings: DEFAULT_BOT_SETTINGS });
  await sock.sendMessage(replyTo, {
    text: `✅ *Bot settings have been reset to defaults.*\n\nType *${prefix}getsettings* to view current settings.`,
  });
}

export async function cmd_mode(ctx: CommandContext) {
  const { sock, replyTo, user, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Only the bot owner can change the mode." }); return; }
  const newMode = args.trim().toLowerCase();
  if (newMode !== "private" && newMode !== "public") {
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Bot Mode*\n\nUsage:\n• *${prefix}mode public* — Everyone can use commands\n• *${prefix}mode private* — Only you can use commands\n\nCurrent: *${user.botMode || "public"}*`,
    });
    return;
  }
  await User.findByIdAndUpdate(ctx.userId, { botMode: newMode });
  await sock.sendMessage(replyTo, {
    text: `✅ Bot mode changed to *${newMode === "private" ? "Private 🔒" : "Public 🌐"}*`,
  });
}

export async function cmd_setprefix(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Only the bot owner can change the prefix." }); return; }
  if (args.trim() === "" && prefix !== "") {
    await sock.sendMessage(replyTo, {
      text: `⚙️ *Set Prefix*\n\nUsage: *${prefix}setprefix <prefix>*\nExample: *${prefix}setprefix !*\nLeave blank for no prefix: *${prefix}setprefix .*\n\nCurrent prefix: *${prefix || "(none)"}*`,
    });
    return;
  }
  const newPrefix = args.trim();
  await User.findByIdAndUpdate(ctx.userId, { botPrefix: newPrefix });
  await sock.sendMessage(replyTo, {
    text: `✅ Prefix updated to: *${newPrefix || "(no prefix)"}*\nCommands now: *${newPrefix}menu*, *${newPrefix}ping*, etc.`,
  });
}

export const cmd_autoviewstatus = (ctx: CommandContext) =>
  toggleSetting(ctx, "autoviewstatus", "Auto View Status", "Automatically view WhatsApp statuses", "Stop auto-viewing statuses");

export const cmd_autoreactstatus = (ctx: CommandContext) =>
  toggleSetting(ctx, "autoreactstatus", "Auto React Status", "React to statuses with emoji", "Stop reacting to statuses");

export const cmd_statusantidelete = (ctx: CommandContext) =>
  toggleSetting(ctx, "statusantidelete", "Status Anti Delete", "Recover deleted statuses", "Disable status recovery");

export async function cmd_vv(ctx: CommandContext) {
  const { sock, msg, replyTo } = ctx;

  const contextInfo =
    msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo ||
    msg.message?.videoMessage?.contextInfo ||
    msg.message?.audioMessage?.contextInfo ||
    msg.message?.buttonsResponseMessage?.contextInfo ||
    msg.message?.templateButtonReplyMessage?.contextInfo;

  if (!contextInfo?.quotedMessage) {
    await sock.sendMessage(replyTo, {
      text: `❌ *Reply to a view-once message* with *.vv* to reveal it.\n\nExample: reply to any view-once image/video and send *.vv*`,
    });
    return;
  }

  const quoted = contextInfo.quotedMessage;
  const stanzaId = contextInfo.stanzaId || "";
  const participant = contextInfo.participant || contextInfo.remoteJid || replyTo;

  const vom =
    quoted.viewOnceMessage?.message ||
    quoted.viewOnceMessageV2?.message ||
    quoted.viewOnceMessageV2Extension?.message ||
    null;

  const innerMsg = vom || quoted;

  const fakeMsg: any = {
    key: {
      remoteJid: replyTo,
      id: stanzaId,
      fromMe: false,
      participant: participant,
    },
    message: vom ? { viewOnceMessage: { message: innerMsg } } : { ...quoted },
  };

  try {
    const { downloadMediaMessage } = await import("@whiskeysockets/baileys");

    if (innerMsg.imageMessage) {
      const buf = await downloadMediaMessage(fakeMsg, "buffer", {});
      await sock.sendMessage(replyTo, {
        image: buf as Buffer,
        caption: `👁️ *View Once Revealed* ✅\n${innerMsg.imageMessage.caption || ""}`,
      });
    } else if (innerMsg.videoMessage) {
      const buf = await downloadMediaMessage(fakeMsg, "buffer", {});
      await sock.sendMessage(replyTo, {
        video: buf as Buffer,
        caption: `👁️ *View Once Revealed* ✅\n${innerMsg.videoMessage.caption || ""}`,
      });
    } else if (innerMsg.audioMessage) {
      const buf = await downloadMediaMessage(fakeMsg, "buffer", {});
      await sock.sendMessage(replyTo, {
        audio: buf as Buffer,
        mimetype: "audio/mp4",
        ptt: !!innerMsg.audioMessage.ptt,
      });
    } else {
      await sock.sendMessage(replyTo, {
        text: `❌ Could not detect view-once media in the replied message. Make sure you reply directly to a view-once image or video.`,
      });
    }
  } catch (e: any) {
    await sock.sendMessage(replyTo, {
      text: `❌ Failed to reveal media: ${e.message}\n\nNote: View-once media may have expired or been deleted from WhatsApp servers.`,
    });
  }
}
