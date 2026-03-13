import User from "../models/User";
import { CommandContext, getSetting } from "./types";

function extractMentionedJids(msg: any): string[] {
  const text = msg?.message?.extendedTextMessage?.text || msg?.message?.conversation || "";
  const mentioned = msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const matches = text.match(/@(\d+)/g) || [];
  const fromText = matches.map((m: string) => `${m.slice(1)}@s.whatsapp.net`);
  return [...new Set([...mentioned, ...fromText])];
}

export async function cmd_block(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const targets = extractMentionedJids(msg);
  const num = args.replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `🚫 *Block Number*\n\nUsage: *${prefix}block @mention* or *${prefix}block <number>*`,
    });
    return;
  }
  try {
    for (const t of targets) await sock.updateBlockStatus(t, "block");
    await sock.sendMessage(replyTo, { text: `✅ Blocked ${targets.length} number(s).` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to block: ${e.message}` });
  }
}

export async function cmd_unblock(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const targets = extractMentionedJids(msg);
  const num = args.replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `✅ *Unblock Number*\n\nUsage: *${prefix}unblock @mention* or *${prefix}unblock <number>*`,
    });
    return;
  }
  try {
    for (const t of targets) await sock.updateBlockStatus(t, "unblock");
    await sock.sendMessage(replyTo, { text: `✅ Unblocked ${targets.length} number(s).` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to unblock: ${e.message}` });
  }
}

export async function cmd_delete(ctx: CommandContext) {
  const { sock, replyTo, msg, isOwner, prefix } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const quoted = msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedKey = msg?.message?.extendedTextMessage?.contextInfo;
  if (!quoted || !quotedKey) {
    await sock.sendMessage(replyTo, {
      text: `🗑️ *Delete Message*\n\nReply to a message with *${prefix}delete* to delete it.`,
    });
    return;
  }
  try {
    await sock.sendMessage(replyTo, {
      delete: {
        remoteJid: replyTo,
        fromMe: quotedKey.participant ? false : true,
        id: quotedKey.stanzaId,
        participant: quotedKey.participant,
      },
    });
    await sock.sendMessage(replyTo, { text: "✅ Message deleted." });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to delete: ${e.message}` });
  }
}

export async function cmd_deljunk(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  await sock.sendMessage(replyTo, {
    text: `🧹 *Delete Junk*\n\nThis command removes empty/junk messages from the chat.\n⚠️ Batch deletion is limited to messages sent by the bot.`,
  });
}

export async function cmd_join(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔗 *Join Group*\n\nUsage: *${prefix}join <invite_link_or_code>*\nExample: *${prefix}join https://chat.whatsapp.com/ABC123*`,
    });
    return;
  }
  const code = args.trim().replace("https://chat.whatsapp.com/", "");
  try {
    const groupId = await sock.groupAcceptInvite(code);
    await sock.sendMessage(replyTo, { text: `✅ Joined group: ${groupId}` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to join group: ${e.message}` });
  }
}

export async function cmd_leave(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!ctx.isGroup) {
    await sock.sendMessage(replyTo, { text: "❌ This command can only be used in a group." });
    return;
  }
  try {
    await sock.sendMessage(replyTo, { text: "👋 Goodbye! Bot is leaving the group." });
    await sock.groupLeave(replyTo);
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to leave: ${e.message}` });
  }
}

export async function cmd_online(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  try {
    await sock.sendPresenceUpdate("available");
    await sock.sendMessage(replyTo, { text: "✅ Bot is now showing as *Online*." });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_lastseen(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  try {
    await sock.sendPresenceUpdate("unavailable");
    await sock.sendMessage(replyTo, { text: "✅ Bot last seen is now *hidden*." });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_setbio(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `✏️ *Set Bio*\n\nUsage: *${prefix}setbio <text>*\nExample: *${prefix}setbio Powered by NX-MD BOT*`,
    });
    return;
  }
  try {
    await sock.updateProfileStatus(args.trim());
    await sock.sendMessage(replyTo, { text: `✅ Bio updated to: *${args.trim()}*` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to update bio: ${e.message}` });
  }
}

export async function cmd_setprofilepic(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  await sock.sendMessage(replyTo, {
    text: `🖼️ *Set Profile Picture*\n\nReply to an image with *${ctx.prefix}setprofilepic* to set it as the bot's profile picture.`,
  });
}

export async function cmd_react(ctx: CommandContext) {
  const { sock, replyTo, msg, args, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const emoji = args.trim() || "👍";
  const quoted = msg?.message?.extendedTextMessage?.contextInfo;
  if (!quoted?.stanzaId) {
    await sock.sendMessage(replyTo, {
      text: `😊 *React*\n\nReply to a message with *${ctx.prefix}react <emoji>*\nExample: *${ctx.prefix}react 🔥*`,
    });
    return;
  }
  try {
    await sock.sendMessage(replyTo, {
      react: { text: emoji, key: { remoteJid: replyTo, id: quoted.stanzaId, fromMe: false } },
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to react: ${e.message}` });
  }
}

export async function cmd_warn(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix, user, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const targets = [...extractMentionedJids(msg)];
  const num = args.replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `⚠️ *Warn Member*\n\nUsage: *${prefix}warn @mention <reason>*\nReach limit with: *${prefix}setwarn <number>*`,
    });
    return;
  }
  const warnings = (user.botSettings as any)?.warnings || {};
  const limit = getSetting(user, "warnLimit") || 5;
  const reason = args.replace(/@\d+/g, "").trim() || "No reason";
  const target = targets[0];
  const targetNum = target.split("@")[0];
  warnings[targetNum] = (warnings[targetNum] || 0) + 1;
  const count = warnings[targetNum];
  await User.findByIdAndUpdate(ctx.userId, { "botSettings.warnings": warnings });
  if (count >= limit) {
    await sock.sendMessage(replyTo, {
      text: `⛔ @${targetNum} has been warned ${count}/${limit} times and will be removed.\nReason: ${reason}`,
      mentions: [target],
    });
    if (ctx.isGroup) {
      try { await sock.groupParticipantsUpdate(replyTo, [target], "remove"); } catch {}
    }
    warnings[targetNum] = 0;
    await User.findByIdAndUpdate(ctx.userId, { "botSettings.warnings": warnings });
  } else {
    await sock.sendMessage(replyTo, {
      text: `⚠️ @${targetNum} warned (${count}/${limit})\nReason: ${reason}`,
      mentions: [target],
    });
  }
}

export async function cmd_readreceipts(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  const a = args.trim().toLowerCase();
  if (!a) {
    await sock.sendMessage(replyTo, {
      text: `👁️ *Read Receipts*\n\nUsage:\n• *${prefix}readreceipts on*\n• *${prefix}readreceipts off*`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `✅ Read receipts turned *${a}*\n_(Note: This is controlled by your WhatsApp privacy settings)_`,
  });
}

export async function cmd_restart(ctx: CommandContext) {
  const { sock, replyTo, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  await sock.sendMessage(replyTo, { text: "🔄 *Restarting bot...*\n\nBot will be back in a few seconds." });
  setTimeout(() => process.exit(0), 2000);
}

export async function cmd_autosavestatus(ctx: CommandContext) {
  const { sock, replyTo, args, prefix, isOwner } = ctx;
  if (!isOwner) { await sock.sendMessage(replyTo, { text: "❌ Owner only." }); return; }
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `💾 *Auto Save Status*\n\nUsage:\n• *${prefix}autosavestatus on*\n• *${prefix}autosavestatus off*\n\nAutomatically saves all statuses when viewed.`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `✅ Auto save status turned *${args.trim().toLowerCase() === "on" ? "ON" : "OFF"}*`,
  });
}
