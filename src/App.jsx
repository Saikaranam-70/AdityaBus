import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import BusTracker from "./components/BusTracker";
import Footer from "./components/Footer";

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("✅ User accepted the install prompt");
    } else {
      console.log("❌ User dismissed the install prompt");
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div>
      <Navbar />
      <BusTracker />
      <Footer />

      {/* Floating "Install App" button */}
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: "fixed",
            bottom: "25px",
            right: "25px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px 18px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            zIndex: 1000,
          }}
        >
          📱 Install App
        </button>
      )}
    </div>
  );
};

export default App;
