import QRCode from "qrcode";
import { CommandContext } from "./types";

const FANCY_MAPS: Record<string, string[]> = {
  bold: [...Array(26)].map((_, i) => String.fromCodePoint(0x1D400 + i)).concat([...Array(26)].map((_, i) => String.fromCodePoint(0x1D41A + i))).concat([...Array(10)].map((_, i) => String.fromCodePoint(0x1D7CE + i))),
};

function fancyFont(text: string, fontName: string): string {
  const styles: Record<string, { a: number; A: number; zero?: number }> = {
    bold: { A: 0x1D400, a: 0x1D41A, zero: 0x1D7CE },
    italic: { A: 0x1D434, a: 0x1D44E },
    bolditalic: { A: 0x1D468, a: 0x1D482 },
    mono: { A: 0x1D670, a: 0x1D68A, zero: 0x1D7F6 },
    doublestruck: { A: 0x1D538, a: 0x1D552, zero: 0x1D7D8 },
    script: { A: 0x1D49C, a: 0x1D4B6 },
    fraktur: { A: 0x1D504, a: 0x1D51E },
    sans: { A: 0x1D5A0, a: 0x1D5BA, zero: 0x1D7E2 },
    boldsans: { A: 0x1D5D4, a: 0x1D5EE, zero: 0x1D7EC },
    circled: { A: 0x24B6, a: 0x24D0 },
  };
  const style = styles[fontName.toLowerCase()] || styles["bold"];
  return text.split("").map(ch => {
    const code = ch.codePointAt(0)!;
    if (code >= 65 && code <= 90) return String.fromCodePoint(style.A + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(style.a + code - 97);
    if (style.zero && code >= 48 && code <= 57) return String.fromCodePoint(style.zero + code - 48);
    return ch;
  }).join("");
}

const FLIP_MAP: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ı",
  j: "ɾ", k: "ʞ", l: "l", m: "ɯ", n: "u", o: "o", p: "d", q: "b", r: "ɹ",
  s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "B", C: "Ɔ", D: "D", E: "Ǝ", F: "Ⅎ", G: "פ", H: "H", I: "I",
  J: "ɾ", K: "K", L: "˥", M: "W", N: "N", O: "O", P: "Ԁ", Q: "Q", R: "R",
  S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  "1": "Ɩ", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "L",
  "8": "8", "9": "6", "0": "0", ".": "˙", ",": "'", "!": "¡", "?": "¿",
};

function flipText(text: string): string {
  return text.split("").reverse().map(c => FLIP_MAP[c] || c).join("");
}

function genPassword(length: number, opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean }): string {
  let charset = "";
  if (opts.upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.lower) charset += "abcdefghijklmnopqrstuvwxyz";
  if (opts.numbers) charset += "0123456789";
  if (opts.symbols) charset += "!@#$%^&*()-_=+[]{}|;:,.<>?";
  if (!charset) charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += charset[Math.floor(Math.random() * charset.length)];
  }
  return pwd;
}

export async function cmd_calculate(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🧮 *Calculator*\n\nUsage: *${prefix}calculate <expression>*\nExample: *${prefix}calculate 25 * 4 + 10*\nSupports: +, -, *, /, **, (, ), %, sqrt`,
    });
    return;
  }
  try {
    let expr = args.trim()
      .replace(/sqrt\(([^)]+)\)/g, (_: any, n: string) => String(Math.sqrt(parseFloat(n))))
      .replace(/\^/g, "**")
      .replace(/[^0-9+\-*/().\s%*]/g, "");

    if (!/^[\d\s+\-*/()\\.%*]+$/.test(expr)) throw new Error("invalid");
    const result = Function(`"use strict"; return (${expr})`)();
    if (!isFinite(result)) throw new Error("invalid result");
    await sock.sendMessage(replyTo, {
      text: `🧮 *Calculator*\n\n📥 Input: \`${args.trim()}\`\n📤 Result: *${result}*`,
    });
  } catch {
    await sock.sendMessage(replyTo, {
      text: `❌ Invalid expression.\nUsage: *${prefix}calculate 10 + 5 * 2*`,
    });
  }
}

export async function cmd_fancy(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `✨ *Fancy Text*\n\nUsage: *${prefix}fancy <text>*\nExample: *${prefix}fancy Hello World*\n\nConverts your text into multiple fancy styles!`,
    });
    return;
  }
  const text = args.trim();
  const styles = ["bold", "italic", "bolditalic", "mono", "doublestruck", "script", "sans", "boldsans"];
  let result = `✨ *Fancy Text Styles*\n\n*Original:* ${text}\n\n`;
  for (const style of styles) {
    result += `*${style}:* ${fancyFont(text, style)}\n`;
  }
  await sock.sendMessage(replyTo, { text: result });
}

export async function cmd_fliptext(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔄 *Flip Text*\n\nUsage: *${prefix}fliptext <text>*\nExample: *${prefix}fliptext Hello World*`,
    });
    return;
  }
  const flipped = flipText(args.trim());
  await sock.sendMessage(replyTo, {
    text: `🔄 *Flipped Text*\n\n${flipped}`,
  });
}

export async function cmd_genpass(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  const parts = args.trim().split(/\s+/);
  const length = Math.min(Math.max(parseInt(parts[0]) || 16, 6), 64);
  const flags = parts.slice(1).join(" ").toLowerCase();
  const noSymbols = flags.includes("nosym") || flags.includes("simple");
  const noUpper = flags.includes("noup");
  const noLower = flags.includes("nolow");
  const noNums = flags.includes("nonum");

  const pwd = genPassword(length, {
    upper: !noUpper,
    lower: !noLower,
    numbers: !noNums,
    symbols: !noSymbols,
  });

  await sock.sendMessage(replyTo, {
    text: `🔑 *Generated Password*\n\n\`${pwd}\`\n\n📏 Length: ${length}\n🔤 Uppercase: ${!noUpper ? "✅" : "❌"}\n🔡 Lowercase: ${!noLower ? "✅" : "❌"}\n🔢 Numbers: ${!noNums ? "✅" : "❌"}\n🔣 Symbols: ${!noSymbols ? "✅" : "❌"}\n\nUsage: *${prefix}genpass [length] [nosym]*`,
  });
}

export async function cmd_say(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `📢 *Say*\n\nUsage: *${prefix}say <message>*\nExample: *${prefix}say Hello everyone!*`,
    });
    return;
  }
  await sock.sendMessage(replyTo, { text: args.trim() });
}

export async function cmd_qrcode(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `📱 *QR Code Generator*\n\nUsage: *${prefix}qrcode <text or URL>*\nExample: *${prefix}qrcode https://wa.me/254758891491*`,
    });
    return;
  }
  try {
    const qrBuffer = await QRCode.toBuffer(args.trim(), { width: 400, margin: 2 });
    await sock.sendMessage(replyTo, {
      image: qrBuffer,
      caption: `📱 *QR Code*\n\n🔗 Content: ${args.trim()}`,
    });
  } catch {
    await sock.sendMessage(replyTo, { text: `❌ Failed to generate QR code.` });
  }
}

export async function cmd_tinyurl(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔗 *URL Shortener*\n\nUsage: *${prefix}tinyurl <URL>*\nExample: *${prefix}tinyurl https://example.com/very/long/url*`,
    });
    return;
  }
  const url = args.trim();
  try {
    const https = await import("https");
    const short: string = await new Promise((resolve, reject) => {
      https.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, (res: any) => {
        let data = "";
        res.on("data", (c: any) => { data += c; });
        res.on("end", () => resolve(data.trim()));
      }).on("error", reject);
    });
    await sock.sendMessage(replyTo, {
      text: `🔗 *Shortened URL*\n\n📥 Original: ${url}\n📤 Short: ${short}`,
    });
  } catch {
    await sock.sendMessage(replyTo, {
      text: `🔗 *URL Shortener*\n\nYour URL: ${url}\n\n⚠️ Could not connect to URL shortening service. Try: https://tinyurl.com`,
    });
  }
}

export async function cmd_device(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  const os = await import("os");
  const platform = os.platform();
  const arch = os.arch();
  const nodeVersion = process.version;
  await sock.sendMessage(replyTo, {
    text: `📱 *Device Info*\n\n🤖 *Bot:* NX-MD BOT v1.9.0\n🖥️ *Platform:* ${platform}\n⚙️ *Architecture:* ${arch}\n💚 *Node.js:* ${nodeVersion}\n🏢 *By:* Nutterx Technologies`,
  });
}

export async function cmd_browse(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🌐 *Web Browser*\n\nUsage: *${prefix}browse <URL>*\nExample: *${prefix}browse https://google.com*\n\n⚠️ Screenshots require premium server. Contact: 0758891491`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🌐 *Browse:* ${args.trim()}\n\n⚠️ Web screenshot requires premium configuration.\nContact: 0758891491`,
  });
}

export async function cmd_obfuscate(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔀 *Obfuscate Text*\n\nUsage: *${prefix}obfuscate <text>*\nMixes the text with special unicode characters.`,
    });
    return;
  }
  const text = args.trim();
  const combining = ["̴", "̵", "̶", "̷", "̸", "͟", "͠", "͡"];
  const result = text.split("").map(c => c + combining[Math.floor(Math.random() * combining.length)]).join("");
  await sock.sendMessage(replyTo, { text: `🔀 ${result}` });
}

export async function cmd_emojimix(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `😀 *Emoji Mix*\n\nUsage: *${prefix}emojimix 😀 + 🔥*\nExample: *${prefix}emojimix 😂 🐶*`,
    });
    return;
  }
  const emojis = args.match(/\p{Emoji}/gu) || [];
  if (emojis.length < 2) {
    await sock.sendMessage(replyTo, { text: `😀 Send 2 emojis to mix!\nExample: *${prefix}emojimix 😀 🔥*` });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `😀 *Emoji Mix Result*\n\n${emojis[0]} + ${emojis[1]} = ${emojis[0]}${emojis[1]}\n\n🔗 Full mixer: https://emojikitchen.dev`,
  });
}

export async function cmd_getabout(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `ℹ️ *Get About (Bio)*\n\nUsage: *${prefix}getabout <number>*\nExample: *${prefix}getabout 254712345678*`,
    });
    return;
  }
  const num = args.trim().replace(/\D/g, "");
  try {
    const status = await ctx.sock.fetchStatus(`${num}@s.whatsapp.net`);
    await sock.sendMessage(replyTo, {
      text: `ℹ️ *About/Bio*\n\n📞 Number: ${num}\n💬 Status: ${status?.status || "(no bio)"}\n📅 Set at: ${status?.setAt ? new Date(status.setAt).toLocaleString() : "unknown"}`,
    });
  } catch {
    await sock.sendMessage(replyTo, { text: `❌ Could not fetch bio for ${num}.` });
  }
}

export async function cmd_getpp(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🖼️ *Get Profile Picture*\n\nUsage: *${prefix}getpp <number>*\nExample: *${prefix}getpp 254712345678*`,
    });
    return;
  }
  const num = args.trim().replace(/\D/g, "");
  try {
    const ppUrl = await sock.profilePictureUrl(`${num}@s.whatsapp.net`, "image");
    await sock.sendMessage(replyTo, {
      image: { url: ppUrl },
      caption: `🖼️ *Profile Picture*\n📞 Number: ${num}`,
    });
  } catch {
    await sock.sendMessage(replyTo, { text: `❌ No profile picture found for ${num} (privacy settings may be on).` });
  }
}

export async function cmd_ssweb(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `📸 *Screenshot Website*\n\nUsage: *${prefix}ssweb <URL>*\nExample: *${prefix}ssweb https://google.com*\n\n⚠️ Requires premium server. Contact: 0758891491`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📸 *Screenshot:* ${args.trim()}\n\n⚠️ This feature requires a headless browser configured on the server.\nContact Nutterx Technologies: 0758891491`,
  });
}

export async function cmd_texttopdf(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  await sock.sendMessage(replyTo, {
    text: `📄 *Text to PDF*\n\nUsage: *${prefix}texttopdf <text>*\n\n⚠️ PDF generation requires premium configuration.\nContact: 0758891491`,
  });
}

export async function cmd_toimage(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🖼️ *To Image*\nReply to a sticker with *${ctx.prefix}toimage* to convert it to a PNG image.`,
  });
}

export async function cmd_sticker(ctx: CommandContext) {
  const { sock, replyTo, user } = ctx;
  const packname = (user.botSettings as any)?.packname || "NX-MD";
  const author = (user.botSettings as any)?.author || "X";
  await sock.sendMessage(replyTo, {
    text: `🎭 *Sticker Maker*\n\nReply to an *image or video* with *${ctx.prefix}sticker* to create a sticker.\n\n📦 Pack: ${packname}\n✏️ Author: ${author}`,
  });
}
