import { CommandContext } from "./types";

const FACTS = [
  "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are technically berries, but strawberries are not.",
  "Octopuses have three hearts, nine brains, and blue blood.",
  "The Eiffel Tower can grow by 6 inches in summer due to thermal expansion.",
  "A group of flamingos is called a flamboyance.",
  "Sharks are older than trees. They've been around for at least 400 million years.",
  "The human brain is about 60% fat.",
  "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
  "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
  "The word 'muscle' comes from the Latin word for 'little mouse'.",
  "Wombats produce cube-shaped droppings — the only known animal to do so.",
  "A snail can sleep for 3 years.",
  "The fingerprints of koalas are virtually identical to those of humans.",
  "Crows can recognize and remember human faces.",
  "There are more possible chess games than atoms in the observable universe.",
  "Elephants are the only animals that can't jump.",
  "A group of crows is called a murder.",
  "The shortest war in history lasted 38 to 45 minutes — the Anglo-Zanzibar War of 1896.",
  "The average person walks 100,000 miles in their lifetime.",
  "Butterflies taste with their feet.",
  "A flea can jump 350 times its body length — like a human jumping the length of a football field.",
  "There are more stars in the universe than grains of sand on Earth.",
  "The tongue of a blue whale weighs as much as an elephant.",
  "Male seahorses are the ones who get pregnant and give birth.",
];

const JOKES = [
  "Why don't scientists trust atoms?\nBecause they make up everything! 😂",
  "I told my wife she should embrace her mistakes.\nShe gave me a hug. 🤗",
  "Why don't eggs tell jokes?\nThey'd crack each other up. 🥚",
  "I'm reading a book about anti-gravity.\nIt's impossible to put down! 📚",
  "Did you hear about the mathematician who's afraid of negative numbers?\nHe'll stop at nothing to avoid them! 🔢",
  "Why did the scarecrow win an award?\nBecause he was outstanding in his field! 🌾",
  "I used to play piano by ear, but now I use my hands. 🎹",
  "Why can't you give Elsa a balloon?\nBecause she'll let it go! 🎈",
  "What do you call fake spaghetti?\nAn impasta! 🍝",
  "Why did the bicycle fall over?\nBecause it was two-tired! 🚲",
  "What do you call cheese that isn't yours?\nNacho cheese! 🧀",
  "Why can't a nose be 12 inches long?\nBecause then it would be a foot! 👃",
  "I told a joke about construction. I'm still working on it. 🏗️",
  "What do you call a sleeping dinosaur?\nA dino-snore! 🦕",
  "Why did the math book look so sad?\nIt had too many problems! 📖",
  "What do you call a fish without eyes?\nA fsh! 🐟",
  "How do you organize a space party?\nYou planet! 🪐",
  "Why did the golfer bring extra pants?\nIn case he got a hole in one! ⛳",
  "What's orange and sounds like a parrot?\nA carrot! 🥕",
  "I tried to make a chemistry joke but I knew I wouldn't get a reaction! ⚗️",
];

const QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "In the middle of every difficulty lies opportunity. — Albert Einstein",
  "It does not matter how slowly you go as long as you do not stop. — Confucius",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "You miss 100% of the shots you don't take. — Wayne Gretzky",
  "Whether you think you can or you think you can't, you're right. — Henry Ford",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "An unexamined life is not worth living. — Socrates",
  "Strive not to be a success, but rather to be of value. — Albert Einstein",
  "Two roads diverged in a wood, and I took the one less traveled by. — Robert Frost",
  "The way to get started is to quit talking and begin doing. — Walt Disney",
  "Innovation distinguishes between a leader and a follower. — Steve Jobs",
  "Your time is limited, so don't waste it living someone else's life. — Steve Jobs",
  "The only impossible journey is the one you never begin. — Tony Robbins",
  "In the end, it's not the years in your life that count, it's the life in your years. — Abraham Lincoln",
  "Life is either a daring adventure or nothing at all. — Helen Keller",
  "He who has a why to live can bear almost any how. — Friedrich Nietzsche",
];

const TRIVIA = [
  { q: "What is the capital of Kenya?", a: "Nairobi" },
  { q: "How many bones are in the adult human body?", a: "206" },
  { q: "Which planet is known as the Red Planet?", a: "Mars" },
  { q: "What is the chemical symbol for gold?", a: "Au" },
  { q: "In what year did World War II end?", a: "1945" },
  { q: "What is the largest ocean on Earth?", a: "The Pacific Ocean" },
  { q: "Who painted the Mona Lisa?", a: "Leonardo da Vinci" },
  { q: "What is the smallest prime number?", a: "2" },
  { q: "How many sides does a hexagon have?", a: "6" },
  { q: "What gas do plants absorb from the atmosphere?", a: "Carbon dioxide (CO2)" },
  { q: "What is the hardest natural substance on Earth?", a: "Diamond" },
  { q: "Which country is the largest by land area?", a: "Russia" },
  { q: "What is the speed of light approximately?", a: "299,792 km/s" },
  { q: "What organ pumps blood around the human body?", a: "The heart" },
  { q: "Who wrote the play Romeo and Juliet?", a: "William Shakespeare" },
  { q: "What is the longest river in the world?", a: "The Nile" },
  { q: "What currency does Kenya use?", a: "Kenyan Shilling (KSh)" },
  { q: "How many continents are there on Earth?", a: "7" },
];

const TRUTHS = [
  "What is your biggest regret in life?",
  "Have you ever lied to a close friend?",
  "What is the most embarrassing thing you've done?",
  "Who in this chat do you find most attractive?",
  "Have you ever cheated on a test or exam?",
  "What is your biggest fear?",
  "Have you ever cried because of a movie?",
  "What is the most childish thing you still do?",
  "Have you ever stolen something?",
  "What is the worst gift you ever received?",
  "Have you ever pretended to be sick to avoid something?",
  "What is your biggest pet peeve?",
  "Have you ever read someone else's messages without their permission?",
  "What is something you've done that you're not proud of?",
  "Have you ever had a crush on a teacher?",
];

const DARES = [
  "Send a voice message singing 'Happy Birthday'.",
  "Change your WhatsApp status to 'I smell like cheese' for 30 minutes.",
  "Send a screenshot of your most recent Google search.",
  "Type a message entirely in emojis.",
  "Send a selfie with the most ridiculous face you can make.",
  "Write a poem about the last person you texted.",
  "Send the 10th photo in your gallery.",
  "Do 10 push-ups right now.",
  "Change your WhatsApp name to 'Bot Master' for 1 hour.",
  "Send a voice message saying 'I am a robot, beep boop'.",
  "Share something you've never told anyone in this chat.",
  "Send a funny GIF that describes your personality.",
  "Describe yourself in 3 emojis only.",
  "Send the first contact in your phonebook the message 'You're awesome!'.",
  "Record a 10-second video of your surroundings.",
];

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function cmd_fact(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `💡 *Random Fact*\n\n${random(FACTS)}`,
  });
}

export async function cmd_jokes(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `😂 *Joke of the Moment*\n\n${random(JOKES)}`,
  });
}

export async function cmd_quotes(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `✨ *Inspirational Quote*\n\n_"${random(QUOTES)}"_`,
  });
}

export async function cmd_trivia(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  const t = random(TRIVIA);
  await sock.sendMessage(replyTo, {
    text: `🧠 *Trivia Time!*\n\n❓ *Question:* ${t.q}\n\n_(Reply with your answer — reveal: spoiler || ${t.a} ||)_`,
  });
}

export async function cmd_truth(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🔮 *Truth Question*\n\n❓ ${random(TRUTHS)}\n\n_You must answer truthfully!_`,
  });
}

export async function cmd_dare(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  await sock.sendMessage(replyTo, {
    text: `🎭 *Dare Challenge*\n\n🎯 ${random(DARES)}\n\n_You must complete this dare!_`,
  });
}

export async function cmd_truthordare(ctx: CommandContext) {
  const { sock, replyTo } = ctx;
  const isTruth = Math.random() < 0.5;
  if (isTruth) {
    await sock.sendMessage(replyTo, {
      text: `🎲 *Truth or Dare?* — You got: *TRUTH!*\n\n❓ ${random(TRUTHS)}\n\n_You must answer honestly!_`,
    });
  } else {
    await sock.sendMessage(replyTo, {
      text: `🎲 *Truth or Dare?* — You got: *DARE!*\n\n🎯 ${random(DARES)}\n\n_Complete it or face the consequences!_`,
    });
  }
}
