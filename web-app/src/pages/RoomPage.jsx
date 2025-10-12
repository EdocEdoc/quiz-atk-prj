import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { joinRoom, startBattle, useRoom } from "../hooks/useRoom";
import LoadingSpinner from "../components/LoadingSpinner";
import { GAME_STATUS } from "../utils/types";
import Button from "../components/ui/Button";
import { Users, BookOpen, Sword, ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";

function RoomPage() {
  const { roomId } = useParams();
  const { user } = useAuthContext();
  const { room, loading, error } = useRoom(roomId);
  const [guestTopic, setGuestTopic] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const MAX_TOPIC_LENGTH = 100; 

  useEffect(() => {
    console.log("🚀 ~ RoomPage ~ room:", room);
    if (room && room.status === GAME_STATUS.BATTLE) {
      navigate(`/battle/${roomId}`);
    }
  }, [room, roomId, navigate]);

  const handleJoinRoom = async () => {
    if (!guestTopic.trim()) return;

    setIsJoining(true);
    try {
      await joinRoom(roomId, user.uid, guestTopic.trim());
    } catch (error) {
      console.error("Error joining room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStartBattle = async () => {
    try {
      await startBattle(roomId);
    } catch (error) {
      console.error("Error starting battle:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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

          {/* Room Waiting */}
          {/* {room.status === GAME_STATUS.WAITING && (
            <LoadingSpinner size="sm" className="mb-10" />
          )}
 */}
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
                Guest
              </h2>
              {room.guestId ? (
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
                      maxLength={MAX_TOPIC_LENGTH}
                    />
                    {guestTopic.length >= MAX_TOPIC_LENGTH && (
                    <p className="text-yellow-400 text-xs mt-1">
                    Maximum character limit reached
                    </p>
                      )}
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
                      Your Topic
                    </label>
                    <Input
                      placeholder="Enter your topic..."
                      value={guestTopic}
                      onChange={(e) => setGuestTopic(e.target.value)}
                    />
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
                <p className="text-gray-300">Waiting for opponent...</p>
              )}
            </Card>
          </div>

          {/* Lecture Section */}
          {room.status === GAME_STATUS.LECTURE && room.lecture && (
            <Card className="mt-8 p-6">
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
