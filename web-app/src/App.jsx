import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { AuthProvider } from "./contexts/AuthContext";
import { RoomProvider } from "./contexts/RoomContext";
import RoomPage from "./pages/RoomPage";
import BattlePage from "./pages/BattlePage";

function App() {
  return (
    <AuthProvider>
      <RoomProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
              <Route path="/battle/:roomId" element={<BattlePage />} />
              <Route path="/battle" element={<BattlePage />} />
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </RoomProvider>
    </AuthProvider>
  );
}

export default App;
