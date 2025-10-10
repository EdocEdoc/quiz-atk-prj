import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { Plus, Users, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useRoomContext } from "../contexts/RoomContext";
import Input from "../components/ui/Input";

function HomePage() {
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    logout,
  } = useAuthContext();

  const { rooms, loading: roomsLoading } = useRoomContext();
  const [topic, setTopic] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🚀 ~ HomePage ~ user:", user);
  }, [user]);

  const handleCreateRoom = async () => {
    /* if (!topic.trim()) return;
    
    setIsCreating(true);
    try {
      const roomId = await createRoomAsync(user.uid, topic.trim());
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsCreating(false);
    } */
  };

  const handleJoinRoom = () => {
    /*  if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    } */
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Attack</h1>
            <p className="text-gray-300">
              Challenge friends in AI-powered quiz battles!
            </p>
          </div>
          <Button
            onClick={() => {
              // Implement Google Sign-In logic here
              signInWithGoogle();
            }}
            className="w-full bg-gray-200 hover:bg-white p-50 flex items-center justify-center h-12 hover:cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:shadow-md active:scale-95"
          >
            <h3 className="text-gray-900 font-bold ">Sign in with Google</h3>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="flex flex-col justify-center gap-10 align-middle min-h-screen mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Quiz Attack</h1>
          <p className="text-gray-300">Welcome back, {user.displayName}!</p>
          <a
            href="#"
            onClick={logout}
            className="text-sm text-gray-400 hover:underline"
          >
            Logout
          </a>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl w-full self-center h-auto">
          {/* Create Room */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Plus className="w-6 h-6 mr-2" />
              Create Room
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Enter a topic for your quiz..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleCreateRoom}
                disabled={!topic.trim() || isCreating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isCreating ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </Card>
          {/* Join Room */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Join Room
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                className="w-full"
              />
              <Button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Join Room
              </Button>
            </div>
          </Card>
        </div>

        {/* Available Rooms */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Available Rooms
          </h2>
          {roomsLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid gap-4 max-w-2xl mx-auto">
              {!rooms?.length || rooms?.length === 0 ? (
                <Card className="p-6 text-center">
                  <p className="text-gray-300">
                    No rooms available. Create one to get started!
                  </p>
                </Card>
              ) : (
                rooms.map((room) => (
                  <Card
                    key={room.id}
                    className="p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">
                          {room.hostTopic}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Waiting for opponent...
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Join
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h1>HomePage</h1>
      <Button
        onClick={() => {
          // Implement Google Sign-In logic here
          logout();
        }}
        className="w-full bg-white hover:bg-gray-100 p-50 flex items-center justify-center h-12"
      >
        <h3 className="text-gray-900 font-bold ">LOGOUT</h3>
      </Button>
    </div>
  );
}

export default HomePage;
