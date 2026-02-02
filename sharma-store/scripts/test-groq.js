import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Polyfill for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read .env file manually to get the key (since process.env isn't populated by Vite here)
const envPath = path.resolve(__dirname, "../.env");
let apiKey = process.env.VITE_GROQ_API_KEY;

if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    const match = envContent.match(/VITE_GROQ_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
        console.log("✅ Found API Key in .env");
    }
}

if (!apiKey) {
    console.error("❌ Error: VITE_GROQ_API_KEY not found in environment or .env file.");
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function verifyConnection() {
    console.log("🚀 Testing Groq Connection...");
    console.log("Model: llama3-8b-8192");

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: "Hello! Are you online? Reply with 'System Online' and a fun fact about stationery.",
                },
            ],
            model: "llama-3.3-70b-versatile",
        });

        console.log("\n✅ Success! AI Response:");
        console.log("------------------------------------------------");
        console.log(completion.choices[0]?.message?.content);
        console.log("------------------------------------------------");
    } catch (error) {
        console.error("\n❌ Connection Failed:");
        console.error(error); // Log full object
        if (error.error) console.error("API Error Response:", error.error);
    }
}

verifyConnection();
