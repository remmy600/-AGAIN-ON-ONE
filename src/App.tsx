/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Sparkles,
  Heart,
  Share2,
  Copy,
  Music,
  Languages,
  Check,
  Send,
  Sliders,
  Volume2,
  BookOpen,
  HeartHandshake,
  RotateCcw,
  VolumeX,
} from "lucide-react";

import { ORIGINAL_LYRICS, THEME_PRESETS, SongLyricLine, CustomCardData } from "./types";
import { startMusicHarmony, stopMusicHarmony } from "./utils/audio";
import { encodeCardData, decodeCardData } from "./utils/share";

// Animated HTML Canvas that renders drifting stardust and warm glowing hearts
function HeartParticleCanvas({ isPlaying, heartColor }: { isPlaying: boolean; heartColor: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Star and heart particle collections
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      fadeSpeed: number;
      isHeart: boolean;
      angle: number;
      spinSpeed: number;
    }> = [];

    const createParticle = (isInitial = false) => ({
      x: Math.random() * width,
      y: isInitial ? Math.random() * height : height + 10,
      size: Math.random() * (isInitial ? 8 : 12) + 2,
      speedY: -(Math.random() * 0.6 + 0.2) * (isPlaying ? 1.6 : 1.0),
      speedX: (Math.random() - 0.5) * 0.3 * (isPlaying ? 1.5 : 1.0),
      opacity: Math.random() * 0.6 + 0.2,
      fadeSpeed: Math.random() * 0.002 + 0.001,
      isHeart: Math.random() > 0.7,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.02,
    });

    // Populate initial particles
    for (let i = 0; i < 35; i++) {
      particles.push(createParticle(true));
    }

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number, color: string) => {
      c.save();
      c.beginPath();
      c.translate(x, y);
      c.globalAlpha = opacity;
      c.fillStyle = color;
      
      // Traditional romantic vector path
      c.moveTo(0, -size / 4);
      c.bezierCurveTo(-size / 2, -size, -size, -size / 3, -size, size / 8);
      c.bezierCurveTo(-size, size / 2, -size / 4, size * 0.8, 0, size);
      c.bezierCurveTo(size / 4, size * 0.8, size, size / 2, size, size / 8);
      c.bezierCurveTo(size, -size / 3, size / 2, -size, 0, -size / 4);
      
      c.fill();
      c.restore();
    };

    const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, size: number, opacity: number) => {
      c.save();
      c.beginPath();
      c.arc(x, y, size / 2, 0, Math.PI * 2);
      c.fillStyle = "rgba(255, 255, 255, " + opacity + ")";
      c.shadowColor = "white";
      c.shadowBlur = isPlaying ? 8 : 3;
      c.fill();
      c.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render & update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.spinSpeed;

        if (p.y < -20 || p.x < -20 || p.x > width + 20) {
          particles[i] = createParticle(false);
          continue;
        }

        if (p.isHeart) {
          drawHeart(ctx, p.x, p.y, p.size, p.opacity, heartColor);
        } else {
          drawStar(ctx, p.x, p.y, p.size, p.opacity);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, heartColor]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 rounded-3xl" id="romantic-canvas" />;
}

export default function App() {
  // Lyric Timing Configuration
  const LINE_DURATION_SECONDS = 4.5;

  // Global settings states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [activeTheme, setActiveTheme] = useState<keyof typeof THEME_PRESETS>("midnight");

  // Selection view mode
  const [lyricsSource, setLyricsSource] = useState<"original" | "custom">("original");

  // Custom visual navigation tabs
  const [selectedNavbarTab, setSelectedNavbarTab] = useState<"lyrics" | "love_note" | "generator">("lyrics");

  // Floating messages
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Love Note Generator State
  const [notePartner, setNotePartner] = useState<string>("");
  const [noteSender, setNoteSender] = useState<string>("");
  const [noteVibe, setNoteVibe] = useState<string>("Under the Moonlit Skies of Kigali");
  const [noteQuote, setNoteQuote] = useState<string>("Ni wowe umutima ushaka boo");
  const [isGeneratingNote, setIsGeneratingNote] = useState<boolean>(false);
  const [generatedNoteText, setGeneratedNoteText] = useState<string>("");

  // Custom Duet Songwriter Generator State
  const [lyricsPartner, setLyricsPartner] = useState<string>("");
  const [lyricsSender, setLyricsSender] = useState<string>("");
  const [lyricsVibe, setLyricsVibe] = useState<string>("Smooth Acoustic Afro-R&B Fusion");
  const [lyricsPrompt, setLyricsPrompt] = useState<string>("sharing tea, cozy cold rain, and locking eyes");
  const [languageRatio, setLanguageRatio] = useState<string>("Equalparts Kinyarwanda & English");
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState<boolean>(false);
  const [generatedLyricsText, setGeneratedLyricsText] = useState<string>("");

  // Shared Card Import Details
  const [sharedCardData, setSharedCardData] = useState<CustomCardData | null>(null);
  const [isSharedGiftMode, setIsSharedGiftMode] = useState<boolean>(false);

  // Fake static track progression simulation variables
  const [fakeTrackTimer, setFakeTrackTimer] = useState<number>(74); // Starts at 01:14
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const themeConfig = THEME_PRESETS[activeTheme] || THEME_PRESETS.midnight;

  // Process search params for Shared Card loading
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cardParam = params.get("card");
    if (cardParam) {
      const decoded = decodeCardData(cardParam);
      if (decoded) {
        setSharedCardData(decoded);
        setIsSharedGiftMode(true);
        if (decoded.theme in THEME_PRESETS) {
          setActiveTheme(decoded.theme);
        }
        if (decoded.customLyrics) {
          setGeneratedLyricsText(decoded.customLyrics);
          setLyricsSource("custom");
        }
        if (decoded.customNote) {
          setGeneratedNoteText(decoded.customNote);
          setSelectedNavbarTab("love_note");
        }
        if (decoded.partnerName) {
          setNotePartner(decoded.partnerName);
          setLyricsPartner(decoded.partnerName);
        }
        if (decoded.senderName) {
          setNoteSender(decoded.senderName);
          setLyricsSender(decoded.senderName);
        }
      }
    }
  }, []);

  // Format progress time dynamically helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Convert custom raw string to list
  const customLyricsLines = useMemo<SongLyricLine[]>(() => {
    if (!generatedLyricsText) return [];
    
    const lines = generatedLyricsText.split("\n");
    let currentSection: SongLyricLine["section"] = "Verse 1";
    const parsed: SongLyricLine[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        const secName = trimmed.replace("[", "").replace("]", "");
        if (secName.toLowerCase().includes("chorus")) {
          currentSection = "Chorus";
        } else if (secName.toLowerCase().includes("pre")) {
          currentSection = "Pre-Chorus";
        } else if (secName.toLowerCase().includes("bridge")) {
          currentSection = "Bridge";
        } else if (secName.toLowerCase().includes("2")) {
          currentSection = "Verse 2";
        } else {
          currentSection = "Verse 1";
        }
      } else {
        parsed.push({
          text: trimmed,
          translation: "(AI Personalized melody lines)",
          section: currentSection
        });
      }
    });

    return parsed.length > 0 ? parsed : [
      { text: "No custom lyrics loaded yet.", translation: "Generate yours using the settings!", section: "Verse 1" }
    ];
  }, [generatedLyricsText]);

  const activeLyricsList = lyricsSource === "original" ? ORIGINAL_LYRICS : customLyricsLines;

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSkipPrev = () => {
    setCurrentLineIndex((prev) => (prev > 0 ? prev - 1 : activeLyricsList.length - 1));
  };

  const handleSkipNext = () => {
    setCurrentLineIndex((prev) => (prev < activeLyricsList.length - 1 ? prev + 1 : 0));
  };


  // Sync Timer for lyric player and simulated progress duration
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        // Increment fake timer representation
        setFakeTrackTimer((prev) => {
          if (prev >= 222) return 0; // wrap at 03:42 limits
          return prev + 1;
        });

        // Rotate index sync matching line
        setCurrentLineIndex((prev) => {
          const linesLimit = activeLyricsList.length;
          if (prev >= linesLimit - 1) {
            return 0; // wrap around smoothly
          }
          return prev + 1;
        });
      }, LINE_DURATION_SECONDS * 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeLyricsList]);

  // Audio synch trigger hook
  useEffect(() => {
    if (isPlaying && soundEnabled) {
      startMusicHarmony();
    } else {
      stopMusicHarmony();
    }
    return () => {
      stopMusicHarmony();
    };
  }, [isPlaying, soundEnabled]);

  // Scroll active lyrics line into focus inside the container
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeElement = container.querySelector(`[data-lyric-index="${currentLineIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentLineIndex]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Generate customized Duet Love song lines using server side API
  const handleGenerateLyrics = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingLyrics(true);
    try {
      const res = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lyricsPrompt,
          vibe: lyricsVibe,
          partnerName: lyricsPartner,
          senderName: lyricsSender,
          languageRatio: languageRatio,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setGeneratedLyricsText(data.text);
        setLyricsSource("custom");
        setCurrentLineIndex(0);
        setSelectedNavbarTab("lyrics");
        showToast("✨ AI Custom Duet successfully composed!");
      } else {
        throw new Error(data.error || "Generation query returned empty.");
      }
    } catch (error: any) {
      console.error(error);
      showToast(`⚠️ API Failure: ${error.message}`);
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  // Generate customized Letter with Gemini server-side
  const handleGenerateLoveLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingNote(true);
    try {
      const res = await fetch("/api/generate-lovenote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerName: notePartner,
          senderName: noteSender,
          favoriteLyricQuote: noteQuote,
          customVibe: noteVibe,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setGeneratedNoteText(data.text);
        setSelectedNavbarTab("love_note");
        showToast("💌 Love letter successfully sealed!");
      } else {
        throw new Error(data.error || "Letter query returned empty.");
      }
    } catch (e: any) {
      console.error(e);
      showToast(`⚠️ Could not generate letter: ${e.message}`);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  // Copy unique URL key to share
  const handleShareCard = () => {
    const dataPayload: CustomCardData = {
      partnerName: notePartner || lyricsPartner || "Beloved One",
      senderName: noteSender || lyricsSender || "Your Secret Admirer",
      vibe: lyricsVibe || noteVibe,
      prompt: lyricsPrompt,
      languageRatio: languageRatio,
      theme: activeTheme,
      customLyrics: generatedLyricsText || undefined,
      customNote: generatedNoteText || undefined,
    };

    const hash = encodeCardData(dataPayload);
    const origin = window.location.origin + window.location.pathname;
    const shareUrl = `${origin}?card=${hash}`;

    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showToast("🌌 Personal gift card link copied! Send it in chats!");
      },
      () => {
        showToast("⚠️ Could not write link to clipboard.");
      }
    );
  };

  return (
    <div
      id="root-container"
      className={`min-h-screen w-full font-sans transition-all duration-350 text-white overflow-hidden relative flex flex-col justify-between ${themeConfig.bg}`}
    >
      {/* Background soft glowing blur spheres - Match Frosted Glass exact spec */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-rose-900/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Interactive toast notice */}
      {toastMessage && (
        <div id="toast-wrapper" className="fixed top-20 right-6 z-50">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 text-white rounded-2xl py-3 px-5 shadow-2xl flex items-center gap-2">
            <span className="text-pink-400">✨</span>
            <span className="text-xs font-bold font-mono tracking-wide">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <nav id="top-navbar" className="h-16 px-10 flex items-center justify-between border-b border-white/10 backdrop-blur-md z-30 shrink-0 relative">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center">
            <span className="text-lg select-none">💖</span>
          </div>
          <div>
            <span className="font-black text-xl tracking-tighter uppercase text-white">
              {lyricsPartner ? `${lyricsPartner}` : "ONLY YOU"}
            </span>
            <span className="text-[10px] font-mono tracking-widest opacity-40 ml-2 uppercase">Studio</span>
          </div>
        </div>

        {/* Desktop Custom selectors navigation pills */}
        <div className="flex gap-8 text-xs font-bold uppercase tracking-[0.2em] opacity-80 max-md:hidden">
          <button
            onClick={() => setSelectedNavbarTab("lyrics")}
            className={`cursor-pointer transition-all ${selectedNavbarTab === "lyrics" ? "text-pink-400 font-extrabold" : "hover:text-pink-200"}`}
          >
            Visualizer
          </button>
          <button
            onClick={() => setSelectedNavbarTab("love_note")}
            className={`cursor-pointer transition-all ${selectedNavbarTab === "love_note" ? "text-pink-400 font-extrabold" : "hover:text-pink-200"}`}
          >
            Romantic Note
          </button>
          <button
            onClick={() => setSelectedNavbarTab("generator")}
            className={`cursor-pointer transition-all ${selectedNavbarTab === "generator" ? "text-pink-400 font-extrabold" : "hover:text-pink-200"}`}
          >
            AI Duet Writer
          </button>
        </div>

        {/* Theme customization circles */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-full">
          {isSharedGiftMode && (
            <span className="text-[9px] font-mono bg-pink-500/20 text-pink-300 font-bold px-2 py-0.5 rounded-full border border-pink-500/20 mr-1 animate-pulse">
              🎁 GIFT ACTIVE
            </span>
          )}

          {(Object.keys(THEME_PRESETS) as Array<keyof typeof THEME_PRESETS>).map((tId) => (
            <button
              key={tId}
              onClick={() => {
                setActiveTheme(tId);
                showToast(`Preset: ${THEME_PRESETS[tId].name}`);
              }}
              title={THEME_PRESETS[tId].name}
              className={`w-4 h-4 rounded-full border transition-all ${
                activeTheme === tId ? "border-white scale-110" : "border-white/10 hover:border-white/40"
              }`}
              style={{
                background:
                  tId === "midnight"
                    ? "linear-gradient(135deg, #4c1d95, #000)"
                    : tId === "sunset"
                    ? "linear-gradient(135deg, #9f1239, #d97706)"
                    : tId === "emerald"
                    ? "linear-gradient(135deg, #064e3b, #000)"
                    : "linear-gradient(135deg, #27272a, #d97706)",
              }}
            />
          ))}
        </div>
      </nav>

      {/* Main Core Section */}
      <main id="main-frame" className="flex-1 flex px-10 py-8 gap-10 overflow-hidden relative">
        
        {/* Left Side column: Album Art Panel */}
        <div id="side-column" className="w-1/3 flex flex-col justify-center space-y-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-indigo-600 blur-3xl opacity-20" />
            
            <div className="aspect-square w-full bg-neutral-900 rounded-[40px] border border-white/20 relative overflow-hidden flex items-center justify-center shadow-2xl">
              {/* Particle layers */}
              <HeartParticleCanvas isPlaying={isPlaying} heartColor={themeConfig.heartColor} />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
              <div className="text-[140px] drop-shadow-2xl select-none z-0 transform hover:scale-110 transition-transform duration-500">🎶</div>
              
              <div className="absolute bottom-8 left-8 right-8 z-20 text-left">
                <div id="badge-acoustic" className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-1">
                  {lyricsSource === "original" ? "Trending Now • Rwandan Pop" : "AI Custom Duet"}
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {lyricsSource === "original" ? "Only You" : "Custom Melody"}
                </h2>
                <p id="author-label" className="text-lg opacity-70">
                  {lyricsSource === "original" ? "Ariel Wayz ft. B-Threy" : `Tuned for ${lyricsPartner || "Love Note"}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 px-4">
            <button
              onClick={handleTogglePlay}
              className="flex-1 py-4 bg-white hover:bg-pink-100 text-black font-black text-sm uppercase tracking-widest rounded-2xl cursor-pointer transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "Pause track" : "Listen Now"}</span>
            </button>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? "Muted experimental synth melody" : "Enabled beautiful synthesizer harmony!");
              }}
              className={`w-14 h-14 border rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                soundEnabled ? "border-pink-500/40 bg-pink-500/10 text-pink-400" : "border-white/20 bg-white/5 text-white/60 hover:text-white"
              }`}
              title="Toggle Web Audio Synths"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 pointer-events-none" /> : <VolumeX className="w-5 h-5 pointer-events-none" />}
            </button>
          </div>
        </div>

        {/* Right Glass Frame: Multi-Tab Interactive Center Panel (Lyrics vs Love Note Form vs AI Songsmith) */}
        <div id="interactive-container" className="flex-1 h-full bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[40px] p-10 flex flex-col relative overflow-hidden">
          
          {/* Header description */}
          <div className="flex items-center justify-between mb-8 select-none">
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-pink-500 mb-1">
                {selectedNavbarTab === "lyrics" ? "Synchronized Lyrics" : selectedNavbarTab === "love_note" ? "Deep Romantic Letter" : "Kinyarwanda Songbuilder"}
              </h3>
              <p className="text-sm opacity-40 italic">
                {selectedNavbarTab === "lyrics" && "VERSE 1 • PRE-CHORUS • CHORUS • BRIDGE"}
                {selectedNavbarTab === "love_note" && "SECURED EMBEDDED POETIC DECLARATIONS"}
                {selectedNavbarTab === "generator" && "TAILOR THEME LYRIC PAIRINGS IN SECONDS"}
              </p>
            </div>

            {/* Config Badges */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setShowTranslation(!showTranslation);
                  showToast(showTranslation ? "Subtitles Hidden" : "Translations Visible");
                }}
                className={`text-[10px] font-mono px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showTranslation ? "bg-pink-500/20 text-pink-300 border-pink-500/30" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Subtitles: {showTranslation ? "ON" : "OFF"}</span>
              </button>
              
              <button
                onClick={handleShareCard}
                className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Gift</span>
              </button>
            </div>
          </div>

          {/* ACTIVE CONTENT AREA */}
          <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar select-text text-left">
            
            {/* TAB 1: SYNCHRONIZED LYRICS PLAYER */}
            {selectedNavbarTab === "lyrics" && (
              <div
                ref={scrollContainerRef}
                id="lyric-scroll-container"
                className="space-y-12 pb-12"
              >
                {activeLyricsList.map((line, idx) => {
                  const isLineSelected = currentLineIndex === idx;
                  const isCh = line.section === "Chorus" || line.section === "Final Chorus";

                  let blockLabel = "";
                  if (idx === 0 || activeLyricsList[idx - 1]?.section !== line.section) {
                    blockLabel = line.section;
                  }

                  return (
                    <div key={idx} className="space-y-2">
                      {blockLabel && (
                        <div className="text-[10px] font-mono tracking-widest opacity-30 font-black uppercase mb-4 mt-8 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                          <span>{blockLabel}</span>
                        </div>
                      )}

                      <div
                        data-lyric-index={idx}
                        onClick={() => {
                          setCurrentLineIndex(idx);
                          if (!isPlaying) setIsPlaying(true);
                        }}
                        className={`group text-left transition-all duration-300 cursor-pointer p-4 rounded-xl relative ${
                          isLineSelected
                            ? "bg-white/10 border-l-4 border-pink-500 pl-6 scale-[1.01]"
                            : "opacity-30 hover:opacity-90 pl-4 border-l border-white/5"
                        }`}
                      >
                        <p
                          className={`font-bold transition-all text-2xl md:text-3xl tracking-tight leading-relaxed ${
                            isLineSelected
                              ? "text-white font-black"
                              : "text-slate-300 font-semibold group-hover:text-white"
                          } ${
                            isCh
                              ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 font-extrabold"
                              : ""
                          }`}
                        >
                          {line.text}
                        </p>

                        {/* Translation lines */}
                        {showTranslation && (
                          <p
                            className={`transition-all ${
                              isLineSelected
                                ? "text-sm text-pink-300/90 font-medium italic mt-1"
                                : "text-xs text-slate-400/80 group-hover:text-slate-300 mt-1"
                            }`}
                          >
                            {line.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: LOVE NOTE FORM AND SEALS */}
            {selectedNavbarTab === "love_note" && (
              <div id="love-note-view" className="space-y-6">
                {generatedNoteText ? (
                  <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative space-y-6">
                      <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 to-transparent blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl animate-spin">💮</span>
                          <div>
                            <span className="text-xs uppercase font-mono tracking-widest text-pink-400 font-black block">Wax Sealed Letter</span>
                            <span className="text-[10px] text-white/50 block font-mono">Quotes: &ldquo;{noteQuote}&rdquo;</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setGeneratedNoteText("")}
                          className="text-[10px] text-white/60 hover:text-pink-400 uppercase font-mono tracking-wider bg-white/5 hover:bg-white px-3 py-1 rounded-lg transition-colors border border-white/10"
                        >
                          Re-Write Letter
                        </button>
                      </div>

                      <div className="text-sm md:text-base text-white/90 leading-relaxed font-serif tracking-wide whitespace-pre-wrap">
                        {generatedNoteText}
                      </div>

                      <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 uppercase tracking-widest text-[9px] block">Vibe Settings</span>
                          <span className="font-mono text-pink-300 font-bold">{noteVibe}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white/80 italic font-serif block">Forever True,</span>
                          <p className="font-extrabold text-[#f43f5e] text-sm mt-0.5">{noteSender || "Your Only One"}</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedNoteText);
                        showToast("📋 Copied sealed love letter!");
                      }}
                      className="mx-auto block text-xs tracking-widest font-bold uppercase py-2.5 px-6 bg-white/15 hover:bg-white text-white hover:text-black rounded-xl transition-all"
                    >
                      Copy Letter Text
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleGenerateLoveLetter} className="space-y-6 max-w-lg mx-auto py-4">
                    <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/10">
                      <div className="flex gap-2 items-center text-pink-400 text-xs uppercase font-bold tracking-widest">
                        <Sparkles className="w-4 h-4" />
                        <span>Poetic Letter Blueprint</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Lover Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Marie, Keza, Precious"
                            value={notePartner}
                            onChange={(e) => {
                              setNotePartner(e.target.value);
                              setLyricsPartner(e.target.value);
                            }}
                            className="w-full bg-black/40 border border-white/10 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white uppercase focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Your Signature</label>
                          <input
                            type="text"
                            placeholder="e.g. David, Eric"
                            value={noteSender}
                            onChange={(e) => {
                              setNoteSender(e.target.value);
                              setLyricsSender(e.target.value);
                            }}
                            className="w-full bg-black/40 border border-white/10 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Themed Song Quote</label>
                        <select
                          value={noteQuote}
                          onChange={(e) => setNoteQuote(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                        >
                          <option value="Ni wowe umutima ushaka boo">"Ni wowe umutima ushaka boo"</option>
                          <option value="Iyo turi kumwe time irahagarara">"Iyo turi kumwe time irahagarara"</option>
                          <option value="Since umunsi nakubonye girl, heart yanjye ntiyongera kuba normal">"Since umunsi nakubonye girl..."</option>
                          <option value="Nzagukunda forever true">"Nzagukunda forever true"</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Aesthetic Vibe & Memory Background</label>
                        <input
                          type="text"
                          placeholder="e.g., Cold rainy day in Gisenyi, drinking hot ginger tea under blankets"
                          value={noteVibe}
                          onChange={(e) => setNoteVibe(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 focus:border-pink-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isGeneratingNote}
                      className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {isGeneratingNote ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Gemini Sealing Letter...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 md:pointer-events-none" />
                          <span>Generate Poetic Letter</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: GEMINI DUET SONGWRITER */}
            {selectedNavbarTab === "generator" && (
              <div id="ai-songwriter-form" className="space-y-6 max-w-lg mx-auto py-4">
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4">
                  <div className="flex gap-2 items-center text-indigo-400 text-xs uppercase font-bold tracking-widest">
                    <Music className="w-4 h-4" />
                    <span>Rwandan Folk & Love Duet Builder</span>
                  </div>
                  <p className="text-xs opacity-60 leading-relaxed">
                    Compose new custom lyric stanzas blending beautiful Kinyarwanda romance and catchy English hooks using specific personal milestones.
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Lover Name</label>
                      <input
                        type="text"
                        placeholder="Lover's name"
                        value={lyricsPartner}
                        onChange={(e) => {
                          setLyricsPartner(e.target.value);
                          setNotePartner(e.target.value);
                        }}
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Your Signature</label>
                      <input
                        type="text"
                        placeholder="Sender's name"
                        value={lyricsSender}
                        onChange={(e) => {
                          setLyricsSender(e.target.value);
                          setNoteSender(e.target.value);
                        }}
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Prompt & Milestones</label>
                    <textarea
                      placeholder="e.g., our walks by lake Kivu, how you make me laugh, late night calls talking about travel"
                      value={lyricsPrompt}
                      onChange={(e) => setLyricsPrompt(e.target.value)}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Acoustic Instrument Vibe</label>
                      <select
                        value={lyricsVibe}
                        onChange={(e) => setLyricsVibe(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                      >
                        <option value="Deeply Romantic & Smooth Acoustic">Smooth Acoustic Guitar</option>
                        <option value="Upbeat Afro-R&B Fusion">Upbeat Afro-R&B Drum Hook</option>
                        <option value="Melancholic Keyboard Ballad">Lofi Late-Night Piano</option>
                        <option value="Ethereal Dream-pop Synth">Cosmic Sparkle Chimes</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-bold tracking-widest text-slate-300">Language Mixture</label>
                      <select
                        value={languageRatio}
                        onChange={(e) => setLanguageRatio(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white cursor-pointer"
                      >
                        <option value="Equalparts Kinyarwanda & English">Balanced Kinyarwanda & English</option>
                        <option value="Kinyarwanda dominant with English hooks">Dominant Kinyarwanda</option>
                        <option value="English dominant with special Kinyarwanda love keywords">Dominant English with key Kinyarwanda phrases</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleGenerateLyrics}
                  disabled={isGeneratingLyrics}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-xl active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGeneratingLyrics ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Gemini Composing Lyrics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 pointer-events-none" />
                      <span>Compose Lyrics Duet</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        </div>
      </main>

      {/* Global Bottom Media Player Bar - Extracted cleanly from requested theme HTML */}
      <footer id="global-player" className="h-24 bg-black/40 backdrop-blur-3xl border-t border-white/5 px-10 flex items-center justify-between z-40 shrink-0">
        <div className="w-[280px] flex items-center gap-4 text-left">
          <div className="flex flex-col select-none">
            <div className="text-sm font-bold tracking-tight">
              {lyricsSource === "original" ? "Only You" : "Your Love Ballad"}
            </div>
            <div className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
              {lyricsSource === "original" ? "Ariel Wayz ft. B-Threy" : `${lyricsPartner || "Custom Lyric"} • Gemini Output`}
            </div>
          </div>
        </div>

        {/* Playback Controls & simulated seek bar with timings */}
        <div className="flex-1 max-w-[440px] flex flex-col items-center gap-3">
          <div className="flex items-center gap-10 select-none">
            <button
              onClick={handleSkipPrev}
              className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-xs"
              title="Previous Line"
            >
              ❮❮
            </button>
            <button
              onClick={handleTogglePlay}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black text-xs font-black hover:bg-pink-100 active:scale-95 transition-all cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 pointer-events-none" /> : <Play className="w-5 h-5 pointer-events-none ml-0.5" />}
            </button>
            <button
              onClick={handleSkipNext}
              className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer text-xs"
              title="Next Line"
            >
              ❯❯
            </button>
          </div>
          
          <div className="w-full flex items-center gap-4 select-none">
            <span className="text-[10px] font-mono opacity-40">{formatTime(fakeTrackTimer)}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full relative overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(fakeTrackTimer / 222) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono opacity-40">03:42</span>
          </div>
        </div>

        {/* Volume controls option indicators */}
        <div className="w-[280px] flex justify-end items-center gap-6 select-none">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                showToast(soundEnabled ? "Synth Muted" : "Synth Enabled");
              }}
              className="text-lg opacity-40 hover:opacity-80 cursor-pointer"
            >
              🔊
            </button>
            <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300" 
                style={{ width: soundEnabled ? "75%" : "0%" }}
              />
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedNavbarTab(selectedNavbarTab === "lyrics" ? "generator" : "lyrics");
            }}
            className="w-10 h-10 border border-white/10 rounded-xl flex items-center justify-center text-sm hover:bg-white/5 cursor-pointer"
            title="Menu View Toggle"
          >
            ≡
          </button>
        </div>
      </footer>
    </div>
  );
}
