import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import app from "./firebase/config.js";

const firebaseApp = app;
console.log("🚀 ~ firebaseApp:", firebaseApp);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
