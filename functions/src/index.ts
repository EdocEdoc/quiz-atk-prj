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

        /* const earthquakeLecture: LectureData = {
          topic: "Earthquake",
          lecture: `
An earthquake is the shaking of the surface of the Earth caused by a sudden release of energy in the Earth's lithosphere. 
This energy release creates seismic waves that travel through the ground. 
Most earthquakes occur along fault lines, where tectonic plates meet and move. 
The strength of an earthquake is measured using the Richter scale, and its intensity is observed using the Modified Mercalli Intensity (MMI) scale.
  `,
          quizList: [
            {
              id: "q1",
              question: "What causes an earthquake?",
              choices: [
                "Movement of tectonic plates",
                "Volcanic eruption",
                "Heavy rainfall",
                "Wind erosion",
              ],
              answerIndex: 0,
            },
            {
              id: "q2",
              question: "What instrument is used to record earthquake waves?",
              choices: [
                "Thermometer",
                "Seismograph",
                "Barometer",
                "Anemometer",
              ],
              answerIndex: 1,
            },
            {
              id: "q3",
              question: "Which scale measures the magnitude of an earthquake?",
              choices: [
                "Richter scale",
                "Beaufort scale",
                "Fujita scale",
                "Saffir-Simpson scale",
              ],
              answerIndex: 0,
            },
            {
              id: "q4",
              question:
                "What type of boundary is most commonly associated with earthquakes?",
              choices: [
                "Transform boundary",
                "Divergent boundary",
                "Convergent boundary",
                "All of the above",
              ],
              answerIndex: 3,
            },
            {
              id: "q5",
              question:
                "What should you do during an earthquake if you're indoors?",
              choices: [
                "Run outside immediately",
                "Stand under a doorway or sturdy furniture",
                "Use the elevator",
                "Light a candle",
              ],
              answerIndex: 1,
            },
          ],
        };

        const lectureData = earthquakeLecture; */
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
  const prompt = `You are Quiz Attack assistant. Given this topic, generate a short lecture (2-5 min read) and exactly 10 multiple-choice questions.

Topic: "${topic}"

Return JSON in this exact format (no markdown, no explanation):
{
  "topic": "${topic}",
  "lecture": "Your lecture content here...",
  "quizList": [
    {
      "question": "Question 1?",
      "choices": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
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

export const processAnswer = onRequest(async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(403).send("User must be authenticated");
      return;
    }

    /* const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid; */

    const { roomId, questionIndex, answerIndex, uid } = req.body;
    const userId = uid;

    // Your business logic here
    const roomRef = admin.firestore().collection("rooms").doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Room not found");
    }

    const room = roomDoc.data() as any;

    if (room.status !== "battle") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Room is not in battle mode"
      );
    }

    const question = room.quizList[questionIndex];
    if (!question) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid question index"
      );
    }

    const isCorrect = answerIndex === question.answerIndex;
    const isHost = room.hostId === userId;
    const isAttacker = room.currentTurn === (isHost ? "host" : "guest");

    const newHp = { ...room.hp };
    let damage = 0;

    if (isAttacker) {
      // Attacker logic
      if (isCorrect) {
        damage = 1;
        newHp[isHost ? "guest" : "host"] = Math.max(
          0,
          newHp[isHost ? "guest" : "host"] - damage
        );
      }
    } else {
      // Defender logic
      if (isCorrect) {
        damage = -1; // Block damage
        newHp[isHost ? "host" : "guest"] = Math.max(
          0,
          newHp[isHost ? "host" : "guest"] + 1
        );
      }
    }

    // Check for winner
    const winner =
      newHp.host === 0 ? "guest" : newHp.guest === 0 ? "host" : null;

    // Update room
    const updateData: any = {
      hp: newHp,
      currentTurn: isAttacker
        ? isHost
          ? "guest"
          : "host"
        : isHost
        ? "host"
        : "guest",
    };

    if (winner) {
      updateData.status = "finished";
      updateData.winner = winner;
      updateData.finishedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await roomRef.update(updateData);

    // Log battle event
    await admin
      .firestore()
      .collection("rooms")
      .doc(roomId)
      .collection("battleLog")
      .add({
        userId,
        questionIndex,
        answerIndex,
        isCorrect,
        isAttacker,
        damage,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      isCorrect,
      damage,
      newHp,
      winner,
    });
  } catch (err) {
    logger.error("processAnswer API Error", err);
    res.status(500).json({ error: (err as Error).message });
  }
});
