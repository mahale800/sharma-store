import { useEffect, useState } from "react";

let deferredPrompt = null;

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

  useEffect(() => {
    // Determine if app is already installed/running as standalone
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowBanner(false);
      return;
    }

    if (isIOS) {
      setTimeout(() => setShowBanner(true), 2000);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // show banner after delay (better UX)
      setTimeout(() => {
        setShowBanner(true);
      }, 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS]);

  const handleInstallClick = () => {
    setShowModal(true);
  };

  const installApp = async () => {
    if (isIOS) {
      alert("Tap Share → Add to Home Screen");
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("Installed!");
    }

    deferredPrompt = null;
    setShowBanner(false);
    setShowModal(false);
  };

  return (
    <>
      {/* Bottom Banner */}
      {showBanner && (
        <div style={styles.banner}>
          <div>
            <strong>Install Sharma Store</strong>
            <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>
              Get faster access & better experience
            </p>
          </div>
          <button style={styles.button} onClick={handleInstallClick}>
            Install
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={{ color: "#0f172a", marginTop: 0, marginBottom: "8px" }}>Install App</h3>
            <p style={{ color: "#475569", fontSize: "14px", marginBottom: "20px" }}>
              Install Sharma Store for quick access and better performance.
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
              <button style={styles.installBtn} onClick={installApp}>
                Install Now
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  banner: {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    background: "#0f172a", // slate-900
    color: "#fff",
    padding: "16px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 9999,
    boxShadow: "0 -4px 15px rgba(0,0,0,0.1)",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
  },
  button: {
    background: "#f97316", // orange-500
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    width: "90%",
    maxWidth: "320px",
    textAlign: "center",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  installBtn: {
    background: "#0f172a", // slate-900
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    flex: 1,
    cursor: "pointer",
  },
  cancelBtn: {
    background: "#f1f5f9", // slate-100
    color: "#475569", // slate-600
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    flex: 1,
    cursor: "pointer",
  },
};
