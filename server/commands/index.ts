import { CommandContext, CommandHandler } from "./types";

import {
  cmd_ping, cmd_ping2, cmd_runtime, cmd_botstatus, cmd_owner, cmd_repo, cmd_disk, cmd_time, cmd_pair, cmd_help,
} from "./utility-cmds";

import {
  cmd_fact, cmd_jokes, cmd_quotes, cmd_trivia, cmd_truth, cmd_dare, cmd_truthordare,
} from "./fun-cmds";

import {
  cmd_getsettings, cmd_anticall, cmd_chatbot, cmd_antibug, cmd_autotype, cmd_autoread,
  cmd_autoreact, cmd_autoblock, cmd_alwaysonline, cmd_autobio, cmd_antisticker,
  cmd_antiviewonce, cmd_antidelete, cmd_antiedit, cmd_setbotname, cmd_setwelcome,
  cmd_setfont, cmd_addbadword, cmd_setwarn, cmd_resetsetting, cmd_mode, cmd_setprefix,
  cmd_autoviewstatus, cmd_autoreactstatus, cmd_statusantidelete, cmd_vv,
} from "./settings-cmds";

import {
  cmd_calculate, cmd_fancy, cmd_fliptext, cmd_genpass, cmd_say, cmd_qrcode, cmd_tinyurl,
  cmd_device, cmd_browse, cmd_obfuscate, cmd_emojimix, cmd_getabout, cmd_getpp,
  cmd_ssweb, cmd_texttopdf, cmd_toimage, cmd_sticker,
} from "./tools-cmds";

import {
  cmd_kick, cmd_promote, cmd_demote, cmd_add, cmd_invite, cmd_link, cmd_open, cmd_close,
  cmd_announcements, cmd_setgroupname, cmd_setdesc, cmd_tagall, cmd_hidetag, cmd_tag,
  cmd_tagadmin, cmd_totalmembers, cmd_kickall, cmd_poll, cmd_allow, cmd_addcode,
  cmd_antibadword, cmd_antibot, cmd_antilink, cmd_welcome,
} from "./group-cmds";

import {
  cmd_block, cmd_unblock, cmd_delete, cmd_deljunk, cmd_join, cmd_leave, cmd_online,
  cmd_lastseen, cmd_setbio, cmd_setprofilepic, cmd_react, cmd_warn, cmd_readreceipts,
  cmd_restart, cmd_autosavestatus,
} from "./owner-cmds";

import {
  cmd_weather, cmd_define, cmd_define2, cmd_imdb, cmd_lyrics, cmd_shazam, cmd_yts,
} from "./search-cmds";

import {
  cmd_gpt, cmd_gemini, cmd_blackbox, cmd_deepseek, cmd_code, cmd_programming,
  cmd_analyze, cmd_summarize, cmd_translate2, cmd_translate, cmd_recipe, cmd_story,
  cmd_teach, cmd_generate, cmd_doppleai, cmd_dalle,
} from "./ai-cmds";

import {
  cmd_tiktok, cmd_tiktokaudio, cmd_twitter, cmd_instagram, cmd_facebook, cmd_youtube,
  cmd_song, cmd_song2, cmd_video, cmd_videodoc, cmd_xvideos, cmd_apk, cmd_mediafire,
  cmd_gdrive, cmd_gitclone, cmd_pin, cmd_image, cmd_itunes, cmd_savestatus, cmd_download,
  cmd_tomp3, cmd_toptt, cmd_bass, cmd_earrape, cmd_reverse, cmd_robot, cmd_deep, cmd_blown,
  cmd_volaudio, cmd_toaudio, cmd_tovideo, cmd_volvideo,
} from "./download-cmds";

const COMMAND_MAP: Record<string, CommandHandler> = {
  ping: cmd_ping,
  ping2: cmd_ping2,
  runtime: cmd_runtime,
  botstatus: cmd_botstatus,
  owner: cmd_owner,
  repo: cmd_repo,
  disk: cmd_disk,
  time: cmd_time,
  pair: cmd_pair,
  help: cmd_help,
  menu: async (ctx) => {
    const { sock, replyTo, prefix, user } = ctx;
    const s = (user.botSettings as any) || {};
    const botname = s.botname || "NX-MD";
    const p = prefix || "";
    const menu = `╔══════════════════╗
║  🤖 *${botname} BOT MENU*  ║
╚══════════════════╝

*📍 PREFIX:* ${p || "(none)"}
*👤 USER:* @${ctx.senderJid.split("@")[0]}
*📅 DATE:* ${new Date().toLocaleDateString("en-KE")}

╔══[ 🧠 *AI MENU* ]══╗
│ ${p}gpt │ ${p}gemini │ ${p}blackbox
│ ${p}deepseek │ ${p}code │ ${p}analyze
│ ${p}summarize │ ${p}translate │ ${p}recipe
│ ${p}story │ ${p}teach │ ${p}generate
╚══════════════════╝

╔══[ 🔊 *AUDIO* ]══╗
│ ${p}bass │ ${p}earrape │ ${p}reverse
│ ${p}robot │ ${p}deep │ ${p}tomp3 │ ${p}toptt
╚══════════════════╝

╔══[ ⬇️ *DOWNLOAD* ]══╗
│ ${p}tiktok │ ${p}instagram │ ${p}facebook
│ ${p}twitter │ ${p}youtube │ ${p}song
│ ${p}mediafire │ ${p}gdrive │ ${p}image
╚══════════════════╝

╔══[ 😂 *FUN* ]══╗
│ ${p}fact │ ${p}jokes │ ${p}quotes
│ ${p}trivia │ ${p}truth │ ${p}dare
│ ${p}truthordare
╚══════════════════╝

╔══[ 🎮 *GAMES* ]══╗
│ ${p}dare │ ${p}truth │ ${p}truthordare
╚══════════════════╝

╔══[ 👥 *GROUP* ]══╗
│ ${p}kick │ ${p}promote │ ${p}demote │ ${p}add
│ ${p}invite │ ${p}open │ ${p}close │ ${p}poll
│ ${p}tagall │ ${p}hidetag │ ${p}kickall
│ ${p}setgroupname │ ${p}setdesc
╚══════════════════╝

╔══[ ⚙️ *OTHER* ]══╗
│ ${p}botstatus │ ${p}ping │ ${p}runtime
│ ${p}time │ ${p}repo │ ${p}disk │ ${p}pair
╚══════════════════╝

╔══[ 👑 *OWNER* ]══╗
│ ${p}block │ ${p}unblock │ ${p}delete
│ ${p}warn │ ${p}join │ ${p}leave │ ${p}online
│ ${p}setbio │ ${p}setprefix │ ${p}restart
╚══════════════════╝

╔══[ 🔍 *SEARCH* ]══╗
│ ${p}weather │ ${p}define │ ${p}imdb
│ ${p}lyrics │ ${p}yts │ ${p}shazam
╚══════════════════╝

╔══[ ⚙️ *SETTINGS* ]══╗
│ ${p}getsettings │ ${p}anticall
│ ${p}chatbot │ ${p}autotype │ ${p}autoread
│ ${p}antidelete │ ${p}alwaysonline
│ ${p}mode │ ${p}setprefix │ ${p}setwelcome
╚══════════════════╝

╔══[ 🛠️ *TOOLS* ]══╗
│ ${p}calculate │ ${p}fancy │ ${p}fliptext
│ ${p}genpass │ ${p}qrcode │ ${p}tinyurl
│ ${p}say │ ${p}device │ ${p}getpp
│ ${p}sticker │ ${p}emojimix
│ ${p}vv _(reply to view-once to reveal)_
╚══════════════════╝

📞 *Support:* 0758891491
🔗 *wa.me/254758891491*`;
    await sock.sendMessage(replyTo, {
      text: menu,
      mentions: [ctx.senderJid],
    });
  },

  fact: cmd_fact,
  jokes: cmd_jokes,
  quotes: cmd_quotes,
  trivia: cmd_trivia,
  truth: cmd_truth,
  dare: cmd_dare,
  truthordare: cmd_truthordare,

  getsettings: cmd_getsettings,
  anticall: cmd_anticall,
  chatbot: cmd_chatbot,
  antibug: cmd_antibug,
  autotype: cmd_autotype,
  autoread: cmd_autoread,
  autoreact: cmd_autoreact,
  autoblock: cmd_autoblock,
  alwaysonline: cmd_alwaysonline,
  autobio: cmd_autobio,
  antisticker: cmd_antisticker,
  antiviewonce: cmd_antiviewonce,
  antidelete: cmd_antidelete,
  antiedit: cmd_antiedit,
  setbotname: cmd_setbotname,
  setwelcome: cmd_setwelcome,
  setfont: cmd_setfont,
  addbadword: cmd_addbadword,
  setwarn: cmd_setwarn,
  resetsetting: cmd_resetsetting,
  resetssettings: cmd_resetsetting,
  mode: cmd_mode,
  setprefix: cmd_setprefix,
  autoviewstatus: cmd_autoviewstatus,
  autoreactstatus: cmd_autoreactstatus,
  statusantidelete: cmd_statusantidelete,
  vv: cmd_vv,

  calculate: cmd_calculate,
  fancy: cmd_fancy,
  fliptext: cmd_fliptext,
  genpass: cmd_genpass,
  say: cmd_say,
  qrcode: cmd_qrcode,
  tinyurl: cmd_tinyurl,
  device: cmd_device,
  browse: cmd_browse,
  obfuscate: cmd_obfuscate,
  emojimix: cmd_emojimix,
  getabout: cmd_getabout,
  getpp: cmd_getpp,
  ssweb: cmd_ssweb,
  texttopdf: cmd_texttopdf,
  toimage: cmd_toimage,
  sticker: cmd_sticker,

  kick: cmd_kick,
  promote: cmd_promote,
  demote: cmd_demote,
  add: cmd_add,
  invite: cmd_invite,
  link: cmd_link,
  open: cmd_open,
  close: cmd_close,
  announcements: cmd_announcements,
  setgroupname: cmd_setgroupname,
  setdesc: cmd_setdesc,
  tagall: cmd_tagall,
  hidetag: cmd_hidetag,
  tag: cmd_tag,
  tagadmin: cmd_tagadmin,
  totalmembers: cmd_totalmembers,
  kickall: cmd_kickall,
  poll: cmd_poll,
  allow: cmd_allow,
  addcode: cmd_addcode,
  antibadword: cmd_antibadword,
  antibot: cmd_antibot,
  antilink: cmd_antilink,
  welcome: cmd_welcome,

  block: cmd_block,
  unblock: cmd_unblock,
  delete: cmd_delete,
  deljunk: cmd_deljunk,
  join: cmd_join,
  leave: cmd_leave,
  online: cmd_online,
  lastseen: cmd_lastseen,
  setbio: cmd_setbio,
  setprofilepic: cmd_setprofilepic,
  react: cmd_react,
  warn: cmd_warn,
  readreceipts: cmd_readreceipts,
  restart: cmd_restart,
  autosavestatus: cmd_autosavestatus,

  weather: cmd_weather,
  define: cmd_define,
  define2: cmd_define2,
  imdb: cmd_imdb,
  lyrics: cmd_lyrics,
  shazam: cmd_shazam,
  yts: cmd_yts,

  gpt: cmd_gpt,
  gemini: cmd_gemini,
  blackbox: cmd_blackbox,
  deepseek: cmd_deepseek,
  code: cmd_code,
  programming: cmd_programming,
  analyze: cmd_analyze,
  summarize: cmd_summarize,
  translate2: cmd_translate2,
  translate: cmd_translate,
  recipe: cmd_recipe,
  story: cmd_story,
  teach: cmd_teach,
  generate: cmd_generate,
  doppleai: cmd_doppleai,
  dalle: cmd_dalle,

  tiktok: cmd_tiktok,
  tiktokaudio: cmd_tiktokaudio,
  twitter: cmd_twitter,
  instagram: cmd_instagram,
  facebook: cmd_facebook,
  youtube: cmd_youtube,
  song: cmd_song,
  song2: cmd_song2,
  video: cmd_video,
  videodoc: cmd_videodoc,
  xvideos: cmd_xvideos,
  apk: cmd_apk,
  mediafire: cmd_mediafire,
  gdrive: cmd_gdrive,
  gitclone: cmd_gitclone,
  pin: cmd_pin,
  image: cmd_image,
  itunes: cmd_itunes,
  savestatus: cmd_savestatus,
  download: cmd_download,
  tomp3: cmd_tomp3,
  toptt: cmd_toptt,
  bass: cmd_bass,
  earrape: cmd_earrape,
  reverse: cmd_reverse,
  robot: cmd_robot,
  deep: cmd_deep,
  blown: cmd_blown,
  volaudio: cmd_volaudio,
  toaudio: cmd_toaudio,
  tovideo: cmd_tovideo,
  volvideo: cmd_volvideo,
};

export async function handleCommand(ctx: CommandContext): Promise<boolean> {
  const handler = COMMAND_MAP[ctx.command.toLowerCase()];
  if (!handler) return false;
  try {
    await handler(ctx);
  } catch (err: any) {
    try {
      await ctx.sock.sendMessage(ctx.replyTo, {
        text: `❌ Command error: ${err?.message || "Unknown error"}`,
      });
    } catch {}
  }
  return true;
}

export { COMMAND_MAP };
