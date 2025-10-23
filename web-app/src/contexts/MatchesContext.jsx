// contexts/MatchesContext.jsx
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

const MatchesContext = createContext();

export function MatchesProvider({ children }) {
  const [matches, setMatches] = useState([]);
  const [matchesToDisplay, setMatchesToDisplay] = useState([]);
  const [loading, setLoading] = useState(true);
  const matchesToDisplayRef = useRef(matchesToDisplay);

  useEffect(() => {
    matchesToDisplayRef.current = matchesToDisplay;
  }, [matchesToDisplay]);

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
      limit(10)
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
    <MatchesContext.Provider value={{ matches, matchesToDisplay, loading }}>
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
