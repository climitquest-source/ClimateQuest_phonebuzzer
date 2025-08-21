/* Client-side script for phone buzzers.
 *
 * Users join a room using a 6-character code, select their team, and press
 * the BUZZ button when the host opens buzzing. This script reads the
 * Firebase config from assets/fb-config.json and looks up team details in
 * the room metadata. It listens for open/close events on the room and
 * enables/disables the buzz button accordingly.
 */
(function() {
  // DOM elements
  const roomInput   = document.getElementById('room');
  const nameInput   = document.getElementById('name');
  const teamSelect  = document.getElementById('team');
  const joinBtn     = document.getElementById('join-btn');
  const joinStatus  = document.getElementById('joinStatus');
  const joinCard    = document.getElementById('join-card');
  const buzzCard    = document.getElementById('buzz-card');
  const buzzBtn     = document.getElementById('buzz-btn');
  const buzzHeader  = document.getElementById('buzz-header');
  const buzzStatus  = document.getElementById('buzzStatus');
  const leaveBtn    = document.getElementById('leave-btn');
  // Firebase state
  let fbApp = null;
  let db = null;
  let roomRef = null;
  let playersRef = null;
  let pressesRef = null;
  let openRef = null;
  let userId = null;
  // Helper to generate random id for players
  function randomId() {
    const chars = "abcdef0123456789";
    let s = "";
    for (let i = 0; i < 16; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }
  // Load Firebase config once and initialize app
  async function initFirebase() {
    if (fbApp) return;
    const resp = await fetch('assets/fb-config.json');
    if (!resp.ok) throw new Error('Failed to load config');
    const cfg = await resp.json();
    fbApp = firebase.initializeApp(cfg, 'buzzerApp');
    db = firebase.database(fbApp);
    // Anonymous auth to satisfy security rules when required. If auth isn't
    // enabled or not required, this will silently fail and is safe to ignore.
    try {
      const auth = firebase.auth(fbApp);
      await auth.signInAnonymously();
    } catch (e) {
      console.warn('Anon auth failed (client)', e);
    }
  }
  // Prefill form if hash present
  function prefill() {
    const hash = location.hash;
    if (hash && hash.length > 1) {
      const code = hash.substring(1);
      roomInput.value = code.toUpperCase();
      // Automatically fetch teams for this room so the team dropdown
      // populates even before the user presses Join. This improves UX when
      // arriving via a URL with the code hash.
      populateTeams(code.toUpperCase()).catch(() => {});
    }
  }
  // Populate team dropdown by reading team metadata from room
  async function populateTeams(code) {
    await initFirebase();
    const teamsSnap = await db.ref('rooms/' + code + '/teams').get();
    if (!teamsSnap.exists()) return null;
    const teams = teamsSnap.val() || [];
    // Clear existing options
    teamSelect.innerHTML = '';
    teams.forEach((team, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = team.name;
      teamSelect.appendChild(opt);
    });
    return teams;
  }
  // Join the room: write player record and set up listeners
  async function joinRoom() {
    const code = roomInput.value.trim().toUpperCase();
    const name = (nameInput.value.trim() || 'Player').slice(0, 18);
    const teamIdx = parseInt(teamSelect.value || '0', 10);
    if (!code) {
      joinStatus.textContent = "Enter a room code.";
      joinStatus.style.color = "#dc3545";
      return;
    }
    // Verify room exists and fetch teams for colour
    const teams = await populateTeams(code);
    if (!teams) {
      joinStatus.textContent = "Room not found.";
      joinStatus.style.color = "#dc3545";
      return;
    }
    const team = teams[teamIdx] || teams[0];
    try {
      await initFirebase();
      roomRef = db.ref('rooms/' + code);
      playersRef = roomRef.child('players');
      pressesRef = roomRef.child('presses');
      openRef    = roomRef.child('open');
      // Generate unique ID for this player
      userId = randomId();
      // Write player record
      await playersRef.child(userId).set({ name, team: teamIdx, joined: Date.now() });
      // Update UI: hide join card, show buzz card
      joinCard.style.display = 'none';
      buzzCard.style.display = 'block';
      // Update header with player/team name
      buzzHeader.textContent = `${name} – ${team.name}`;
      // Colour the buzz button to match team
      buzzBtn.style.backgroundColor = team.color || '#386fa4';
      // Listen to openRef to enable/disable buzzing
      openRef.on('value', snap => {
        const isOpen = !!snap.val();
        buzzBtn.disabled = !isOpen;
        buzzStatus.textContent = isOpen ? "Buzzers OPEN" : "Buzzers locked";
      });
      // Press logic: avoid spamming by limiting to once per open window
      let pressedForThisOpen = false;
      buzzBtn.addEventListener('click', async () => {
        if (pressedForThisOpen) return;
        pressedForThisOpen = true;
        try {
          await pressesRef.push({ team: teamIdx, name, ts: firebase.database.ServerValue.TIMESTAMP });
        } catch(e) {
          // ignore errors
        }
        setTimeout(() => { pressedForThisOpen = false; }, 2500);
      });
      // Leave logic
      leaveBtn.addEventListener('click', async () => {
        try { await playersRef.child(userId).remove(); } catch(e){}
        try { fbApp && fbApp.delete(); } catch(e){}
        location.href = location.pathname;
      });
      joinStatus.textContent = "";
    } catch (e) {
      console.error(e);
      joinStatus.textContent = "Could not join. Check connection.";
      joinStatus.style.color = "#dc3545";
    }
  }
  // Hook up UI handlers when DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    prefill();
    // When the user enters a code manually and leaves the input, fetch teams
    roomInput.addEventListener('change', async () => {
      const code = roomInput.value.trim().toUpperCase();
      if (code) {
        await populateTeams(code);
      }
    });
    joinBtn.addEventListener('click', joinRoom);
  });
})();