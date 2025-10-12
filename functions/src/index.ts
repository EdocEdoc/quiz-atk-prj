/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import * as dotenv from "dotenv";
import * as functions from "firebase-functions";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

admin.initializeApp();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

setGlobalOptions({ maxInstances: 10 });

const aiModel = "gemini-2.5-flash-lite";

// Types
interface QuizQuestion {
  question: string;
  choices: string[];
  answerIndex: number;
  id: string;
}

interface LectureData {
  topic: string;
  lecture: string;
  quizList: QuizQuestion[];
}

interface ProcessAnswerData {
  roomId: string;
  questionIndex: number;
  answerIndex: number;
  apiKey?: string;
}

// Generate lecture and quiz using GPT
export const generateLecture = functions.firestore.onDocumentUpdated(
  "rooms/{roomId}",
  async (event) => {
    const after = event.data?.after.data();
    const roomId = event.params.roomId;

    // Only trigger when both topics are present and status is generating
    if (
      after &&
      after.status === "generating" &&
      after.hostTopic &&
      after.guestTopic
    ) {
      try {
        // Generate combined topic
        const combinedTopic = await generateCombinedTopic(
          after.hostTopic,
          after.guestTopic
        );

        // Generate lecture and quiz
        const lectureData = await generateLectureAndQuiz(combinedTopic);

        // Update room with generated content
        await admin.firestore().collection("rooms").doc(roomId).update({
          status: "lecture",
          finalTopic: combinedTopic, //combinedTopic
          lecture: lectureData.lecture,
          quizList: lectureData.quizList,
        });

        console.log(`Generated lecture and quiz for room ${roomId}`);
      } catch (error) {
        console.error("Error generating lecture:", error);
        // Update room with error status
        await admin.firestore().collection("rooms").doc(roomId).update({
          status: "error",
          error: "Failed to generate lecture and quiz",
        });
      }
    }
  }
);

// Helper function to generate combined topic
async function generateCombinedTopic(
  hostTopic: string,
  guestTopic: string
): Promise<string> {
  try {
    const prompt = `Given these two topics, create a single, focused topic that combines or chooses the best one for a quiz battle:

Host Topic: "${hostTopic}"
Guest Topic: "${guestTopic}"

Return only the combined topic as a single sentence, no additional text.`;

    const model = genAI.getGenerativeModel({ model: aiModel });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text?.trim() || `${hostTopic} and ${guestTopic}`;
  } catch (error) {
    console.error("Error generating combined topic:", error);
    return `${hostTopic} and ${guestTopic}`;
  }
}

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

// Helper function to generate lecture and quiz
async function generateLectureAndQuiz(topic: string): Promise<LectureData> {
  const prompt = `You are Quiz Attack assistant. Given this topic, generate a short lecture (2-5 min read) and exactly 15 multiple-choice questions.
  Question should have 4 answer choices, with one correct answer. The questions should be challenging but fair, testing key concepts from the lecture.
  Questions should scale in difficulty, starting easier and getting harder.

  Topic: "${topic}"
  
  Return JSON in this exact format (no markdown, no explanation):
{
  "topic": "${topic}",
  "lecture": "Your lecture content here...",
  "quizList": [
    {
      "question": "Question 1?",
      "choices": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answerIndex": 0,
      "id": "q1"
    }
  ]
}

Make sure the lecture is educational and engaging, and the questions test understanding of the material.
STRICTLY Only output the JSON — no extra text or markdown.`;

  const model = genAI.getGenerativeModel({ model: aiModel });
  const result = await model.generateContent(prompt);
  const response = result.response;
  let content = response.text();

  content = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  if (!content) {
    throw new Error("No response from Gemini");
  }

  try {
    let data;
    try {
      data = JSON.parse(content);
    } catch (err) {
      logger.error("Invalid JSON from model:", content);
      throw new Error("Model response was not valid JSON.");
    }

    // Validate the response
    if (!data.topic || !data.lecture || !Array.isArray(data.quizList)) {
      throw new Error("Invalid response format");
    }

    // Ensure we have exactly 10 questions
    if (data.quizList.length !== 10) {
      throw new Error("Expected exactly 10 questions");
    }

    // Validate each question
    for (const question of data.quizList) {
      if (
        !question.question ||
        !Array.isArray(question.choices) ||
        question.choices.length !== 4 ||
        typeof question.answerIndex !== "number" ||
        question.answerIndex < 0 ||
        question.answerIndex > 3
      ) {
        throw new Error("Invalid question format");
      }
    }

    return data;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse lecture and quiz data");
  }
}

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

export const processAnswer = onCall<ProcessAnswerData>(async (request) => {
  try {
    const { roomId, questionIndex, answerIndex, apiKey } = request.data;

    // 🔒 Auth check
    const userId = request.auth?.uid;
    if (!userId) {
      throw new HttpsError(
        "unauthenticated",
        "User must be signed in to call this function."
      );
    }

    // 🔐 Optional API key check
    const privateAPIKey = process.env.PRIVATE_API_KEY;
    if (!privateAPIKey) {
      throw new HttpsError(
        "failed-precondition",
        "Missing PRIVATE_API_KEY in environment."
      );
    }
    if (apiKey && apiKey !== privateAPIKey) {
      throw new HttpsError("permission-denied", "Invalid API key.");
    }

    if (!roomId || questionIndex === undefined || answerIndex === undefined) {
      throw new HttpsError(
        "invalid-argument",
        "Missing required fields: roomId, questionIndex, or answerIndex."
      );
    }

    // 🧠 Business logic
    const roomRef = admin.firestore().collection("rooms").doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      throw new HttpsError("not-found", "Room not found.");
    }

    const room = roomDoc.data() as any;

    if (room.status !== "battle") {
      throw new HttpsError("failed-precondition", "Room is not in battle mode");
    }

    const question = room.quizList[questionIndex];
    if (!question) {
      throw new HttpsError("invalid-argument", "Invalid question index");
    }

    const isCorrect = answerIndex === question.answerIndex;
    const isAttacker = room?.currentAction
      ? true
      : room?.currentAction === "attack";
    const enemy: { host: "guest"; guest: "host" } = {
      host: "guest",
      guest: "host",
    };
    const turnName: "host" | "guest" = room?.currentTurn || "host";

    const newHp = { ...room.hp };
    let damage = 0;

    if (isAttacker) {
      // Attacker logic
      if (isCorrect) {
        damage = 2;
        newHp[enemy[turnName]] = Math.max(0, newHp[enemy[turnName]] - damage);
      } else {
        damage = 1;
        newHp[enemy[turnName]] = Math.max(0, newHp[enemy[turnName]] - damage);
      }
    } else {
      // Defender logic
      if (isCorrect) {
        damage = -1; // Block damage
        const maxHp = 10;
        newHp[turnName] = Math.min(maxHp, newHp[turnName] + 1);
      }
    }

    const winner =
      newHp.host === 0 ? "guest" : newHp.guest === 0 ? "host" : null;

    const updateData: any = {
      hp: newHp,
      currentTurn: isAttacker ? enemy[turnName] : turnName,
      currentAction: isAttacker ? "defend" : "attack",
    };

    if (winner) {
      updateData.status = "finished";
      updateData.winner = winner;
      updateData.finishedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await roomRef.update(updateData);

    await roomRef.collection("battleLog").add({
      userId,
      questionIndex,
      answerIndex,
      isCorrect,
      isAttacker,
      damage,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { isCorrect, damage, newHp, winner };
  } catch (error) {
    throw new HttpsError("internal", (error as Error).message);
  }
});
