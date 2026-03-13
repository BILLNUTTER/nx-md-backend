import { CommandContext, getSetting } from "./types";

function extractMentionedJids(msg: any): string[] {
  const text = msg?.message?.extendedTextMessage?.text || msg?.message?.conversation || "";
  const mentioned = msg?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const matches = text.match(/@(\d+)/g) || [];
  const fromText = matches.map((m: string) => `${m.slice(1)}@s.whatsapp.net`);
  return [...new Set([...mentioned, ...fromText])];
}

function requireGroup(ctx: CommandContext): boolean {
  if (!ctx.isGroup) {
    ctx.sock.sendMessage(ctx.replyTo, { text: "❌ This command can only be used in a group." });
    return false;
  }
  return true;
}

function requireOwnerOrAdmin(ctx: CommandContext): boolean {
  if (!ctx.isOwner) {
    ctx.sock.sendMessage(ctx.replyTo, { text: "❌ You need to be the bot owner to use this command." });
    return false;
  }
  return true;
}

export async function cmd_kick(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix, isGroup } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const targets = extractMentionedJids(msg);
  const num = args.trim().replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `👢 *Kick Member*\n\nUsage: *${prefix}kick @mention* or *${prefix}kick <number>*\nExample: *${prefix}kick @JohnDoe*`,
    });
    return;
  }
  try {
    await sock.groupParticipantsUpdate(replyTo, targets, "remove");
    await sock.sendMessage(replyTo, {
      text: `✅ Successfully removed ${targets.length} member(s) from the group.`,
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to kick: ${e.message}` });
  }
}

export async function cmd_promote(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const targets = extractMentionedJids(msg);
  const num = args.replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `⬆️ *Promote to Admin*\n\nUsage: *${prefix}promote @mention*`,
    });
    return;
  }
  try {
    await sock.groupParticipantsUpdate(replyTo, targets, "promote");
    await sock.sendMessage(replyTo, { text: `✅ Promoted ${targets.length} member(s) to admin.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to promote: ${e.message}` });
  }
}

export async function cmd_demote(ctx: CommandContext) {
  const { sock, replyTo, msg, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const targets = extractMentionedJids(msg);
  const num = args.replace(/[^0-9]/g, "");
  if (!targets.length && num) targets.push(`${num}@s.whatsapp.net`);
  if (!targets.length) {
    await sock.sendMessage(replyTo, {
      text: `⬇️ *Demote Admin*\n\nUsage: *${prefix}demote @mention*`,
    });
    return;
  }
  try {
    await sock.groupParticipantsUpdate(replyTo, targets, "demote");
    await sock.sendMessage(replyTo, { text: `✅ Demoted ${targets.length} admin(s) to member.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to demote: ${e.message}` });
  }
}

export async function cmd_add(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const num = args.trim().replace(/[^0-9]/g, "");
  if (!num) {
    await sock.sendMessage(replyTo, {
      text: `➕ *Add Member*\n\nUsage: *${prefix}add <number>*\nExample: *${prefix}add 254712345678*`,
    });
    return;
  }
  try {
    await sock.groupParticipantsUpdate(replyTo, [`${num}@s.whatsapp.net`], "add");
    await sock.sendMessage(replyTo, { text: `✅ Added ${num} to the group.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to add: ${e.message}` });
  }
}

export async function cmd_invite(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    const code = await sock.groupInviteCode(replyTo);
    await sock.sendMessage(replyTo, {
      text: `🔗 *Group Invite Link*\n\nhttps://chat.whatsapp.com/${code}`,
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to get invite link: ${e.message}` });
  }
}

export async function cmd_link(ctx: CommandContext) {
  await cmd_invite(ctx);
}

export async function cmd_open(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    await sock.groupSettingUpdate(replyTo, "not_announcement");
    await sock.sendMessage(replyTo, { text: `🔓 *Group is now OPEN* — all members can send messages.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_close(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    await sock.groupSettingUpdate(replyTo, "announcement");
    await sock.sendMessage(replyTo, { text: `🔒 *Group is now CLOSED* — only admins can send messages.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_announcements(ctx: CommandContext) {
  await cmd_close(ctx);
}

export async function cmd_setgroupname(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `✏️ *Set Group Name*\n\nUsage: *${prefix}setgroupname <name>*`,
    });
    return;
  }
  try {
    await sock.groupUpdateSubject(replyTo, args.trim());
    await sock.sendMessage(replyTo, { text: `✅ Group name updated to: *${args.trim()}*` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_setdesc(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `📝 *Set Group Description*\n\nUsage: *${prefix}setdesc <description>*`,
    });
    return;
  }
  try {
    await sock.groupUpdateDescription(replyTo, args.trim());
    await sock.sendMessage(replyTo, { text: `✅ Group description updated.` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_tagall(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    const metadata = await sock.groupMetadata(replyTo);
    const members = metadata.participants || [];
    const mentions = members.map((p: any) => p.id);
    const text = `📢 *Tag All Members*\n\n${members.map((p: any) => `@${p.id.split("@")[0]}`).join(" ")}`;
    await sock.sendMessage(replyTo, { text, mentions });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_hidetag(ctx: CommandContext) {
  const { sock, replyTo, args } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    const metadata = await sock.groupMetadata(replyTo);
    const members = metadata.participants || [];
    const mentions = members.map((p: any) => p.id);
    const text = args.trim() || "📢";
    await sock.sendMessage(replyTo, { text, mentions });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_tag(ctx: CommandContext) {
  const { sock, replyTo, msg, args } = ctx;
  if (!requireGroup(ctx)) return;
  const targets = extractMentionedJids(msg);
  const text = args.replace(/@\d+/g, "").trim() || "👋";
  if (!targets.length) {
    await sock.sendMessage(replyTo, { text: `🏷️ Usage: *${ctx.prefix}tag @mention <message>*` });
    return;
  }
  const tagText = `${text}\n${targets.map((j: string) => `@${j.split("@")[0]}`).join(" ")}`;
  await sock.sendMessage(replyTo, { text: tagText, mentions: targets });
}

export async function cmd_tagadmin(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    const metadata = await sock.groupMetadata(replyTo);
    const admins = metadata.participants.filter((p: any) => p.admin);
    if (!admins.length) {
      await sock.sendMessage(replyTo, { text: "ℹ️ No admins found in this group." });
      return;
    }
    const mentions = admins.map((p: any) => p.id);
    await sock.sendMessage(replyTo, {
      text: `👑 *Group Admins*\n\n${admins.map((p: any) => `@${p.id.split("@")[0]}`).join("\n")}`,
      mentions,
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_totalmembers(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  if (!requireGroup(ctx)) return;
  try {
    const metadata = await sock.groupMetadata(replyTo);
    const members = metadata.participants || [];
    const admins = members.filter((p: any) => p.admin);
    await sock.sendMessage(replyTo, {
      text: `👥 *Group Members*\n\n📊 Total: ${members.length}\n👑 Admins: ${admins.length}\n👤 Members: ${members.length - admins.length}\n\n📛 Group: ${metadata.subject}`,
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_kickall(ctx: CommandContext) {
  const { sock, replyTo, user } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  try {
    const metadata = await sock.groupMetadata(replyTo);
    const ownerJid = `${user.whatsappNumber}@s.whatsapp.net`;
    const toKick = metadata.participants
      .filter((p: any) => !p.admin && p.id !== ownerJid)
      .map((p: any) => p.id);
    if (!toKick.length) {
      await sock.sendMessage(replyTo, { text: "ℹ️ No non-admin members to kick." });
      return;
    }
    await sock.groupParticipantsUpdate(replyTo, toKick, "remove");
    await sock.sendMessage(replyTo, { text: `✅ Kicked ${toKick.length} member(s).` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed: ${e.message}` });
  }
}

export async function cmd_poll(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const parts = args.split("|").map((s: string) => s.trim()).filter(Boolean);
  if (parts.length < 3) {
    await sock.sendMessage(replyTo, {
      text: `📊 *Create Poll*\n\nUsage: *${prefix}poll Question | Option1 | Option2 | Option3*\nExample: *${prefix}poll Best fruit? | Mango | Banana | Pineapple*`,
    });
    return;
  }
  const question = parts[0];
  const options = parts.slice(1).map((o: string) => ({ optionName: o }));
  try {
    await sock.sendMessage(replyTo, {
      poll: { name: question, values: options.map((o: any) => o.optionName), selectableCount: 1 },
    });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to create poll: ${e.message}` });
  }
}

export async function cmd_allow(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  await sock.sendMessage(replyTo, {
    text: `✅ *Allow*\nUsage: *${prefix}allow @mention* — Whitelist a member from group filters.`,
  });
}

export async function cmd_addcode(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!requireOwnerOrAdmin(ctx)) return;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔗 *Join via Invite Code*\n\nUsage: *${prefix}addcode <invite_code_or_link>*\nExample: *${prefix}addcode ABC123XYZ*`,
    });
    return;
  }
  const code = args.trim().replace("https://chat.whatsapp.com/", "");
  try {
    const groupId = await ctx.sock.groupAcceptInvite(code);
    await sock.sendMessage(replyTo, { text: `✅ Joined group: ${groupId}` });
  } catch (e: any) {
    await sock.sendMessage(replyTo, { text: `❌ Failed to join group: ${e.message}` });
  }
}

export async function cmd_antibadword(ctx: CommandContext) {
  const { sock, replyTo, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  await sock.sendMessage(replyTo, {
    text: `🚫 *Anti Bad Word*\n\nUsage: *${prefix}antibadword on/off*\nAdd words: *${prefix}addbadword <word>*\n\n_Members who send bad words will be warned or kicked._`,
  });
}

export async function cmd_antibot(ctx: CommandContext) {
  const { sock, replyTo, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  await sock.sendMessage(replyTo, {
    text: `🤖 *Anti Bot*\n\nUsage: *${prefix}antibot on/off*\nBlocks bots from sending messages in this group.`,
  });
}

export async function cmd_antilink(ctx: CommandContext) {
  const { sock, replyTo, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  await sock.sendMessage(replyTo, {
    text: `🔗 *Anti Link*\n\nUsage: *${prefix}antilink on/off*\nDeletes messages with links in the group (non-admins).`,
  });
}

export async function cmd_welcome(ctx: CommandContext) {
  const { sock, replyTo, user, args, prefix } = ctx;
  if (!requireGroup(ctx) || !requireOwnerOrAdmin(ctx)) return;
  const current = getSetting(user, "welcomemsg");
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `👋 *Welcome Message*\n\nUsage: *${prefix}welcome <message>*\nVariables: {name}, {group}, {count}\n\nCurrent: ${current || "(not set)"}\n\nSet with: *${prefix}setwelcome <message>*`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `✅ Welcome message preview:\n\n${args.trim().replace("{name}", "Member").replace("{group}", "This Group").replace("{count}", "100")}`,
  });
}
