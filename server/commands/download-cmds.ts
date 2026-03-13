import { CommandContext } from "./types";

function dlNotAvailable(sock: any, replyTo: string, label: string, prefix: string, cmd: string, example: string) {
  return sock.sendMessage(replyTo, {
    text: `⬇️ *${label}*\n\nUsage: *${prefix}${cmd} <url or query>*\nExample: *${prefix}${cmd} ${example}*\n\n⚠️ Media downloading requires server-side configuration.\nContact Nutterx Technologies for deployment:\n📞 0758891491\n🔗 https://wa.me/254758891491`,
  });
}

export async function cmd_tiktok(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "TikTok Downloader", prefix, "tiktok", "https://tiktok.com/@user/video/123");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📱 *TikTok Download*\n🔗 URL: ${args.trim()}\n\n⚠️ Requires ytdlp server setup. Contact: 0758891491`,
  });
}

export async function cmd_tiktokaudio(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "TikTok Audio", prefix, "tiktokaudio", "https://tiktok.com/@user/video/123");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🎵 *TikTok Audio*\n🔗 URL: ${args.trim()}\n\n⚠️ Requires ytdlp. Contact: 0758891491`,
  });
}

export async function cmd_twitter(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Twitter/X Downloader", prefix, "twitter", "https://x.com/user/status/123");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🐦 *Twitter/X Download*\n🔗 URL: ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_instagram(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Instagram Downloader", prefix, "instagram", "https://instagram.com/p/XXXXX");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📸 *Instagram Download*\n🔗 URL: ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_facebook(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Facebook Downloader", prefix, "facebook", "https://facebook.com/video/123");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `👍 *Facebook Download*\n🔗 URL: ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_youtube(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "YouTube Downloader", prefix, "youtube", "https://youtube.com/watch?v=XXX");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `▶️ *YouTube Download*\n🔗 URL: ${args.trim()}\n\n⚠️ Requires ytdlp. Contact: 0758891491`,
  });
}

export async function cmd_song(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Song Download", prefix, "song", "Tujuane Nyashinski");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🎵 *Song Download:* ${args.trim()}\n\n⚠️ Music download requires ytdlp + ffmpeg.\nContact: 0758891491`,
  });
}

export async function cmd_song2(ctx: CommandContext) {
  await cmd_song(ctx);
}

export async function cmd_video(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Video Download", prefix, "video", "https://youtube.com/watch?v=XXX");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🎬 *Video Download:* ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_videodoc(ctx: CommandContext) {
  await cmd_video(ctx);
}

export async function cmd_xvideos(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `⚠️ *Adult Content* downloads are disabled on this bot.\n\nContact Nutterx Technologies for custom configurations:\n📞 0758891491`,
  });
}

export async function cmd_apk(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "APK Downloader", prefix, "apk", "WhatsApp");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📦 *APK Download:* ${args.trim()}\n\n⚠️ APK downloads require Play Store API.\nContact: 0758891491`,
  });
}

export async function cmd_mediafire(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "MediaFire Downloader", prefix, "mediafire", "https://mediafire.com/file/xxx");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📁 *MediaFire Download:* ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_gdrive(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Google Drive Download", prefix, "gdrive", "https://drive.google.com/file/xxx");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `☁️ *Google Drive Download:* ${args.trim()}\n\n⚠️ Requires OAuth. Contact: 0758891491`,
  });
}

export async function cmd_gitclone(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "GitHub Clone", prefix, "gitclone", "https://github.com/user/repo");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `⬇️ *GitHub Clone:* ${args.trim()}\n\nRepo: ${args.trim()}\n⚠️ Git clone as zip — server-side only. Contact: 0758891491`,
  });
}

export async function cmd_pin(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "Pinterest Download", prefix, "pin", "https://pin.it/xxxx");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `📌 *Pinterest Download:* ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_image(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `🔍 *Image Search*\n\nUsage: *${prefix}image <search>*\nExample: *${prefix}image Nairobi city*\n\n⚠️ Image search requires API key. Contact: 0758891491`,
    });
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🔍 *Image Search:* ${args.trim()}\n\n🔗 Search manually: https://images.google.com/search?q=${encodeURIComponent(args.trim())}\n\n⚠️ Auto-download requires API. Contact: 0758891491`,
  });
}

export async function cmd_itunes(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await dlNotAvailable(sock, replyTo, "iTunes/Apple Music", prefix, "itunes", "Tujuane");
    return;
  }
  await sock.sendMessage(replyTo, {
    text: `🍎 *iTunes Search:* ${args.trim()}\n\n⚠️ Contact: 0758891491`,
  });
}

export async function cmd_savestatus(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `💾 *Save Status*\n\nReply to a status or use *${ctx.prefix}savestatus* to save viewed statuses.\n\n_Enable Auto View Status: ${ctx.prefix}autoviewstatus on_\n_Enable Auto Save Status: ${ctx.prefix}autosavestatus on_`,
  });
}

export async function cmd_download(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  if (!args.trim()) {
    await sock.sendMessage(replyTo, {
      text: `⬇️ *Universal Downloader*\n\nUsage: *${prefix}download <URL>*\nSupports: YouTube, TikTok, Instagram, Facebook, Twitter, MediaFire\n\n⚠️ Requires server ytdlp. Contact: 0758891491`,
    });
    return;
  }
  const url = args.trim();
  if (url.includes("tiktok")) return cmd_tiktok(ctx);
  if (url.includes("instagram")) return cmd_instagram(ctx);
  if (url.includes("facebook") || url.includes("fb.watch")) return cmd_facebook(ctx);
  if (url.includes("twitter") || url.includes("x.com")) return cmd_twitter(ctx);
  if (url.includes("youtube") || url.includes("youtu.be")) return cmd_youtube(ctx);
  await sock.sendMessage(replyTo, {
    text: `⬇️ *Download:* ${url}\n\n⚠️ Contact Nutterx Technologies for download setup:\n📞 0758891491`,
  });
}

export async function cmd_tomp3(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎵 *To MP3*\n\nReply to a video with *${ctx.prefix}tomp3* to convert it to audio.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_toptt(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🔊 *To PTT (Voice Note)*\n\nReply to an audio with *${ctx.prefix}toptt* to convert to voice note.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_bass(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎵 *Bass Boost*\n\nReply to an audio with *${ctx.prefix}bass* to boost bass.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_earrape(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `📢 *Ear Rape*\n\nReply to an audio with *${ctx.prefix}earrape* to maximize volume.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_reverse(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `⏮️ *Reverse Audio*\n\nReply to an audio with *${ctx.prefix}reverse* to reverse it.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_robot(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🤖 *Robot Voice*\n\nReply to a voice note with *${ctx.prefix}robot* to apply robot effect.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_deep(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🔊 *Deep Voice*\n\nReply to a voice note with *${ctx.prefix}deep* to lower the pitch.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_blown(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `💨 *Blown*\n\nReply to an audio with *${ctx.prefix}blown* to apply blown-speaker effect.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_volaudio(ctx: CommandContext) {
  const { sock, replyTo, args, prefix } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🔊 *Volume Adjust Audio*\n\nUsage: *${prefix}volaudio <1-10>*\nReply to an audio message.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_toaudio(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎵 *Video to Audio*\n\nReply to a video with *${ctx.prefix}toaudio* to extract audio.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_tovideo(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎬 *Audio to Video*\n\nReply to audio with *${ctx.prefix}tovideo* to create a simple video.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}

export async function cmd_volvideo(ctx: CommandContext) {
  const { sock, replyTo, prefix } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🔊 *Volume Adjust Video*\n\nUsage: *${prefix}volvideo <1-10>*\nReply to a video.\n\n⚠️ Requires ffmpeg. Contact: 0758891491`,
  });
}
