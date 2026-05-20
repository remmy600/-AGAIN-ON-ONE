import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY environment variable is not configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Route: Generate personalized lyrics or response notes
  app.post("/api/generate-lyrics", async (req, res) => {
    try {
      const { prompt, vibe, partnerName, senderName, languageRatio } = req.body;
      const ai = getGeminiClient();

      let systemInstruction = 
        "You are an elite, poetic songwriter specializing in modern Rwandan-English romantic pop card creation. " +
        "You write beautiful, modern, heartfelt lyrics. " +
        "The style should resemble the 'Only You' track, which fuses romantic Kinyarwanda phrases with catchy, colloquial English. " +
        "Output ONLY the generated lyrics as plain text. Do not include metadata, introduction, intro/outro descriptions, chords, or HTML. Just formatted song verses & chorus.";

      let promptContent = `Write a personalized set of lyrics in the style of "Only You" (Kinyarwanda-English fusion).
- Lover Name (the girl/boy): ${partnerName || "my love"}
- Sender Name: ${senderName || "me"}
- Selected Vibe: ${vibe || "Deeply Romantic & Smooth Acoustic"}
- Special memories / prompt focus: ${prompt || "loving them forever side by side under the moon, late night calls and peaceful moments"}
- Language ratio: ${languageRatio || "balanced Kinyarwanda and English"}

Please structure the output with classic song blocks, for example:
[Verse 1]
(write 4 beautiful lines fusing Kinyarwanda and English)

[Chorus]
(write a catchy, memorable love chorus)

[Verse 2]
(write 4 beautiful lines highlighting future plans or cute calls)

[Outro]
(a sweet, fading outro line)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.9,
        },
      });

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Gemini Generation Error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while generating lyrics." 
      });
    }
  });

  // API Route: Generate a matching romantic love note/letter
  app.post("/api/generate-lovenote", async (req, res) => {
    try {
      const { partnerName, senderName, favoriteLyricQuote, customVibe } = req.body;
      const ai = getGeminiClient();

      let systemInstruction = 
        "You are a master romantic letter writer. " +
        "You craft deeply human, non-generic, soft romantic letters inspired by Rwandan poetic style mixed with modern sweet expressions. " +
        "Output ONLY the letter. No introductory or closing remarks like 'Here is your letter:', no title, just the letter contents.";

      let promptContent = `Write a romantic love letter/declaration.
- To: ${partnerName || "My Peace"}
- From: ${senderName || "Your Only One"}
- Inspired by this quote: "${favoriteLyricQuote || "Ni wowe umutima ushaka boo"}"
- Custom tone/vibe: ${customVibe || "Warm, sincere, starry-eyed, starry night, forever true"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.85,
        },
      });

      res.json({ success: true, text: response.text });
    } catch (error: any) {
      console.error("Gemini LoveNote Error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "An error occurred while generating your love letter." 
      });
    }
  });

  // Serve static assets in production, otherwise delegate to Vite
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
