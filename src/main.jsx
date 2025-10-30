import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch((err) => console.error('❌ Service Worker registration failed:', err));
  });
}


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
