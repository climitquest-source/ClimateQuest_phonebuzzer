/* Host-side phone buzzer integration using Firebase.
 *
 * This script loads the Firebase configuration from assets/fb-config.json,
 * creates a room on demand, publishes the team names to the database and
 * exposes functions to open and close remote buzzing for each question.
 * It relies on a small QR placeholder (drawFakeQR) to present a join link.
 */
(function() {
  // Persistent state for the current Firebase room
  let fbApp = null;
  let db = null;
  let roomRef = null;
  let openRef = null;
  let pressesRef = null;
  // Fetch the configuration JSON only once
  async function loadConfig() {
    if (window._phoneCfg) return window._phoneCfg;
    const resp = await fetch('assets/fb-config.json');
    if (!resp.ok) throw new Error('Failed to load Firebase config');
    const cfg = await resp.json();
    window._phoneCfg = cfg;
    return cfg;
  }
  // Initialise Firebase if not already done
  async function initFirebase() {
    if (fbApp) return;
    const cfg = await loadConfig();
    fbApp = firebase.initializeApp(cfg, 'hostApp');
    db = firebase.database(fbApp);
    // Sign in anonymously so Realtime Database reads/writes are allowed on
    // projects where auth is required. This will no‑op on projects where
    // rules do not require authentication.
    try {
      // For named app, get the auth instance and sign in
      const auth = firebase.auth(fbApp);
      await auth.signInAnonymously();
    } catch (e) {
      // Ignore errors (for example if auth is not enabled or not required)
      console.warn('Anon auth failed (host)', e);
    }
  }
  // Generate a random 6‑character room code from uppercase letters/digits
  function genCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for (let i = 0; i < 6; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }
  // Create a room on demand and publish team data. Exposed to index.html.
  async function createRoom() {
    await initFirebase();
    // Generate a new code and set up DB references
    const code = genCode();
    roomRef = db.ref('rooms/' + code);
    // Compose team data from the global `teams` array defined in app.js.
    const teamData = (window.teams || []).map((t, idx) => ({
      name: t.name,
      color: t.color,
      index: idx
    }));
    // Write initial room data: not open yet, no presses, and teams info
    await roomRef.set({
      open: false,
      created: Date.now(),
      teams: teamData
    });
    // Set child references for later use
    openRef = roomRef.child('open');
    pressesRef = roomRef.child('presses');
    // Update the UI with code, URL and QR
    const codeSpan = document.getElementById('phone-room-code');
    const urlSpan  = document.getElementById('join-url');
    const infoDiv  = document.getElementById('phone-room-info');
    if (codeSpan && urlSpan && infoDiv) {
      codeSpan.textContent = code;
      // Build join URL by replacing index.html with buzzer.html and adding hash
      const basePath = window.location.pathname.replace(/index\.html$/, '');
      const joinUrl = window.location.origin + basePath + 'buzzer.html#' + code;
      urlSpan.textContent = joinUrl;
          // Generate a real QR code image using a public API. We don't rely
          // on drawFakeQR here so players can scan the code directly.
          const qrEl = document.getElementById('phone-qr');
          if (qrEl) {
            qrEl.src =
              'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' +
              encodeURIComponent(joinUrl);
          }
          infoDiv.style.display = 'block';
    }
    return code;
  }
  // Open buzzing for the current question. Resets previous presses.
  function openRemote() {
    if (!openRef || !pressesRef) return;
    // Clear previous presses and signal open = true
    pressesRef.set(null);
    openRef.set(true);
    // Listen for new presses and forward them to the host app
    pressesRef.off('child_added');
    pressesRef.on('child_added', (snap) => {
      const press = snap.val();
      if (!press || typeof press.team !== 'number') return;
      // Invoke a callback on the host page if defined
      if (typeof window.remotePress === 'function') {
        window.remotePress(press.team);
      }
    });
  }
  // Close buzzing after a question ends. Stops listening to presses.
  function closeRemote() {
    if (!openRef) return;
    openRef.set(false);
    if (pressesRef) {
      pressesRef.off('child_added');
    }
  }
  // Expose API on the window for use in app.js and index.html
  window.phones = {
    createRoom,
    openRemote,
    closeRemote
  };
})();