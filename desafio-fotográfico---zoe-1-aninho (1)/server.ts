import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limits for base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

interface PhotoSubmission {
  id: string;
  photographer: string;
  challenge: string;
  timestamp: number;
  fileUrl: string;
  serverStored: boolean;
  appsScriptSent: boolean;
  aiFeedback?: string;
}

const METADATA_FILE = path.join(UPLOADS_DIR, "metadata.json");

function loadSubmissions(): PhotoSubmission[] {
  if (fs.existsSync(METADATA_FILE)) {
    try {
      const data = fs.readFileSync(METADATA_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading metadata file:", e);
      return [];
    }
  }
  return [];
}

function saveSubmissions(submissionsList: PhotoSubmission[]) {
  try {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(submissionsList, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing metadata file:", e);
  }
}

let submissions: PhotoSubmission[] = loadSubmissions();

// Initialize Gemini if key is present
let ai: any = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API initialized successfully!");
  } catch (e) {
    console.error("Failed to initialize Gemini API:", e);
  }
}

// GET submissions
app.get("/api/photos", (req, res) => {
  res.json(submissions);
});

// POST upload
app.post("/api/upload", async (req, res) => {
  try {
    const { photographer, challenge, foto, appsScriptUrl } = req.body;

    if (!photographer || !challenge || !foto) {
      return res.status(400).json({ status: "erro", message: "Dados incompletos" });
    }

    // Parse base64
    const matches = foto.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ status: "erro", message: "Formato de imagem inválido" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate clean safe filename
    const cleanPhotographer = photographer.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const cleanChallenge = challenge.substring(0, 15).replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const timestamp = Date.now();
    const extension = mimeType.split("/")[1] || "jpg";
    const filename = `${cleanPhotographer}_${cleanChallenge}_${timestamp}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    // Write file
    fs.writeFileSync(filePath, buffer);
    const fileUrl = `/uploads/${filename}`;

    let appsScriptSent = false;

    // Optional: Forward to Apps Script
    if (appsScriptUrl && appsScriptUrl !== "COLE_O_LINK_DO_SEU_APPS_SCRIPT_AQUI" && appsScriptUrl.trim() !== "") {
      try {
        const payload = {
          nomeArquivo: filename,
          foto: foto,
          photographer,
          challenge
        };
        const scriptRes = await fetch(appsScriptUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        if (scriptRes.ok) {
          appsScriptSent = true;
        }
      } catch (err) {
        console.error("Failed to forward to Apps Script:", err);
      }
    }

    // Optional: Analyze with Gemini
    let aiFeedback = "";
    if (ai) {
      try {
        const imagePart = {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        };
        const textPart = {
          text: `Você é o assistente virtual da Zoe, uma bebê super fofa de 1 aninho que está comemorando seu aniversário com o tema de ovelhinhas. Um convidado chamado "${photographer}" tirou uma foto excelente para cumprir a missão do desafio fotográfico: "${challenge}". Analise a foto rapidamente e dê um comentário curto, extremamente carinhoso, fofo e alegre em português (máximo de 2 frases curtas) elogiando o convidado pelo clique ou comentando de forma engraçadinha e doce sobre a imagem. Use emojis fofos como 🐑, 💖, 🎂, 👶, ✨, 🍼 etc. Seja muito amoroso!`,
        };
        const geminiRes = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: { parts: [imagePart, textPart] },
        });
        if (geminiRes && geminiRes.text) {
          aiFeedback = geminiRes.text.trim();
        }
      } catch (geminiErr) {
        console.error("Gemini analysis failed:", geminiErr);
        aiFeedback = `Que clique maravilhoso, ${photographer}! A Zoe amou demais esse registro fofo para o álbum de 1 aninho! 🐑💖✨`;
      }
    }

    const newSubmission: PhotoSubmission = {
      id: `${timestamp}_${Math.random().toString(36).substr(2, 5)}`,
      photographer,
      challenge,
      timestamp,
      fileUrl,
      serverStored: true,
      appsScriptSent,
      aiFeedback: aiFeedback || undefined,
    };

    submissions.unshift(newSubmission);
    saveSubmissions(submissions);

    res.json({
      status: "sucesso",
      submission: newSubmission,
    });
  } catch (error: any) {
    console.error("Error during upload:", error);
    res.status(500).json({ status: "erro", message: error.message || "Erro interno no servidor" });
  }
});

// Helper function to delete a single photo submission
const deleteSinglePhoto = (id?: string, fileUrl?: string) => {
  submissions = loadSubmissions();

  const targetIdStr = id ? String(id).trim() : "";
  const targetUrlStr = fileUrl ? String(fileUrl).trim() : "";

  const foundIndex = submissions.findIndex((s) => {
    if (targetIdStr && String(s.id).trim() === targetIdStr) return true;
    if (targetUrlStr && String(s.fileUrl).trim() === targetUrlStr) return true;
    if (targetIdStr && s.fileUrl && s.fileUrl.includes(targetIdStr)) return true;
    if (targetUrlStr && s.id && String(s.id).includes(targetUrlStr)) return true;
    return false;
  });

  if (foundIndex !== -1) {
    const sub = submissions[foundIndex];
    if (sub.fileUrl) {
      const relativePath = sub.fileUrl.startsWith("/") ? sub.fileUrl.slice(1) : sub.fileUrl;
      const filepath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
    }
    submissions.splice(foundIndex, 1);
    saveSubmissions(submissions);
    return true;
  }

  // Attempt fallback disk deletion if matching file exists in uploads
  if (targetUrlStr || targetIdStr) {
    const filename = path.basename(targetUrlStr || targetIdStr);
    const filepath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error("Error deleting file from uploads dir:", err);
      }
    }
  }

  return false;
};

// Admin endpoint to delete a photo submission (supports POST & DELETE)
const handlePhotoDeleteRoute = (req: express.Request, res: express.Response) => {
  const id = req.body?.id || req.params?.id || req.query?.id;
  const fileUrl = req.body?.fileUrl || req.query?.fileUrl;

  if (!id && !fileUrl) return res.status(400).json({ error: "ID or fileUrl missing" });

  deleteSinglePhoto(id as string, fileUrl as string);
  return res.json({ status: "ok", message: "Foto removida com sucesso" });
};

app.post("/api/photos/delete", handlePhotoDeleteRoute);
app.delete("/api/photos/delete", handlePhotoDeleteRoute);
app.delete("/api/photos/:id", handlePhotoDeleteRoute);

// Admin endpoint to clear all photo submissions
const handleClearAllPhotosRoute = (req: express.Request, res: express.Response) => {
  try {
    submissions = loadSubmissions();
    // Delete files in uploads directory
    if (fs.existsSync(UPLOADS_DIR)) {
      const files = fs.readdirSync(UPLOADS_DIR);
      for (const file of files) {
        if (file !== "metadata.json") {
          try {
            fs.unlinkSync(path.join(UPLOADS_DIR, file));
          } catch (e) {
            console.error("Error deleting file from uploads:", file, e);
          }
        }
      }
    }
    submissions = [];
    saveSubmissions(submissions);
    return res.json({ status: "ok", message: "Todas as fotos foram apagadas!" });
  } catch (err: any) {
    console.error("Error clearing submissions:", err);
    return res.status(500).json({ error: err.message });
  }
};

app.post("/api/photos/clear", handleClearAllPhotosRoute);
app.delete("/api/photos/clear", handleClearAllPhotosRoute);
app.delete("/api/photos", handleClearAllPhotosRoute);

// Integrate Vite middleware for development or serve build in production
async function startServer() {
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
