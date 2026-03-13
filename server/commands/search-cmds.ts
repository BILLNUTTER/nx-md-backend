import https from "https";
import http from "http";
import { CommandContext } from "./types";

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, { headers: { "User-Agent": "NX-MD-Bot/1.0" } }, (res) => {
      let data = "";
      res.on("data", (chunk: any) => { data += chunk; });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

export async function cmd_weather(ctx: CommandContext) {
  const { sock, replyTo, args } = ctx;
  const location = args.trim() || "Nairobi";
  try {
    const data = await fetchUrl(`https://wttr.in/${encodeURIComponent(location)}?format=4`);
    await sock.sendMessage(replyTo, {
      text: `🌤️ *Weather for ${location}*\n\n${data.trim()}\n\n_Data from wttr.in_`,
    });
  } catch {
    await sock.sendMessage(replyTo, {
      text: `❌ Could not fetch weather for *${location}*.\nUsage: \`${ctx.prefix}weather Nairobi\``,
    });
  }
}

export async function cmd_define(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  const word = args.trim().split(" ")[0];
  if (!word) {
    await sock.sendMessage(replyTo, {
      text: `📖 *Define Word*\n\nUsage: *${prefix}define <word>*\nExample: *${prefix}define philosophy*`,
    });
    return;
  }
  try {
    const raw = await fetchUrl(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || !data[0]) throw new Error("not found");
    const entry = data[0];
    const meanings = entry.meanings?.slice(0, 2) || [];
    let text = `📖 *Definition: ${word}*\n`;
    if (entry.phonetic) text += `🔊 *Phonetic:* ${entry.phonetic}\n`;
    text += "\n";
    for (const m of meanings) {
      text += `*${m.partOfSpeech}*\n`;
      const defs = m.definitions?.slice(0, 2) || [];
      for (const d of defs) {
        text += `• ${d.definition}\n`;
        if (d.example) text += `  _"${d.example}"_\n`;
      }
      text += "\n";
    }
    await sock.sendMessage(replyTo, { text: text.trim() });
  } catch {
    await sock.sendMessage(replyTo, {
      text: `❌ Could not find definition for *${word}*.\nCheck the spelling and try again.`,
    });
  }
}

export async function cmd_define2(ctx: CommandContext) {
  await cmd_define(ctx);
}

export async function cmd_imdb(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🎬 *IMDB Search*\n\nUsage: *${prefix}imdb <movie name>*\nExample: *${prefix}imdb Avengers*\n\n⚠️ Full IMDB integration requires API configuration.\nContact: 0758891491`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🎬 *IMDB Search:* ${args.trim()}\n\n⚠️ This feature requires IMDB API configuration.\nFor full access, contact Nutterx Technologies:\n📞 0758891491\n🔗 https://wa.me/254758891491`,
  });
}

export async function cmd_lyrics(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🎵 *Lyrics Finder*\n\nUsage: *${prefix}lyrics <song name> - artist*\nExample: *${prefix}lyrics Blinding Lights - The Weeknd*`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🎵 *Lyrics:* ${args.trim()}\n\n⚠️ Lyrics API requires configuration.\nContact Nutterx Technologies for full access:\n📞 0758891491`,
  });
}

export async function cmd_shazam(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎵 *Shazam — Song Recognition*\n\n⚠️ Send an audio file with the caption *${ctx.prefix}shazam* to identify a song.\nThis feature requires API configuration.\nContact: 0758891491`,
  });
}

export async function cmd_yts(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🎬 *YouTube Search*\n\nUsage: *${prefix}yts <title>*\nExample: *${prefix}yts Sauti Sol songs*`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🔍 *YouTube Search:* ${args.trim()}\n\n⚠️ YouTube API requires configuration.\nFor full media download and search, contact:\n📞 0758891491\n🔗 https://wa.me/254758891491`,
  });
}
