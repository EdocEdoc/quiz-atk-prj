import { useEffect, useState, useRef } from "react";
import { useMatches } from "../contexts/MatchesContext";

function MatchesList({ isUserMatches }) {
  const { matchesToDisplay, matchesUserToDisplay } = useMatches();
  const locMatches = isUserMatches ? matchesUserToDisplay : matchesToDisplay;

  return (
    <>
      {locMatches?.length > 0 && (
        <h2 className="text-lg font-semibold mb-5 text-center">
          {isUserMatches ? "Your " : "Global "}Matches
        </h2>
      )}
      <ul>
        {locMatches &&
          locMatches.map((match) => (
            <li
              key={match.id}
              className="p-3 rounded-xl border border-gray-700 hover:bg-gray-800/60 mb-2 
             transform transition-all duration-500 ease-out
             opacity-0 -translate-y-4 animate-fade-in-up"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold ">
                  {match.winnerName || "Unknown"} 🏆
                </span>
                <span className="text-xs text-gray-500">
                  vs {match.loserName || "Opponent"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Room: <span className="font-mono">{match.roomId}</span>
              </p>
            </li>
          ))}
      </ul>
    </>
  );
}

export default MatchesList;
