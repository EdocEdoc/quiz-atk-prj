import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { Plus, Trash2Icon, Users, Zap } from "lucide-react";
import Button from "../components/ui/Button";
import { useAuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import {
  createRoomAsync,
  useRoom,
  useRooms,
  deleteRoom,
} from "../hooks/useRoom";
import useBackgroundMusic from "../hooks/useBackgroundMusic";
import { setBackgroundMusicInstance } from "../utils/soundManager";

import bgMusic from "../assets/bgMusic.mp3";

const MAX_TOPIC_LENGTH = 100;

function HomePage() {
  const {
    user,
    loading: authLoading,
    signInWithGoogle,
    logout,
  } = useAuthContext();

  const { room, loading: roomLoading } = useRoom();
  const { rooms, loading: roomsListLoading } = useRooms();
  const [topic, setTopic] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const [setshowRoomCreateJoin, setSetshowRoomCreateJoin] = useState(true);

  const bgInstance = useBackgroundMusic(bgMusic, { loop: true, volume: 0.2 });

  /* useEffect(() => {
    const sound = new Howl({
      src: [bgMusic],
      loop: true,
      volume: 0.2,
      html5: true,
    });
    setMusic(sound);
  }, []);
 */
  /* useEffect(() => {
    if (music) {
      const startMusic = () => {
        music.play();
        window.removeEventListener("click", startMusic);
      };
      window.addEventListener("click", startMusic);
    }
  }, []); */

  useEffect(() => {
    if (bgInstance) {
      setBackgroundMusicInstance(bgInstance);
    }
    return () => {
      console.log("🚀 ~ HomePage ~ unmount");
    };
  }, []);

  useEffect(() => {
    if (rooms && rooms.length > 0 && user) {
      const myRoom = rooms.find((r) => r.hostId === user.uid);
      if (myRoom) {
        setSetshowRoomCreateJoin(false);
      } else {
        setSetshowRoomCreateJoin(true);
      }
    }
  }, [rooms]);

  const handleCreateRoom = async () => {
    if (!topic.trim()) return;

    setIsCreating(true);
    try {
      const roomId = await createRoomAsync(user.uid, topic.trim());
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  const handleDeleteRoom = (roomId) => {
    // Implement room deletion logic here
    console.log("Delete room with ID:", roomId);
    deleteRoom(roomId);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  /* return <Battlefield />; */

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Quiz Attack</h1>
            <p className="text-gray-300">
              Challenge friends in AI-powered quiz battles!
            </p>
            <p className="text-gray-400">v1.4.1</p>
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
    <div className="min-h-screen">
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

        {setshowRoomCreateJoin && (
          <div className="grid md:grid-cols-2 gap-8 max-w-7xl w-full self-center h-auto items-start">
            {/* Create Room */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Plus className="w-6 h-6 mr-2" />
                Create Room
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    Topic ({topic.length}/{MAX_TOPIC_LENGTH})
                  </label>
                  <Input
                    placeholder="Enter a topic for your quiz..."
                    value={topic}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= MAX_TOPIC_LENGTH) {
                        setTopic(value);
                      }
                    }}
                    maxLength={MAX_TOPIC_LENGTH}
                    className="w-full"
                  />
                  {topic.length >= MAX_TOPIC_LENGTH && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Maximum character limit reached
                    </p>
                  )}
                </div>
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
        )}

        {/* Available Rooms */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Available Rooms
          </h2>
          {roomsListLoading ? (
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
                    className="p-4 hover:bg-gray-800 transition-colors "
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-semibold">
                          {room.hostTopic}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {room.hostId === user.uid &&
                            "Come back to your room. "}
                          Waiting for opponent...
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className={
                          room.hostId === user.uid
                            ? " bg-green-600 hover:bg-green-700 cursor-pointer ml-10"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        }
                        onClick={() => navigate(`/room/${room.id}`)}
                      >
                        Join
                      </Button>
                      {room.hostId === user.uid && (
                        <Trash2Icon
                          className="w-5 h-5 text-red-500 hover:text-red-700 cursor-pointer ml-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id);
                          }}
                        />
                      )}
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
