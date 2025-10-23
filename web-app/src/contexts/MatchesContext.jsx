// contexts/MatchesContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useAuthContext } from "./AuthContext";

const MatchesContext = createContext();

export function MatchesProvider({ children }) {
  const [matches, setMatches] = useState([]);
  const [matchesToDisplay, setMatchesToDisplay] = useState([]);
  const [matchesUserToDisplay, setMatchesUserToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMatches, setUserMatches] = useState([]);
  const { user } = useAuthContext();

  async function getUserMatches(db, user) {
    if (!user?.uid) return [];

    const matchesRef = collection(db, "matches");

    const q1 = query(
      matchesRef,
      where("winnerId", "==", user.uid),
      orderBy("date", "desc"),
      limit(10)
    );

    const q2 = query(
      matchesRef,
      where("loserId", "==", user.uid),
      orderBy("date", "desc"),
      limit(10)
    );

    const [winnerSnap, loserSnap] = await Promise.all([
      getDocs(q1),
      getDocs(q2),
    ]);

    const matches = [
      ...winnerSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      ...loserSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ];

    // remove duplicates and sort by date descending
    const uniqueMatches = Array.from(
      new Map(matches.map((m) => [m.id, m])).values()
    ).sort((a, b) => b.date.toMillis() - a.date.toMillis());

    return uniqueMatches.slice(0, 10);
  }

  const onGetUserMatches = async () => {
    try {
      const result = await getUserMatches(db, user);
      setUserMatches(result);
    } catch (e) {
      console.log("🚀 ~ onGetUserMatches ~ e:", e);
    }
  };

  useEffect(() => {
    onGetUserMatches();
  }, [matches]);

  const matchesToDisplayRef = useRef(matchesToDisplay);
  const matchesUserToDisplayRef = useRef(matchesUserToDisplay);

  useEffect(() => {
    matchesToDisplayRef.current = matchesToDisplay;
  }, [matchesToDisplay]);

  useEffect(() => {
    matchesUserToDisplayRef.current = matchesUserToDisplay;
  }, [matchesUserToDisplay]);

  useEffect(() => {
    if (!userMatches || userMatches.length === 0) return;

    const newMatches = userMatches.filter(
      (m) => !matchesUserToDisplayRef.current.some((pm) => pm.id === m.id)
    );

    if (newMatches.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      const nextMatch = newMatches[index];

      if (!nextMatch) {
        clearInterval(interval);
        return;
      }

      setMatchesUserToDisplay((prev) => [nextMatch, ...prev]);
      index += 1;

      if (index >= newMatches.length) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userMatches]);

  useEffect(() => {
    if (!matches || matches.length === 0) return;

    const newMatches = matches.filter(
      (m) => !matchesToDisplayRef.current.some((pm) => pm.id === m.id)
    );

    if (newMatches.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      const nextMatch = newMatches[index];

      if (!nextMatch) {
        clearInterval(interval);
        return;
      }

      setMatchesToDisplay((prev) => [nextMatch, ...prev]);
      index += 1;

      if (index >= newMatches.length) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [matches]);

  useEffect(() => {
    const q = query(
      collection(db, "matches"),
      orderBy("date", "desc"),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatches(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching matches:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <MatchesContext.Provider
      value={{
        matches,
        matchesToDisplay,
        loading,
        userMatches,
        matchesUserToDisplay,
      }}
    >
      {children}
    </MatchesContext.Provider>
  );
}

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error("useMatches must be used within a MatchesProvider");
  }
  return context;
};
