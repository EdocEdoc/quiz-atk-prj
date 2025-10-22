import React, { useState, useEffect, useRef } from "react";
import { GAME_STATUS } from "../utils/types";
import { Sword, Shield, ArrowLeft, Zap } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useRoom } from "../hooks/useRoom";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import redChar from "../assets/redchar.png";
import bluechar from "../assets/bluechar.png";
import { motion } from "framer-motion";
import GlowingCharacter from "../components/GlowingCharacter";

import useBackgroundMusic from "../hooks/useBackgroundMusic";
import { playEffect, setBackgroundMusicInstance } from "../utils/soundManager";

import bgBattleMusic from "../assets/bgBattleMusic.mp3";
import healingEffect from "../assets/healing.mp3";
import attackedEffect from "../assets/attacked.mp3";

import useTimer from "../hooks/useTimer";

function BattlePage() {
  const { roomId } = useParams();
  const { user } = useAuthContext();
  const { room, loading, error, battleLogs } = useRoom(roomId);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { timeLeft, status, start, stop, reset } = useTimer(20);

  const bgInstance = useBackgroundMusic(bgBattleMusic, {
    loop: true,
    volume: 0.2,
  });

  useEffect(() => {
    if (bgInstance) {
      setBackgroundMusicInstance(bgInstance);
    }

    return () => {
      console.log("🚀 ~ Battle ~ unmount");
    };
  }, []);

  useEffect(() => {
    if (status === "idle") {
      start();
    }

    if (status !== "ended") return;
    const isHost = room.hostId === user.uid;
    const isMyTurn =
      (room.currentTurn === "host" && isHost) ||
      (room.currentTurn === "guest" && !isHost);
    if (!isMyTurn) return;

    submitAnswer(99);
  }, [status]);

  const youAre = room?.hostId == user?.uid ? "host" : "guest";

  const currentUserConfig = {
    charImage: youAre == "host" ? bluechar : redChar,
    name: youAre,
  };

  const enemyConfig = {
    charImage: youAre == "host" ? redChar : bluechar,
    name: youAre == "host" ? "guest" : "host",
  };

  const redcharRef = useRef(null);
  const [redPos, setRedPos] = useState({ x: 0, y: 0 });
  const bluecharRef = useRef(null);
  const [bluePos, setBluePos] = useState({ x: 0, y: 0 });
  const [isAttacking, setIsAttacking] = useState(null);
  const [isDefending, setIsDefending] = useState(null);
  const prevRoomHPRef = useRef(null);

  const handleAttackAI = () => {
    const aiAttack = () => {
      // Generate a random answer index between 0 and 3
      const ansIndex = Math.floor(Math.random() * 4);

      // Ensure question index never goes below 0
      const qIndex = Math.max(0, currentQuestionIndex - 1);

      if (room?.hp.host > 0 && room?.hp.guest > 0) {
        submitAnswer(ansIndex, qIndex);
      }
    };

    setTimeout(() => {
      aiAttack();
    }, 3000);
  };

  useEffect(() => {
    if (!room?.hp) return;

    reset();
    start();

    if (room?.guestId == "AI" && room?.currentTurn == "guest") {
      handleAttackAI();
    }

    const prevHP = prevRoomHPRef.current;
    const currHP = room.hp;

    // First load — just store initial HP
    if (!prevHP) {
      prevRoomHPRef.current = currHP;
      return;
    }

    const playerKey = currentUserConfig.name;
    const enemyKey = enemyConfig.name;

    // --- PLAYER ---
    if (prevHP[playerKey] < currHP[playerKey]) {
      setIsDefending("PLAYER");
      playEffect(healingEffect);
      setTimeout(() => setIsDefending(null), 1000);
    } else if (prevHP[playerKey] > currHP[playerKey]) {
      setIsAttacking("PLAYER");
      playEffect(attackedEffect);
      setTimeout(() => setIsAttacking(null), 1000);
    }

    // --- ENEMY ---
    if (prevHP[enemyKey] < currHP[enemyKey]) {
      setIsDefending("ENEMY");
      playEffect(healingEffect);
      setTimeout(() => setIsDefending(null), 1000);
    } else if (prevHP[enemyKey] > currHP[enemyKey]) {
      setIsAttacking("ENEMY");
      playEffect(attackedEffect);
      setTimeout(() => setIsAttacking(null), 1000);
    }

    // Update previous HP after checking
    prevRoomHPRef.current = currHP;
  }, [room]);

  useEffect(() => {
    // Get character positions
    if (redcharRef.current) {
      const rect = redcharRef.current.getBoundingClientRect();
      setRedPos({ x: rect.left, y: rect.top });
    }

    if (bluecharRef.current) {
      const rect = bluecharRef.current.getBoundingClientRect();
      setBluePos({ x: rect.left, y: rect.top });
    }
  }, []);

  useEffect(() => {
    if (room && room.status !== GAME_STATUS.BATTLE) {
      navigate(`/room/${roomId}`);
    }

    if (!roomId) {
      navigate(`/`);
    }
  }, [room, roomId, navigate]);

  const handleAnswerSelect = (answerIndex) => {
    if (
      answerIndex &&
      typeof answerIndex === "object" &&
      answerIndex.nativeEvent
    ) {
      console.warn("submitAnswer called with event instead of index");
      return;
    }
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = async (
    paramForceAnswerIndex = null,
    paramForceQuestionIndex = null
  ) => {
    let forceAnswerIndex = null;
    let forceQuestionIndex = null;

    if (
      paramForceAnswerIndex &&
      typeof paramForceAnswerIndex === "object" &&
      paramForceAnswerIndex.nativeEvent
    ) {
      forceAnswerIndex = null;
    } else {
      forceAnswerIndex = paramForceAnswerIndex;
    }

    if (
      paramForceQuestionIndex &&
      typeof paramForceQuestionIndex === "object" &&
      paramForceQuestionIndex.nativeEvent
    ) {
      forceQuestionIndex = null;
    } else {
      forceQuestionIndex = paramForceQuestionIndex;
    }

    /* console.log(
      "🚀 ~ submitAnswer ~ forceQuestionIndex forceAnswerIndex:",
      forceQuestionIndex,
      forceAnswerIndex,
      isLoading,
      isNaN(forceQuestionIndex)
    ); */

    if (isLoading && isNaN(forceQuestionIndex)) return;

    const appToken = import.meta.env.VITE_PRIVATE_API_KEY;

    if (
      !roomId ||
      !user ||
      !appToken ||
      (selectedAnswer === null && forceAnswerIndex === null) ||
      currentQuestionIndex === null
    ) {
      console.warn("Missing data for submitAnswer");
      return;
    }
    setIsLoading(true);
    try {
      const functions = getFunctions();
      const processAnswer = httpsCallable(functions, "processAnswer");

      const SubmitData = {
        roomId,
        questionIndex: forceQuestionIndex
          ? forceQuestionIndex
          : currentQuestionIndex,
        answerIndex: selectedAnswer
          ? selectedAnswer
          : forceAnswerIndex
          ? forceAnswerIndex
          : 99,
        apiKey: appToken,
      };

      const result = await processAnswer(SubmitData);

      if (result.data) {
        // Move to next question or end battle
        if (currentQuestionIndex < room.quizList.length - 1) {
          if (room?.guestId != "AI" || room?.currentTurn == "host") {
            setCurrentQuestionIndex((prev) => prev + 1);
          }

          setSelectedAnswer(null);
        } else {
          // Battle finished
          navigate(`/room/${roomId}`);
        }
      }
    } catch (error) {
      console.error("❌ Error submitting answer:", error);
    } finally {
      setIsLoading(false);
      reset();
      start();
      setSelectedAnswer(null);
    }
  };

  /* const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;
    setIsLoading(true);
    // This would typically call a Cloud Function to process the answer
    await submitAnswer();
    // For now, we'll simulate the battle logic
    const isCorrect =
      selectedAnswer === room.quizList[currentQuestionIndex].answerIndex;
    const isAttacker =
      room.currentTurn === (room.hostId === user.uid ? "host" : "guest");

    // Add to battle log
    setBattleLog((prev) => [
      ...prev,
      {
        question: room.quizList[currentQuestionIndex].question,
        answer: selectedAnswer,
        correct: isCorrect,
        isAttacker,
        damage: isAttacker && isCorrect ? 1 : 0,
      },
    ]);

    // Move to next question or end battle
    if (currentQuestionIndex < room.quizList.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      // Battle finished
      navigate(`/room/${roomId}`);
    }
    setIsLoading(false);
  }; */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !room || !roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Battle Error</h1>
          <p className="text-gray-300 mb-6">{error || "Room not found"}</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = room.quizList[currentQuestionIndex];
  const isHost = room.hostId === user.uid;
  const isMyTurn =
    (room.currentTurn === "host" && isHost) ||
    (room.currentTurn === "guest" && !isHost);

  return (
    <div className="min-h-screen min-w-screen">
      <div className="min-h-screen min-w-screen flex flex-row md:flex-col flex-wrap">
        <div className="order-1 min-w-1/3 grow md:order-3  md:grow-0 p-4 text-white flex justify-start md:mb-4">
          {/* Player */}
          <div className="" ref={bluecharRef}>
            <GlowingCharacter
              src={currentUserConfig.charImage}
              isAttacking={isAttacking === "PLAYER"}
              isDefending={isDefending === "PLAYER"}
              className="scale-x-[-1]"
            />
            <Card>
              <div className="flex flex-col py-2 px-4">
                <h3 className="text-xl font-bold text-white text-center">
                  🦸‍♂️ YOU
                </h3>
                <div className="h-2 bg-gray-300 rounded mt-1">
                  <motion.div
                    className="h-2 bg-red-500 rounded"
                    initial={{ width: "100%" }}
                    animate={{
                      width: `${room.hp[currentUserConfig.name] * 10}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs mt-1 text-center">
                  ❤️ {room.hp[currentUserConfig.name] * 10} / 100
                </p>
              </div>
            </Card>
          </div>
        </div>
        <div className="order-3 w-full md:order-2 md:grow p-4 flex flex-col items-center gap-4 h-full justify-center">
          {/* Question Card */}
          <div className="px-10">
            <div className="text-center mb-6 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentQuestion?.question || "Loading question..."}
              </h2>
              <p className="text-sm mt-[-20px] mb-[-10px]">
                Q{currentQuestionIndex + 1}: {timeLeft || status.toUpperCase()}
              </p>
            </div>

            {currentQuestion && (
              <div className="grid gap-4 max-w-2xl mx-auto">
                {currentQuestion.choices.map((choice, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left justify-start p-4 h-auto ${
                      selectedAnswer === index
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                    disabled={!isMyTurn}
                  >
                    <span className="font-medium mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {choice}
                  </Button>
                ))}
              </div>
            )}

            {isMyTurn && (
              <div className="text-center mt-6">
                <Button
                  onClick={submitAnswer}
                  disabled={selectedAnswer === null || isLoading}
                  className={
                    room?.currentAction === "defend"
                      ? "bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                      : "bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                  }
                >
                  {room?.currentAction === "defend" ? (
                    <Shield className="w-5 h-5 mr-2" />
                  ) : (
                    <Sword className="w-5 h-5 mr-2" />
                  )}
                  {room?.currentAction === "defend" ? "Defend!" : "Attack!"}
                </Button>
              </div>
            )}

            {!isMyTurn && (
              <div className="text-center mt-6">
                <p className="text-gray-300">Waiting for opponent's move...</p>
              </div>
            )}
          </div>
        </div>
        <div className="order-2 min-w-1/3 grow md:order-1 md:grow-0 p-4 text-white flex justify-end">
          {/* Opponent */}
          <div className="" ref={redcharRef}>
            <GlowingCharacter
              src={enemyConfig.charImage}
              isAttacking={isAttacking === "ENEMY"}
              isDefending={isDefending === "ENEMY"}
            />

            <Card>
              <div className="flex flex-col py-2 px-4">
                <h3 className="text-xl font-bold text-white text-center">
                  👹{" "}
                  {room?.guestId == "AI"
                    ? "AI Enemy"
                    : enemyConfig.name.toLocaleUpperCase()}
                </h3>
                <div className="h-2 bg-gray-300 rounded mt-1">
                  <motion.div
                    className="h-2 bg-red-500 rounded"
                    initial={{ width: "100%" }}
                    animate={{
                      width: `${room.hp[enemyConfig.name] * 10}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs mt-1 text-center">
                  ❤️ {room.hp[enemyConfig.name] * 10} / 100
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* Battle Log */}
      {battleLogs && battleLogs.length > 0 && (
        <div className="p-6 ">
          <h3 className="text-xl font-bold text-white mb-4">Battle Log</h3>
          <div className="space-y-2 max-h-svh overflow-y-auto">
            {battleLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-700 rounded "
              >
                <div>
                  <span className="text-gray-300 text-sm">
                    {log.isAttacker ? "⚔️💥" : "🛡️"}{" "}
                    {room?.quizList[log.questionIndex]?.question || "Question"}{" "}
                  </span>
                  <p className="text-sm text-gray-500">
                    {log?.timestamp
                      ? log.timestamp.toDate
                        ? log.timestamp.toDate().toISOString() // Firestore Timestamp
                        : new Date(log.timestamp).toISOString() // ms or ISO string
                      : " "}
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    log.isCorrect ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {log.isCorrect ? "✓" : "✗"}{" "}
                  {log.damage > 0 ? `+${log.damage} damage` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BattlePage;
