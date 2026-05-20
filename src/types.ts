export interface CustomCardData {
  partnerName: string;
  senderName: string;
  vibe: string;
  prompt: string;
  languageRatio: string;
  theme: keyof typeof THEME_PRESETS;
  customLyrics?: string;
  customNote?: string;
}

export const THEME_PRESETS = {
  midnight: {
    id: "midnight",
    name: "Midnight Moon",
    bg: "bg-radial from-slate-900 via-purple-950 to-black text-purple-100",
    cardBg: "bg-slate-900/80 border-purple-500/30 backdrop-blur-md",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10 border-purple-500/20",
    button: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20",
    textMuted: "text-purple-300/70",
    starColor: "rgba(168, 85, 247, 0.4)",
    heartColor: "#a855f7",
  },
  sunset: {
    id: "sunset",
    name: "Rose Petal Sunset",
    bg: "bg-gradient-to-br from-amber-950 via-rose-950 to-stone-950 text-rose-100",
    cardBg: "bg-rose-950/40 border-rose-500/30 backdrop-blur-md",
    accent: "text-rose-400",
    accentBg: "bg-rose-500/10 border-rose-500/20",
    button: "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg shadow-rose-500/20",
    textMuted: "text-rose-300/70",
    starColor: "rgba(244, 63, 94, 0.4)",
    heartColor: "#f43f5e",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Velvet",
    bg: "bg-gradient-to-tr from-stone-950 via-emerald-950 to-neutral-900 text-emerald-100",
    cardBg: "bg-emerald-950/30 border-emerald-500/30 backdrop-blur-md",
    accent: "text-emerald-400",
    accentBg: "bg-emerald-500/10 border-emerald-500/20",
    button: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20",
    textMuted: "text-emerald-300/70",
    starColor: "rgba(16, 185, 129, 0.4)",
    heartColor: "#10b981",
  },
  stardust: {
    id: "stardust",
    name: "Cosmic Stardust",
    bg: "bg-radial from-slate-950 via-zinc-900 to-neutral-950 text-zinc-100",
    cardBg: "bg-zinc-900/60 border-zinc-700/50 backdrop-blur-md",
    accent: "text-amber-400",
    accentBg: "bg-amber-400/5 border-amber-400/20",
    button: "bg-gradient-to-r from-zinc-700 to-amber-600 hover:from-zinc-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/10",
    textMuted: "text-zinc-400",
    starColor: "rgba(253, 224, 71, 0.3)",
    heartColor: "#fbbf24",
  },
};

export interface SongLyricLine {
  text: string;
  translation: string;
  section: "Verse 1" | "Pre-Chorus" | "Chorus" | "Verse 2" | "Bridge" | "Final Chorus";
}

export const ORIGINAL_LYRICS: SongLyricLine[] = [
  // Verse 1
  {
    text: "Since umunsi nakubonye girl",
    translation: "Since the day I laid eyes on you, girl",
    section: "Verse 1"
  },
  {
    text: "Heart yanjye ntiyongera kuba normal",
    translation: "My heart has never returned to normal again",
    section: "Verse 1"
  },
  {
    text: "Iyo useka mbona heaven close",
    translation: "When you smile, I feel like heaven is close by",
    section: "Verse 1"
  },
  {
    text: "Baby you the one I chose",
    translation: "Baby, you are the one I chose",
    section: "Verse 1"
  },
  {
    text: "N’abandi bose baragerageje",
    translation: "All others also tried their best",
    section: "Verse 1"
  },
  {
    text: "Ariko wowe wonyine urandembeje",
    translation: "But you, and you alone, have overfilled my soul with love",
    section: "Verse 1"
  },
  {
    text: "Iyo turi kumwe time irahagarara",
    translation: "When we are together, time completely stands still",
    section: "Verse 1"
  },
  {
    text: "Ndagukunda birenze amagambo yara",
    translation: "I love you beyond words already spoken",
    section: "Verse 1"
  },

  // Pre-Chorus
  {
    text: "Hold me closer tonight",
    translation: "Hold me closer tonight",
    section: "Pre-Chorus"
  },
  {
    text: "Ntuzigere unta baby",
    translation: "Don't ever let go of me, baby",
    section: "Pre-Chorus"
  },
  {
    text: "You’re my peace, my light",
    translation: "You're my peace, my light",
    section: "Pre-Chorus"
  },
  {
    text: "Forever you and I",
    translation: "Forever you and I",
    section: "Pre-Chorus"
  },

  // Chorus
  {
    text: "Only you, only you",
    translation: "Only you, only you",
    section: "Chorus"
  },
  {
    text: "Ni wowe umutima ushaka boo",
    translation: "You are the only one that my heart desires, sweetheart",
    section: "Chorus"
  },
  {
    text: "Everyday nkiri kumwe nawe",
    translation: "Every single day that I am here with you",
    section: "Chorus"
  },
  {
    text: "Numva life iba brand new",
    translation: "I feel like life becomes completely brand new",
    section: "Chorus"
  },
  {
    text: "Only you, only you",
    translation: "Only you, only you",
    section: "Chorus"
  },
  {
    text: "Sinshaka undi muntu",
    translation: "I don't want any other person",
    section: "Chorus"
  },
  {
    text: "Baby ndahiye imbere y’ukwezi",
    translation: "Baby, I swear right in front of the moon",
    section: "Chorus"
  },
  {
    text: "Nzagukunda forever true",
    translation: "I will love you forever, faithful and true",
    section: "Chorus"
  },

  // Verse 2
  {
    text: "Late night calls till morning",
    translation: "Late night phone calls going till the morning light",
    section: "Verse 2"
  },
  {
    text: "Talking bout our future story",
    translation: "Talking all about our future love story",
    section: "Verse 2"
  },
  {
    text: "Niyo world yadutandukanya",
    translation: "Even if the entire world were to drift us apart",
    section: "Verse 2"
  },
  {
    text: "Nzaguhora iruhande ntabwo njya",
    translation: "I will always stand right by your side, I'm never leaving",
    section: "Verse 2"
  },
  {
    text: "You my melody, my sound",
    translation: "You are my sweet melody, my beautiful sound",
    section: "Verse 2"
  },
  {
    text: "Iyo uri hafi sinjya down",
    translation: "Whenever you are near me, I never feel down",
    section: "Verse 2"
  },
  {
    text: "Nifuza ko twakomezanya",
    translation: "I deeply wish we could stay together forever",
    section: "Verse 2"
  },
  {
    text: "No more pain, just love forever",
    translation: "No more sorrow, only pure love forever",
    section: "Verse 2"
  },

  // Bridge
  {
    text: "Baby don’t leave me lonely",
    translation: "Baby, please don't leave me all alone",
    section: "Bridge"
  },
  {
    text: "You’re the one that knows me",
    translation: "You are the only one who truly knows me inside out",
    section: "Bridge"
  },
  {
    text: "Even in the dark times",
    translation: "Even during the darkest, hardest times",
    section: "Bridge"
  },
  {
    text: "You still make me shine",
    translation: "You still somehow make me shine bright",
    section: "Bridge"
  },

  // Final Chorus
  {
    text: "Only you, only you",
    translation: "Only you, only you",
    section: "Final Chorus"
  },
  {
    text: "Ni wowe umutima ushaka boo",
    translation: "You are the only one that my heart desires, sweetheart",
    section: "Final Chorus"
  },
  {
    text: "Everyday nkiri kumwe nawe",
    translation: "Every single day that I am here with you",
    section: "Final Chorus"
  },
  {
    text: "Numva life iba brand new",
    translation: "I feel like life becomes completely brand new",
    section: "Final Chorus"
  },
  {
    text: "Only you, only you",
    translation: "Only you, only you",
    section: "Final Chorus"
  },
  {
    text: "My forever person true",
    translation: "My true, forever person",
    section: "Final Chorus"
  },
  {
    text: "Nzagukunda kugeza imperuka",
    translation: "I will love you until the end of the age",
    section: "Final Chorus"
  },
  {
    text: "Baby it’s always you 🎶",
    translation: "Baby, it is always you 🎶",
    section: "Final Chorus"
  }
];
