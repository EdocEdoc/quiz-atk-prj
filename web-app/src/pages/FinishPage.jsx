import React from "react";
import {
  Trophy,
  Star,
  Target,
  Clock,
  BookOpen,
  Home,
  RotateCcw,
  Users,
} from "lucide-react";

// Mock data for demonstration - replace with your actual room data
const mockRoom = {
  status: "finished",
  hp: {
    host: 7,
    guest: 3,
  },
  hostTopic: "React Hooks and State Management",
  guestTopic: "JavaScript ES6+ Features",
  winner: "guest", // "host", "guest", or "draw"
  stats: {
    host: {
      correctAnswers: 7,
      totalQuestions: 10,
      accuracy: 70,
      avgResponseTime: 12.5,
    },
    guest: {
      correctAnswers: 3,
      totalQuestions: 10,
      accuracy: 30,
      avgResponseTime: 15.2,
    },
  },
};

const FinishPage = () => {
  const room = mockRoom;
  const isHost = true; // Replace with actual user role check
  const currentUserRole = isHost ? "host" : "guest";
  const opponentRole = isHost ? "guest" : "host";

  const didWin = room.winner === currentUserRole;
  const isDraw = room.winner === "draw";

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Victory Banner */}
        <div className="text-center mb-8">
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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Host Card */}
          <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border-2 ${
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
                className={`text-3xl font-bold ${
                  room.hp.host > 5
                    ? "text-green-400"
                    : room.hp.host > 2
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {room.hp.host} HP
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(room.hp.host / 10) * 100}%` }}
              ></div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Topic:</span>
                <span className="text-white font-medium">{room.hostTopic}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Correct Answers:</span>
                <span className="text-white font-medium">
                  {room.stats.host.correctAnswers}/
                  {room.stats.host.totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Accuracy:</span>
                <span className="text-white font-medium">
                  {room.stats.host.accuracy}%
                </span>
              </div>
            </div>
          </div>

          {/* Guest Card */}
          <div
            className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border-2 ${
              room.winner === "guest" ? "border-yellow-400" : "border-gray-700"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                {room.winner === "guest" && (
                  <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                )}
                Guest {!isHost && "(You)"}
              </h3>
              <span
                className={`text-3xl font-bold ${
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
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Topic:</span>
                <span className="text-white font-medium">
                  {room.guestTopic}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Correct Answers:</span>
                <span className="text-white font-medium">
                  {room.stats.guest.correctAnswers}/
                  {room.stats.guest.totalQuestions}
                </span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Accuracy:</span>
                <span className="text-white font-medium">
                  {room.stats.guest.accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Star className="w-6 h-6 mr-2 text-purple-400" />
            Battle Statistics
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-900/50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="text-gray-400 text-sm mb-1">Your Accuracy</p>
              <p className="text-3xl font-bold text-white">
                {room.stats[currentUserRole].accuracy}%
              </p>
            </div>

            <div className="text-center p-4 bg-gray-900/50 rounded-lg">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-gray-400 text-sm mb-1">Correct Answers</p>
              <p className="text-3xl font-bold text-white">
                {room.stats[currentUserRole].correctAnswers}/
                {room.stats[currentUserRole].totalQuestions}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-900/50 rounded-lg">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-gray-400 text-sm mb-1">Avg Response Time</p>
              <p className="text-3xl font-bold text-white">
                {room.stats[currentUserRole].avgResponseTime}s
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center">
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </button>
          <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center">
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinishPage;
