import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { GAME_STATUS } from "../utils/types";

export const useRoom = (roomId) => {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [battleLogs, setBattleLogs] = useState(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "rooms", roomId),
      (doc) => {
        if (doc.exists()) {
          setRoom({ id: doc.id, ...doc.data() });
          setError(null);
        } else {
          setError("Room not found");
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    let unsubscribeBattleLogs = null;

    if (room && room.status === GAME_STATUS.BATTLE) {
      const battleLogsRef = collection(db, "rooms", room.id, "battleLog");
      unsubscribeBattleLogs = onSnapshot(
        battleLogsRef,
        (snapshot) => {
          const logs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          // 🔹 Sort by timestamp descending (latest first)
          const sortedLogs = logs.sort((a, b) => {
            const aTime = a.timestamp?.toMillis
              ? a.timestamp.toMillis()
              : a.timestamp;
            const bTime = b.timestamp?.toMillis
              ? b.timestamp.toMillis()
              : b.timestamp;
            return bTime - aTime; // 👈 reversed order
          });

          setBattleLogs(sortedLogs);
        },
        (err) => {
          console.error("Error listening to battleLogs:", err);
          setError(err.message);
        }
      );
    } else {
      // Clear logs when leaving battle phase
      setBattleLogs([]);
    }

    // Clean up listener
    return () => {
      if (unsubscribeBattleLogs) unsubscribeBattleLogs();
    };
  }, [room]);

  return { room, battleLogs, loading, error };
};

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "rooms"),
      where("status", "==", GAME_STATUS.WAITING),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const roomsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRooms(roomsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching rooms:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { rooms, loading };
};

export const createRoomAsync = async (hostId, hostTopic) => {
  try {
    const roomData = {
      hostId,
      guestId: null,
      status: "waiting",
      hostTopic,
      guestTopic: null,
      finalTopic: null,
      lecture: null,
      quizList: [],
      currentTurn: "host",
      currentAction: "attack",
      hp: { host: 10, guest: 10 },
      createdAt: new Date(),
    };
    const docRef = await addDoc(collection(db, "rooms"), roomData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

export const joinRoom = async (roomId, guestId, guestTopic) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      guestId,
      guestTopic,
      status: GAME_STATUS.GENERATING,
    });
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};

export const retryGenerate = async (roomId, retryCount) => {
  console.log("🚀 ~ retryGenerate ~ retryCount:", retryCount);
  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      status: GAME_STATUS.GENERATING,
      retryCount: retryCount,
    });
  } catch (error) {
    console.error("Error retry generate topic room:", error);
    throw error;
  }
};

export const startBattle = async (roomId, guestId) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await updateDoc(roomRef, {
      status: GAME_STATUS.BATTLE,
      currentTurn:
        guestId == "AI" ? "host" : Math.random() > 0.5 ? "host" : "guest",
    });
  } catch (error) {
    console.error("Error starting battle:", error);
    throw error;
  }
};

export const deleteRoom = async (roomId) => {
  try {
    const roomRef = doc(db, "rooms", roomId);
    await deleteDoc(roomRef);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};
