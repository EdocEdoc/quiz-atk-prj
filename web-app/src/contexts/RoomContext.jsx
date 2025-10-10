import { createContext, useContext, useState } from 'react';

const RoomContext = createContext();

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const value = {
    currentRoom,
    setCurrentRoom,
    currentQuestion,
    setCurrentQuestion
  };

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
};
