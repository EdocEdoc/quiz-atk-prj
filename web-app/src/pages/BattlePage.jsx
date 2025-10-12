import React, { useState, useEffect } from "react";
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

function BattlePage() {
  const { roomId } = useParams();
  const { user } = useAuthContext();
  const { room, loading, error } = useRoom(roomId);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (room && room.status !== GAME_STATUS.BATTLE) {
      navigate(`/room/${roomId}`);
    }

    if (!roomId) {
      navigate(`/`);
    }
  }, [room, roomId, navigate]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const submitAnswer = async () => {
    const appToken = import.meta.env.VITE_PRIVATE_API_KEY;
    console.log("🚀 ~ submitAnswer ~ token:", appToken);

    if (
      !roomId ||
      !user ||
      !appToken ||
      selectedAnswer === null ||
      currentQuestionIndex === null
    ) {
      console.warn("Missing data for submitAnswer");
      return;
    }

    try {
      const functions = getFunctions();
      const processAnswer = httpsCallable(functions, "processAnswer");

      const result = await processAnswer({
        roomId,
        questionIndex: currentQuestionIndex,
        answerIndex: selectedAnswer,
        apiKey: appToken,
      });

      console.log("🚀 ~ submitAnswer ~ result.data:", result.data);
      if (result.data) {
        // Move to next question or end battle
        if (currentQuestionIndex < room.quizList.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
        } else {
          // Battle finished
          navigate(`/room/${roomId}`);
        }
      }
    } catch (error) {
      console.error("❌ Error submitting answer:", error);
    }
  };

  const handleSubmitAnswer = async () => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !room || !roomId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              onClick={() => navigate(`/room/${roomId}`)}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Room
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white flex items-center justify-center">
                <Sword className="w-8 h-8 mr-2" />
                Battle Arena
              </h1>
              <p className="text-gray-300">
                Question {currentQuestionIndex + 1} of {room.quizList.length}
              </p>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Battle Stats */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Host Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Host</h3>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">
                    {room?.hp?.host || 0}/10
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((room?.hp?.host || 0) / 10) * 100}%` }}
                ></div>
              </div>
            </Card>

            {/* Guest Stats */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Guest</h3>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">
                    {room?.hp?.guest || 0}/10
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${((room?.hp?.guest || 0) / 10) * 100}%` }}
                ></div>
              </div>
            </Card>

            {/* Question Card */}
            <Card className="p-8 mb-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">
                  {currentQuestion?.question || "Loading question..."}
                </h2>
                <div className="flex items-center justify-center space-x-4 text-gray-300">
                  <span className="flex items-center">
                    {room?.currentTurn === "host" ? "Host" : "Guest"}
                    {room?.currentAction === "attack" ? (
                      <Sword className="w-4 h-4 ml-1" />
                    ) : (
                      <Shield className="w-4 h-4 ml-1" />
                    )}
                  </span>
                </div>
              </div>

              {!isLoading && currentQuestion && (
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
                    disabled={selectedAnswer === null}
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
                  <p className="text-gray-300">
                    Waiting for opponent's move...
                  </p>
                </div>
              )}
            </Card>

            {/* Battle Log */}
            {battleLog && battleLog.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Battle Log
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {battleLog.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-700 rounded"
                    >
                      <span className="text-gray-300 text-sm">
                        {log.isAttacker ? "⚔️" : "🛡️"} {log.question}
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          log.correct ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {log.correct ? "✓" : "✗"}{" "}
                        {log.damage > 0 ? `+${log.damage} damage` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BattlePage;
