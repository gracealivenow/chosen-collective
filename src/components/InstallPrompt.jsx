import { useState, useEffect } from 'react';

const RED = '#E8302A';
const WARM_WHITE = '#FFFFFF';
const DARK = '#1A1A1A';

const STORAGE_KEY = 'chosen_install_dismissed';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    if (isStandalone) return;

    // Check if user already dismissed within last 7 days
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) return;
    }

    // Detect iOS (which doesn't fire beforeinstallprompt)
    const ua = window.navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if (iOS) {
      setIsIOS(true);
      setTimeout(() => setShow(true), 3000);
      return;
    }

    // Android/Desktop: listen for the install prompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setShow(false);
    setShowIOSInstructions(false);
  };

  if (!show) return null;

  if (showIOSInstructions) {
    return (
      <div style={s.modalOverlay} onClick={handleDismiss}>
        <div style={s.modal} onClick={(e) => e.stopPropagation()}>
          <div style={s.modalIcon}>📱</div>
          <h2 style={s.modalTitle}>Install on iPhone</h2>
          <p style={s.modalText}>
            <span style={s.step}>1.</span> Tap the <strong>Share</strong> button
            <span style={{ display: 'inline-block', margin: '0 4px', fontSize: 18 }}>⬆</span>
            in Safari
          </p>
          <p style={s.modalText}>
            <span style={s.step}>2.</span> Scroll down and tap <strong>"Add to Home Screen"</strong>
          </p>
          <p style={s.modalText}>
            <span style={s.step}>3.</span> Tap <strong>"Add"</strong> in the top right
          </p>
          <button onClick={handleDismiss} style={s.dismissBtn}>Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.banner}>
      <div style={s.bannerContent}>
        <div style={s.bannerIcon}>✨</div>
        <div style={s.bannerText}>
          <div style={s.bannerTitle}>Add to Home Screen</div>
          <div style={s.bannerSub}>Get The CHOSEN Collective on your phone</div>
        </div>
      </div>
      <div style={s.bannerActions}>
        <button onClick={handleInstall} style={s.installBtn}>Install</button>
        <button onClick={handleDismiss} style={s.laterBtn} aria-label="Dismiss">✕</button>
      </div>
    </div>
  );
}

const s = {
  banner: {
    position: 'fixed',
    bottom: 80,
    left: 12,
    right: 12,
    backgroundColor: WARM_WHITE,
    borderRadius: 18,
    padding: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(232, 48, 42, 0.15)',
    border: `2px solid ${RED}20`,
    zIndex: 90,
    animation: 'slideUp 0.4s ease-out',
  },
  bannerContent: { display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: RED + '15',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, flexShrink: 0,
  },
  bannerText: { minWidth: 0 },
  bannerTitle: { fontSize: 14, fontWeight: 800, color: DARK },
  bannerSub: { fontSize: 12, color: '#777', marginTop: 2 },
  bannerActions: { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 },
  installBtn: {
    backgroundColor: RED, color: WARM_WHITE,
    padding: '10px 18px', borderRadius: 100,
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 800, fontFamily: 'inherit',
    boxShadow: '0 4px 8px rgba(232, 48, 42, 0.3)',
  },
  laterBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F2F0EB', color: '#888',
    border: 'none', cursor: 'pointer',
    fontSize: 14, fontFamily: 'inherit',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  modal: {
    backgroundColor: WARM_WHITE, borderRadius: 24, padding: 30,
    width: '100%', maxWidth: 360, textAlign: 'center',
  },
  modalIcon: { fontSize: 48, marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: 900, color: DARK, margin: '0 0 18px' },
  modalText: {
    fontSize: 14, color: '#555', lineHeight: 1.6,
    margin: '0 0 12px', textAlign: 'left',
  },
  step: { color: RED, fontWeight: 800, marginRight: 6 },
  dismissBtn: {
    width: '100%', marginTop: 18,
    padding: 14, borderRadius: 100,
    backgroundColor: RED, color: WARM_WHITE,
    border: 'none', cursor: 'pointer',
    fontSize: 14, fontWeight: 800, fontFamily: 'inherit',
  },
};