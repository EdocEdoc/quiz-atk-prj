/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as dotenv from "dotenv";

dotenv.config();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const helloWorld = onRequest((request, response) => {
  try {
    const privateAPIKey = process.env.PRIVATE_API_KEY;
    if (!privateAPIKey) {
      throw new Error("Missing PRIVATE_API_KEY in environment");
    }
    if (request.headers["x-api-key"] !== privateAPIKey) {
      response.status(403).send("Forbidden");
      return;
    }
    logger.info("Hello logs!", { structuredData: true });
    response.send("Hello from Firebase!");
  } catch (err) {
    logger.error("Error", err);
    response.status(500).send((err as Error).message);
  }
});

export const callGemini = onRequest(async (req, res) => {
  try {
    const privateAPIKey = process.env.PRIVATE_API_KEY;
    if (!privateAPIKey) {
      throw new Error("Missing PRIVATE_API_KEY in environment");
    }
    if (req.headers["x-api-key"] !== privateAPIKey) {
      res.status(403).send("Forbidden");
      return;
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      throw new Error("Missing GEMINI_API_KEY in environment");
    }

    const prompt = req.query.prompt || "Hello Gemini!";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user", // <-- Add this!
              parts: [{ text: prompt }],
            },
          ],
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
