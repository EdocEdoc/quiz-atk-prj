# 🌿 Firebase Functions — Environment Variables Setup (2025+)

This guide helps you **securely store API keys** (like Gemini API keys) and **migrate from `functions.config()`** to the new `.env` + Secret Manager setup.

---

## 🧩 1. Create `.env` file in your `functions/` directory

Inside your Firebase project:

```
functions/.env
```

Add your secret values (no quotes needed):

```bash
GEMINI_API_KEY=your_api_key_here
```

---

## 🚫 2. Ignore `.env` in Git

Prevent accidental uploads to GitHub:

```bash
# functions/.gitignore
.env
```

---

## ⚙️ 3. Load and use environment variables in TypeScript

In `functions/src/index.ts`:

```ts
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import * as dotenv from "dotenv";
import fetch from "node-fetch";

// Load .env locally
dotenv.config();

export const callGemini = onRequest(async (req, res) => {
  try {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment");
    }

    const prompt = req.query.prompt || "Hello Gemini!";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    logger.error("Gemini API Error", err);
    res.status(500).json({ error: (err as Error).message });
  }
});
```

---

## 🧪 4. Test locally with emulator

Run:
```bash
firebase emulators:start --only functions
```

Then visit:
```
http://127.0.0.1:5001/<your-project-id>/us-central1/callGemini?prompt=Hi
```

---

## ☁️ 5. Deploy safely to production

### Set secret in Firebase
Instead of `.env`, use Firebase Secrets for production:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```
Paste your API key when prompted.

### Deploy functions
```bash
firebase deploy --only functions
```

---

## 🧰 6. Optional — Example `.env.example`

```
# functions/.env.example
GEMINI_API_KEY=your_api_key_here
```

---

## ✅ Summary

| Environment | Where Stored | Accessed via | Deployment-safe |
|--------------|--------------|---------------|----------------|
| Local | `.env` | `dotenv.config()` | ✅ |
| Production | Firebase Secret Manager | `process.env.GEMINI_API_KEY` | ✅ |

---

## 🧭 Recommended Scripts

In `functions/package.json`, add:

```json
"scripts": {
  "serve": "firebase emulators:start --only functions",
  "deploy": "firebase deploy --only functions",
  "lint": "eslint . --fix"
}
```

---

**Ready to go!** 🎯  
You can now safely use your Gemini API key locally and in production without exposing it in Git or code.
