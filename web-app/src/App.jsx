import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomContext";
import RoomPage from "./pages/RoomPage";

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
            </Routes>
          </div>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
