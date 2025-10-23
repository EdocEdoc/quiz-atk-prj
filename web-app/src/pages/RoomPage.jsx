import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import {
  joinRoom,
  retryGenerate,
  startBattle,
  useRoom,
} from "../hooks/useRoom";
import LoadingSpinner from "../components/LoadingSpinner";
import { GAME_STATUS } from "../utils/types";
import Button from "../components/ui/Button";
import {
  Users,
  BookOpen,
  Sword,
  ArrowLeft,
  Trophy,
  Star,
  Target,
  Clock,
  Home,
  RotateCcw,
  Bot,
} from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import useBackgroundMusic from "../hooks/useBackgroundMusic";
import { setBackgroundMusicInstance } from "../utils/soundManager";

import bgMusic from "../assets/bgMusic.mp3";
import FinishPage from "./FinishPage";
import { getFirstWord } from "../utils/strings";

function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuthContext();
  const { room, loading, error } = useRoom(roomId);
  const [guestTopic, setGuestTopic] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const MAX_TOPIC_LENGTH = 100;

  const bgInstance = useBackgroundMusic(bgMusic, { loop: true, volume: 0.2 });

  useEffect(() => {
    if (bgInstance) {
      setBackgroundMusicInstance(bgInstance);
    }
    return () => {
      console.log("🚀 ~ Room ~ unmount");
    };
  }, []);

  useEffect(() => {
    if (room && room.status === GAME_STATUS.BATTLE) {
      navigate(`/battle/${roomId}`);
    }
  }, [room, roomId, navigate]);

  const handleRetryGenerate = async () => {
    console.log(
      "🚀 ~ handleRetryGenerate ~ room?.retryCount:",
      room?.retryCount
    );
    if (room?.retryCount >= 3) return;

    try {
      let locRetryCount = room?.retryCount ? room?.retryCount + 1 : 1;
      await retryGenerate(roomId, locRetryCount);
    } catch (e) {
      console.log("🚀 ~ handleRetryGenerate ~ e:", e);
    }
  };

  const handleJoinRoom = async () => {
    if (!guestTopic.trim()) return;

    setIsJoining(true);
    try {
      await joinRoom(
        roomId,
        user.uid,
        guestTopic.trim(),
        getFirstWord(user?.displayName)
      );
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleBattleAI = async () => {
    if (room?.guestId) return;

    setIsJoining(true);
    try {
      await joinRoom(roomId, "AI", room?.hostTopic, "AI");
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartBattle = async () => {
    try {
      await startBattle(roomId, room?.guestId);
    } catch (error) {
      console.error("Error starting battle:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Room Not Found</h1>
          <p className="text-gray-300 mb-6">{error}</p>
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

  const isHost = room.hostId === user.uid;
  const isGuest = room.guestId === user.uid;
  const canJoin = !isHost && !isGuest && !room.guestId;
  const canStart =
    isHost && room.guestId && room.status === GAME_STATUS.LECTURE;

  const currentUserRole = isHost ? "host" : "guest";
  const didWin = room.winner === currentUserRole;
  const isDraw = room.winner === "draw";

  if (room?.status == "finished" && room?.hp) {
    return (
      <div className="min-h-screen px-4 py-8  flex flex-col justify-center items-center gap-10">
        <div className="max-w-4xl mx-auto flex flex-col justify-center items-center">
          {/* Victory Banner */}
          {isDraw ? (
            <>
              <div className="inline-block p-4 bg-yellow-500/20 rounded-full mb-4">
                <Users className="w-16 h-16 text-yellow-400" />
              </div>
              <h1 className="text-5xl font-bold text-yellow-400 mb-2">
                It's a Draw!
              </h1>
              <p className="text-xl text-gray-300">
                Both warriors fought valiantly!
              </p>
            </>
          ) : didWin ? (
            <>
              <div className="inline-block p-4 bg-yellow-500/20 rounded-full mb-4 animate-pulse">
                <Trophy className="w-16 h-16 text-yellow-400" />
              </div>
              <h1 className="text-5xl font-bold text-yellow-400 mb-2">
                Victory!
              </h1>
              <p className="text-xl text-gray-300">
                You conquered the quiz battle!
              </p>
            </>
          ) : (
            <>
              <div className="inline-block p-4 bg-red-500/20 rounded-full mb-4">
                <Target className="w-16 h-16 text-red-400" />
              </div>
              <h1 className="text-5xl font-bold text-red-400 mb-2">Defeated</h1>
              <p className="text-xl text-gray-300">
                Better luck next time, warrior!
              </p>
            </>
          )}
        </div>

        {/* Final HP Comparison */}
        {room?.hp && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Host Card */}
            <Card
              className={`rounded-lg p-6 border-2 ${
                room.winner === "host" ? "border-yellow-400" : "border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  {room.winner === "host" && (
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  )}
                  Host {isHost && "(You)"}
                </h3>
                <span
                  className={` ml-8 text-3xl font-bold ${
                    room?.hp?.host > 5
                      ? "text-green-400"
                      : room?.hp?.host > 2
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {room?.hp?.host} HP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(room.hp.host / 10) * 100}%` }}
                ></div>
              </div>
            </Card>

            {/* Guest Card */}
            <Card
              className={`rounded-lg p-6 border-2 ${
                room.winner === "guest"
                  ? "border-yellow-400"
                  : "border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  {room.winner === "guest" && (
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                  )}
                  {room?.guestId == "AI"
                    ? "AI Enemy"
                    : `Guest ${!isHost ? "(You)" : ""}`}
                </h3>
                <span
                  className={`text-3xl font-bold ml-10 ${
                    room.hp.guest > 5
                      ? "text-green-400"
                      : room.hp.guest > 2
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {room.hp.guest} HP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(room.hp.guest / 10) * 100}%` }}
                ></div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </Button> */}
          <Button
            variant="primary"
            onClick={() => navigate("/")}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 ">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Room {roomId}</h1>
              <p className="text-gray-300">Status: {room.status}</p>
            </div>
            <div className="w-20"></div>
          </div>
          {/* Room Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Host Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Host
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Topic
                  </label>
                  <p className="text-white font-medium">{room.hostTopic}</p>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">HP</label>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(room.hp.host / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white text-sm font-medium">
                      {room.hp.host}/10
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Guest Section */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {room?.guestId == "AI" ? "AI Enemy" : "Guest"}
              </h2>
              {room.guestId ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Topic
                    </label>
                    <p className="text-white font-medium">{room.guestTopic}</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      HP
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(room.hp.guest / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm font-medium">
                        {room.hp.guest}/10
                      </span>
                    </div>
                  </div>
                </div>
              ) : canJoin ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Your Topic ({guestTopic.length}/{MAX_TOPIC_LENGTH})
                    </label>
                    <Input
                      placeholder="Enter your topic..."
                      value={guestTopic}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_TOPIC_LENGTH) {
                          setGuestTopic(value);
                        }
                      }}
                    />
                    {guestTopic.length >= MAX_TOPIC_LENGTH && (
                      <p className="text-yellow-400 text-xs mt-1">
                        Maximum character limit reached
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!guestTopic.trim() || isJoining}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isJoining ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col ">
                  <p className="text-gray-300">Waiting for opponent...</p>
                  <h2 className="text-xl font-bold text-white text-center">
                    OR
                  </h2>
                  <Button
                    onClick={handleBattleAI}
                    className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    Battle AI!
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {isHost &&
            room.status == "error" &&
            !loading &&
            !isJoining &&
            room?.retryCount < 3 && (
              <div className="flex justify-center m-8">
                <Button
                  onClick={handleRetryGenerate}
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry topic generation... {`${room?.retryCount || 0}/3`}
                </Button>
              </div>
            )}

          {room.status == "error" &&
            !loading &&
            !isJoining &&
            room?.retryCount >= 3 && (
              <div className="flex justify-center m-8">
                <Button
                  onClick={() => navigate("/")}
                  className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Room error. Please create another room.
                </Button>
              </div>
            )}

          {/* Lecture Section */}
          {room.status === GAME_STATUS.LECTURE && room.lecture && (
            <Card className="bg-amber-800 mt-8 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Study Material
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {room.lecture}
                </p>
              </div>
              {canStart && (
                <div className="mt-6 text-center">
                  <Button
                    onClick={handleStartBattle}
                    className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
                  >
                    <Sword className="w-5 h-5 mr-2" />
                    Start Battle!
                  </Button>
                </div>
              )}
            </Card>
          )}
          {/* Generating Status */}
          {room.status === GAME_STATUS.GENERATING && (
            <Card className="mt-8 p-6 text-center">
              <LoadingSpinner size="lg" className="mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">
                Generating Quiz...
              </h2>
              <p className="text-gray-300">
                AI is creating your personalized quiz battle!
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomPage;
