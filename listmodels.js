import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const res = await fetch("https://generativelanguage.googleapis.com/v1/models?key=" + process.env.GEMINI_API_KEY);
  const data = await res.json();
  console.log("✅ Available Gemini models:");
  data.models.forEach((m) => console.log("→", m.name));
}

listModels().catch(console.error);
