// Game logic for Cli‑Mit Quest host screen.
// This script defines the question pack, team setup, and board logic for
// the offline host experience. It supports choosing between two and four
// teams and naming them, toggling answer visibility, and only marking a
// clue as used when a correct answer is awarded.

// ===================== Data definitions =====================
// A single pack containing five categories with five questions each.
// Each question has a value, prompt and answer. All values are doubles
// (200–1000) as requested.
const PACK = {
  categories: [
    {
      name: "Waste Management",
      questions: [
        {
          value: 200,
          question: "Name the three 'R's that summarize best practices for reducing waste.",
          answer: ["Reduce", "Reuse", "Recycle"],
          explanation: [
            "Reduce: cut down on what you consume to avoid excess waste.",
            "Reuse: find new uses for items instead of discarding them.",
            "Recycle: process materials so they can be made into new products."
          ]
        },
        {
          value: 400,
          question: "In Toronto, where can you safely dispose of used household batteries?",
          answer: ["City drop‑off depots", "Community environment days"],
          explanation: [
            "City of Toronto drop‑off depots accept household batteries.",
            "Community environment days offer collection sites for safe disposal."
          ]
        },
        {
          value: 600,
          question: "In Toronto, where should a greasy pizza box that can’t be recycled be placed?",
          answer: ["Green bin"],
          explanation: [
            "Food‑soiled cardboard cannot be recycled.",
            "Contaminated pizza boxes go in the green organics bin."
          ]
        },
        {
          value: 800,
          question: "In Toronto’s waste system, which bin should disposable coffee cups go into?",
          answer: ["Green bin"],
          explanation: [
            "Lined paper cups cannot be recycled.",
            "Put the cup in the green bin; sort the lid and sleeve separately."
          ]
        },
        {
          value: 1000,
          question: "What’s the best way to dispose of a small amount of used cooking oil at home?",
          answer: ["Soak with kitchen paper", "Place paper in the green bin"],
          explanation: [
            "Let the oil cool before handling.",
            "Use paper towel to soak up the oil.",
            "Place the towel in the green bin; larger quantities should be taken to a drop‑off depot."
          ]
        }
      ]
    },
    {
      name: "Prepare for Climate Emergencies",
      questions: [
        {
          value: 200,
          question: "The current climate crisis is primarily the result of global _________.",
          answer: ["Warming"],
          explanation: [
            "Greenhouse gases trap heat in the atmosphere.",
            "Human activities have caused global temperatures to rise."
          ]
        },
        {
          value: 400,
          question: "What type of extreme weather typically prompts cities to open ‘cooling centres’?",
          answer: ["Heatwaves"],
          explanation: [
            "Cooling centres provide safe, air‑conditioned places during extreme heat.",
            "They help prevent heat‑related illnesses and deaths."
          ]
        },
        {
          value: 600,
          question: "What energy source currently provides the majority of Ontario’s electricity?",
          answer: ["Nuclear"],
          explanation: [
            "Ontario relies on several nuclear generating stations.",
            "Nuclear plants supply most of the province’s electricity output."
          ]
        },
        {
          value: 800,
          question: "During a tornado, where is the safest place to take shelter?",
          answer: ["Basement", "Interior room on the lowest floor away from windows"],
          explanation: [
            "Go below ground if possible, such as into a basement.",
            "If no basement exists, choose an interior room on the lowest floor and stay away from windows."
          ]
        },
        {
          value: 1000,
          question: "In stormwater management, where should your home’s downspouts drain?",
          answer: ["Two metres from the foundation", "Away from the city's sewer system"],
          explanation: [
            "Disconnect downspouts from the municipal sewer system.",
            "Extend downspouts to discharge at least two metres from the building.",
            "Use a splash pad, rain barrel or garden to absorb runoff."
          ]
        }
      ]
    },
    {
      name: "Community Gardens",
      questions: [
        {
          value: 200,
          question: "What type of shared space can provide a sustainable food source for a neighbourhood?",
          answer: ["Community garden"],
          explanation: [
            "Neighbours share a plot of land to grow fruits, vegetables and herbs.",
            "Community gardens increase access to fresh produce and build social ties."
          ]
        },
        {
          value: 400,
          question: "What process adds kitchen scraps and yard waste back into the soil to enrich it?",
          answer: ["Composting"],
          explanation: [
            "Organic waste is broken down by microorganisms.",
            "The resulting humus improves soil fertility and structure."
          ]
        },
        {
          value: 600,
          question: "Name three popular vegetables commonly grown in Toronto’s community gardens.",
          answer: ["Lettuce", "Tomatoes", "Peppers"],
          explanation: [
            "Leafy greens: lettuce, kale, swiss chard.",
            "Fruiting crops: tomatoes, peppers, beans.",
            "Root crops: beets, carrots.",
            "Vining crops: cucumbers, squash, zucchini."
          ]
        },
        {
          value: 800,
          question: "List some community garden locations in Toronto.",
          answer: ["Wychwood Barns", "Eglinton Park", "Rockcliffe Demonstration Gardens"],
          explanation: [
            "Wychwood Barns Community Garden.",
            "MFRC Gardens.",
            "Eglinton Park Community Garden.",
            "Rockcliffe Demonstration and Teaching Garden.",
            "Emmett Avenue and New Horizons Community Gardens.",
            "Gate House Transformational Healing Garden."
          ]
        },
        {
          value: 1000,
          question: "What key considerations and steps should you take when starting a community garden?",
          answer: ["Choose a sunny, accessible site", "Involve the community"],
          explanation: [
            "Site suitability: sunlight, soil health, and adequate space.",
            "Resource availability: water source, tools and materials.",
            "Community engagement: participation, accessibility and shared maintenance.",
            "Purpose: decide whether the focus is food production, education or community building.",
            "Budgeting: plan the costs for building beds, soil, seeds and ongoing upkeep."
          ]
        }
      ]
    },
    {
      name: "Sustainability",
      questions: [
        {
          value: 200,
          question: "Urban gardens support biodiversity by attracting which vital pollinators?",
          answer: ["Bees"],
          explanation: [
            "Bees pollinate many crops and wild plants.",
            "Without bees, fruit and vegetable yields would decline."
          ]
        },
        {
          value: 400,
          question: "Growing food locally reduces greenhouse‑gas emissions and therefore lowers your ______.",
          answer: ["Carbon footprint"],
          explanation: [
            "Local food doesn’t travel long distances by truck or plane.",
            "Less transportation means fewer fossil‑fuel emissions."
          ]
        },
        {
          value: 600,
          question: "Name three environmentally friendly ways to commute.",
          answer: ["Walking", "Cycling", "Public transit"],
          explanation: [
            "Walking requires no fuel and emits no greenhouse gases.",
            "Cycling is a zero‑emission mode of transport.",
            "Public transit moves many people at once, reducing per‑person emissions."
          ]
        },
        {
          value: 800,
          question: "What collective name do the UN’s 17 goals, adopted in 2015, go by?",
          answer: ["Sustainable Development Goals (SDGs)"],
          explanation: [
            "The SDGs cover 17 areas, including poverty, health, education and climate action.",
            "They provide a blueprint for a more sustainable and equitable world by 2030."
          ]
        },
        {
          value: 1000,
          question: "What economic model aims to eliminate waste by keeping resources in use through reuse, repair and recycling?",
          answer: ["Circular Economy"],
          explanation: [
            "Designs products for durability, reuse and repair.",
            "Keeps materials circulating rather than sending them to landfill."
          ]
        }
      ]
    },
    {
      name: "Food Security",
      questions: [
        {
          value: 200,
          question: "True or False: Food security means people lack access to affordable food.",
          answer: ["False"],
          explanation: [
            "Food security means people have reliable access to sufficient, safe and nutritious food.",
            "Food insecurity is when those conditions are not met."
          ]
        },
        {
          value: 400,
          question: "How does food insecurity differ from hunger?",
          answer: [
            "Food insecurity: lack of reliable access to sufficient, affordable, nutritious food",
            "Hunger: the physical sensation of not having enough food"
          ],
          explanation: [
            "Food insecurity describes a social and economic condition.",
            "Hunger is a biological feeling that can result from food insecurity but also from other factors."
          ]
        },
        {
          value: 600,
          question: "How does the United Nations define food security?",
          answer: [
            "Access to sufficient, safe and nutritious food",
            "Physical, social and economic access",
            "Available at all times"
          ],
          explanation: [
            "Food must be sufficient, safe and culturally appropriate.",
            "Access can be physical, social or economic.",
            "Food security is continuous – it must be maintained at all times."
          ]
        },
        {
          value: 800,
          question: "Which parts of Toronto face the greatest potential challenges in accessing food?",
          answer: ["Inner-city suburbs", "Priority Investment Neighbourhoods (PINs)"],
          explanation: [
            "These areas often lack full‑service grocery stores.",
            "Higher poverty rates and limited transit make food access more difficult."
          ]
        },
        {
          value: 1000,
          question: "Which groups in Toronto are most at risk of food insecurity?",
          answer: [
            "Racialized people (especially Black communities)",
            "Indigenous people",
            "2SLGBTQIA+ community members",
            "Low-income individuals and families",
            "People on social assistance",
            "People living with disabilities",
            "Renters",
            "Lone-parent households",
            "Recent newcomers"
          ],
          explanation: [
            "Racialized people (especially Black communities)",
            "Indigenous people",
            "Members of the 2SLGBTQIA+ community",
            "Individuals and families with low income",
            "People receiving social assistance (e.g., Ontario Works, ODSP)",
            "People living with disabilities",
            "Renters, as opposed to homeowners",
            "Households led by lone parents, particularly female heads",
            "Recent newcomers to Canada"
          ]
        }
      ]
    }
  ],
  final_question: {
    question: "Which Canadian program launched in 2019 seeks to reduce household food insecurity by improving access to nutritious food for school‑aged children?",
    answer: ["Canada Food Policy / National School Food Program"],
    explanation: [
      "The Canada Food Policy introduces a National School Food Program.",
      "It aims to ensure all children have access to healthy meals and reduce household food insecurity."
    ]
  }
};

// Default colours for up to four teams. Teams are created dynamically using these
// values when the host picks the number of teams. If more than four teams are
// desired in the future, extend this array accordingly.
const COLOUR_OPTIONS = [
  { defaultName: 'Green', color: '#2d6a4f' },
  { defaultName: 'Blue', color: '#386fa4' },
  { defaultName: 'Yellow', color: '#e9c46a' },
  { defaultName: 'Red', color: '#e76f51' }
];

// Teams array (populated during game setup). Each team has a name, colour
// and score. It is empty until the host chooses the number of teams.
let teams = [];

// Current state while a question is open. We track the category/question
// object, the cell element being asked, which team (if any) is selected
// and whether the answer is visible.
let currentQuestion = null;
let selectedTeamIdx = null;
let answerVisible = false;

// Timer variables for the two‑stage timing system. Reading timers handle
// the initial 10‑second reading period before buzzers open. Answer timers
// provide 20 seconds for the selected team to respond. Each timer has
// both a timeout and an interval for updating the on‑screen countdown.
let readingTimer = null;
let readingInterval = null;
let answerTimer = null;
let answerInterval = null;
let answerWarningTimeout = null;
let answerTimerRunning = false;

// ===================== Sound player =====================
// Simple beep sound generator using Web Audio API. Each type uses a
// different frequency and duration to distinguish events. Volume is
// kept low to avoid startling the audience and to remain instrument‑free.
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    let freq = 440; // default mid tone
    let duration = 0.2;
    switch (type) {
      case 'correct':
        freq = 880; // high tone
        duration = 0.25;
        break;
      case 'wrong':
        freq = 220; // low tone
        duration = 0.25;
        break;
      case 'timer-warning':
        freq = 660;
        duration = 0.15;
        break;
      case 'timer-end':
        freq = 300;
        duration = 0.3;
        break;
      case 'timer-start':
        freq = 550;
        duration = 0.2;
        break;
      default:
        break;
    }
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Fail silently if Web Audio API is not available
    console.warn('Unable to play sound:', e);
  }
}

// Allow phones.js to select a team when a remote player buzzes in.
// phones.js will call window.remotePress(teamIndex) when a player presses
// the BUZZ button on their phone. If a question is open and no team has
// been selected yet, this function selects the given team and highlights it.
window.remotePress = function(teamIndex) {
  // Ensure a question is open and no team has been chosen yet
  if (!currentQuestion || selectedTeamIdx !== null) return;
  const buttons = document.querySelectorAll('#team-select .team-button');
  if (teamIndex >= 0 && teamIndex < buttons.length) {
    buttons[teamIndex].click();
  }
};

// ===================== Timer and Summary =====================
// Start a countdown timer for the current question. Displays the remaining
// time in the modal and automatically finishes the question when time
// expires. Duration is in milliseconds.
// The legacy startTimer function is no longer used in this version. Timing
// is handled by a two‑stage system: a 10‑second reading period and a
// 20‑second answer period. The functions below implement these timers.

// Clear any running reading timers and remove the timer display. This
// is called whenever a question finishes or is dismissed.
function clearReadingTimer() {
  clearTimeout(readingTimer);
  clearInterval(readingInterval);
  readingTimer = null;
  readingInterval = null;
}

// Clear any running answer timers and reset related state. Removes the
// countdown from the display and resets answerTimerRunning so a new
// timer can start on the next buzz.
function clearAnswerTimer() {
  clearTimeout(answerTimer);
  clearInterval(answerInterval);
  clearTimeout(answerWarningTimeout);
  answerWarningTimeout = null;
  const display = document.getElementById('timer-display');
  if (display) display.textContent = '';
  answerTimer = null;
  answerInterval = null;
  answerTimerRunning = false;
}

// Begin the 20‑second timer for the selected team. This is only called
// after a team buzzes in. It updates the countdown every second and
// automatically triggers a burnout when time expires. A start sound is
// played when the timer begins.
function startAnswerTimer() {
  if (answerTimerRunning) return;
  answerTimerRunning = true;
  let remaining = 20;
  const display = document.getElementById('timer-display');
  if (display) display.textContent = `Time left: ${remaining}s`;
  // Play a distinctive sound to indicate that answer time has begun
  playSound('timer-start');
  answerInterval = setInterval(() => {
    remaining--;
    if (remaining >= 0 && display) {
      display.textContent = `Time left: ${remaining}s`;
    }
  }, 1000);
  // Schedule a warning sound 5 seconds before time expires (at 15 seconds)
  answerWarningTimeout = setTimeout(() => {
    playSound('timer-warning');
  }, 15000);
  answerTimer = setTimeout(() => {
    // When answer time ends, mark the question as burned out and play a sound
    playSound('timer-end');
    finishQuestion(true);
  }, 20000);
}

// Clear any running timer and countdown display. Called when question
// finishes due to correct answer, burnout or manual close.
function clearTimer() {
  clearTimeout(questionTimer);
  clearInterval(countdownInterval);
  const display = document.getElementById('timer-display');
  if (display) display.textContent = '';
  questionTimer = null;
  countdownInterval = null;
}

// Check if all questions on the board have been used. If so, show
// the summary modal with final scores.
function checkGameEnd() {
  const remainingCells = document.querySelectorAll('#board .cell:not(.category):not(.used)');
  if (remainingCells.length === 0) {
    showSummary();
  }
}

// Display the final scores and ranking. Sort teams by descending score
// and populate the list. Show the summary modal and hide the main board.
function showSummary() {
  const summaryModal = document.getElementById('summary-modal');
  const list = document.getElementById('final-scores');
  if (!summaryModal || !list) return;
  list.innerHTML = '';
  // Sort teams by score descending
  const sorted = teams.slice().sort((a, b) => b.score - a.score);
  sorted.forEach((team, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${team.name}: ${team.score} pts`;
    list.appendChild(li);
  });
  summaryModal.classList.remove('hidden');
  // Hide board and scoreboard to focus on summary
  const board = document.getElementById('board');
  const scoreboard = document.getElementById('scoreboard');
  if (board) board.style.display = 'none';
  if (scoreboard) scoreboard.style.display = 'none';
  // Attach Play Again handler
  const playAgainBtn = document.getElementById('play-again-btn');
  if (playAgainBtn) {
    playAgainBtn.onclick = () => {
      // Reload the page to reset state entirely
      window.location.href = 'play.html';
    };
  }
}

// Entry point: once the DOM is ready, prepare the team setup form and
// modal handlers.
document.addEventListener('DOMContentLoaded', () => {
  setupTeamForm();
  setupModalHandlers();
});

// ===================== Setup: Team selection =====================
// Build the team selection interface. The host selects the number of
// participating teams (2–4) and optionally renames them. When Start Game
// is clicked, the scoreboard and game board are built and the overlay is
// hidden.
function setupTeamForm() {
  const teamCountSelect = document.getElementById('team-count');
  const teamNamesContainer = document.getElementById('team-names');
  const toPhoneBtn = document.getElementById('to-phone-step');
  const startGameBtn = document.getElementById('start-game-btn');

  // Helper to build input boxes according to the selected team count
  function buildNameInputs(count) {
    teamNamesContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const label = document.createElement('label');
      label.textContent = `Team ${i + 1} name:`;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = COLOUR_OPTIONS[i].defaultName;
      input.id = `team-name-${i}`;
      label.appendChild(input);
      teamNamesContainer.appendChild(label);
    }
  }

  // Initialise with the default selected value (initially 2)
  buildNameInputs(parseInt(teamCountSelect.value));

  // When the number of teams changes, rebuild the name inputs
  teamCountSelect.addEventListener('change', () => {
    const count = parseInt(teamCountSelect.value);
    buildNameInputs(count);
  });

  // Transition from team setup to phone setup.  When only one team is
  // selected, phone buzzers are unnecessary. In that case we skip
  // directly to starting the game (single‑player mode). Otherwise we
  // proceed to the phone step for multiplayer mode.
  if (toPhoneBtn) {
    toPhoneBtn.addEventListener('click', () => {
      const count = parseInt(teamCountSelect.value);
      const teamStep = document.getElementById('team-step');
      const phoneStep = document.getElementById('phone-step');
      if (count === 1) {
        // Single player: build teams, start game immediately.
        teams = [];
        for (let i = 0; i < count; i++) {
          const input = document.getElementById(`team-name-${i}`);
          const name = input && input.value ? input.value.trim() : COLOUR_OPTIONS[i].defaultName;
          const { color } = COLOUR_OPTIONS[i];
          teams.push({ name, color, score: 0 });
        }
        window.teams = teams;
        buildScoreboard();
        buildBoard();
        // Hide overlay and show instructions
        const overlay = document.getElementById('setup-modal');
        if (overlay) overlay.style.display = 'none';
        const instructions = document.getElementById('instructions');
        if (instructions) instructions.style.display = 'block';
      } else {
        // Multiplayer: show phone step
        if (teamStep) teamStep.style.display = 'none';
        if (phoneStep) phoneStep.style.display = 'block';
      }
    });
  }

  // Start the game: gather names/colours, build UI and hide overlay
  startGameBtn.addEventListener('click', () => {
    const count = parseInt(teamCountSelect.value);
    teams = [];
    for (let i = 0; i < count; i++) {
      const input = document.getElementById(`team-name-${i}`);
      const name = input && input.value ? input.value.trim() : COLOUR_OPTIONS[i].defaultName;
      const { color } = COLOUR_OPTIONS[i];
      teams.push({ name, color, score: 0 });
    }
    window.teams = teams;
    // Build scoreboard and board
    buildScoreboard();
    buildBoard();
    // Hide the setup overlay
    const overlay = document.getElementById('setup-modal');
    if (overlay) overlay.style.display = 'none';
    // Show instructions section if present
    const instructions = document.getElementById('instructions');
    if (instructions) instructions.style.display = 'block';
  });
}

// ===================== Scoreboard =====================
// Create the scoreboard based on the currently selected teams. Each team gets
// a card with its colour down the left edge and its current score. Colour is
// applied to the entire card via currentColor so border-left picks it up.
function buildScoreboard() {
  const scoreboard = document.getElementById('scoreboard');
  scoreboard.innerHTML = '';
  teams.forEach((team, index) => {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.dataset.teamIndex = index;
    card.style.color = team.color;
    card.innerHTML = `
      <div class="team-name">${team.name}</div>
      <div class="team-score" id="team-score-${index}">${team.score}</div>
    `;
    scoreboard.appendChild(card);
  });
}

// ===================== Board =====================
// Create the clue board: first row shows category names; subsequent rows
// contain the point values. Each cell stores its category/row in data-*.
function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  // Create category header cells
  PACK.categories.forEach((cat) => {
    const cell = document.createElement('div');
    cell.className = 'cell category';
    cell.textContent = cat.name;
    board.appendChild(cell);
  });
  // For each question index (row), add cells for each category
  const numRows = PACK.categories[0].questions.length;
  for (let row = 0; row < numRows; row++) {
    PACK.categories.forEach((cat, col) => {
      const q = cat.questions[row];
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = q.value;
      cell.dataset.cat = col;
      cell.dataset.row = row;
      cell.addEventListener('click', () => openQuestion(cat, q, cell));
      board.appendChild(cell);
    });
  }
}

// ===================== Question Modal =====================
// Open a question. Populate the modal with details, create the team
// selection buttons and reset answer visibility. This does not mark the
// cell as used; that happens when a correct answer is awarded.
function openQuestion(category, questionObj, cellEl) {
  currentQuestion = { category, questionObj, cellEl };
  selectedTeamIdx = null;
  answerVisible = false;
  // Populate modal content
  document.getElementById('modal-category').textContent = `${category.name} – ${questionObj.value} points`;
  document.getElementById('modal-question').textContent = questionObj.question;
  // Populate answer and explanation. Support answers defined as an array
  // of key words or short phrases. Arrays are rendered as bullet lists;
  // strings are rendered as a single paragraph. The explanation is
  // always displayed as a bulleted list if provided.
  const answerContainer = document.getElementById('modal-answer');
  answerContainer.innerHTML = '';
  if (Array.isArray(questionObj.answer)) {
    const ulAns = document.createElement('ul');
    ulAns.style.margin = '0.5rem 0';
    ulAns.style.paddingLeft = '1.2rem';
    questionObj.answer.forEach((ans) => {
      const li = document.createElement('li');
      li.textContent = ans;
      ulAns.appendChild(li);
    });
    answerContainer.appendChild(ulAns);
  } else {
    const ansPara = document.createElement('p');
    ansPara.textContent = questionObj.answer;
    answerContainer.appendChild(ansPara);
  }
  // If explanation is provided as an array, render a bullet list
  if (Array.isArray(questionObj.explanation) && questionObj.explanation.length > 0) {
    // Insert a header to clearly separate the explanation from the answer
    const explHeader = document.createElement('p');
    explHeader.textContent = 'Explanation:';
    explHeader.style.fontWeight = '600';
    explHeader.style.margin = '0.5rem 0 0.25rem 0';
    answerContainer.appendChild(explHeader);
    const ul = document.createElement('ul');
    ul.style.margin = '0';
    ul.style.paddingLeft = '1.2rem';
    questionObj.explanation.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    answerContainer.appendChild(ul);
  }
  // Hide answer block initially
  const answerBlock = document.getElementById('answer-block');
  answerBlock.style.display = 'none';
  // Build team selection buttons
  const teamSelect = document.getElementById('team-select');
  teamSelect.innerHTML = '';
  teams.forEach((team, idx) => {
    const btn = document.createElement('button');
    btn.className = 'team-button';
    btn.style.backgroundColor = team.color;
    btn.textContent = team.name;
    btn.addEventListener('click', () => {
      // Ignore clicks if buttons are disabled (during reading)
      if (btn.disabled) return;
      selectedTeamIdx = idx;
      document.querySelectorAll('.team-button').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
      // Highlight the corresponding scoreboard card for this team
      highlightScoreboard(idx);
      // Close remote buzzers once a team has been selected to prevent others from buzzing
      if (window.phones && typeof window.phones.closeRemote === 'function') {
        window.phones.closeRemote();
      }
      // Start the answer timer if not already running
      startAnswerTimer();
    });
    teamSelect.appendChild(btn);
  });
  // Show modal
  document.getElementById('modal').classList.remove('hidden');
  // Reset show/hide button text and enabled state
  const showAnsBtn = document.getElementById('show-answer');
  showAnsBtn.textContent = 'Show Answer';
  showAnsBtn.disabled = false;

  // Clear any existing timers before starting a new timing cycle
  clearReadingTimer();
  clearAnswerTimer();

  // Disable team selection buttons until the reading period ends
  const teamSelectEl = document.getElementById('team-select');
  const buttonsToDisable = teamSelectEl ? teamSelectEl.querySelectorAll('button.team-button') : [];
  buttonsToDisable.forEach((btn) => {
    btn.disabled = true;
  });

  // Begin a 10‑second reading phase. During this period, buzzers are
  // unavailable and players should read the question. A countdown is
  // displayed, and once time elapses, buzzers open and players may
  // buzz in. Single‑player games automatically start the answer timer.
  const display = document.getElementById('timer-display');
  let readingRemaining = 10;
  if (display) display.textContent = `Read the question: ${readingRemaining}s`;
  // Play a sound to indicate the reading timer has started
  playSound('timer-start');
  readingInterval = setInterval(() => {
    readingRemaining--;
    if (readingRemaining >= 0 && display) {
      display.textContent = `Read the question: ${readingRemaining}s`;
    }
  }, 1000);
  readingTimer = setTimeout(() => {
    clearInterval(readingInterval);
    readingInterval = null;
    // Enable buzzers and team buttons
    buttonsToDisable.forEach((btn) => {
      btn.disabled = false;
    });
    // Display buzz message
    if (display) display.textContent = 'Buzz now!';
    // Open phone buzzers if available
    if (window.phones && typeof window.phones.openRemote === 'function') {
      window.phones.openRemote();
    }
    // In single‑player mode, automatically start the answer timer
    if (teams && teams.length === 1) {
      startAnswerTimer();
    }
    // Play a sound to indicate the reading period has ended
    playSound('timer-end');
  }, 10000);
}

// Highlight or clear highlight for scoreboard cards. Passing a negative index
// clears all highlights. This helps players see which team buzzed first.
function highlightScoreboard(index) {
  const cards = document.querySelectorAll('.team-card');
  cards.forEach(card => {
    card.classList.remove('highlight');
    // Remove any inline border colour set previously
    card.style.outlineColor = '';
  });
  if (typeof index === 'number' && index >= 0) {
    const card = document.querySelector(`.team-card[data-team-index="${index}"]`);
    if (card) {
      card.classList.add('highlight');
    }
  }
}

// ===================== Modal handlers =====================
// Attach handlers to the show/hide answer, correct, wrong and close buttons.
function setupModalHandlers() {
  const showAnsBtn = document.getElementById('show-answer');
  const correctBtn = document.getElementById('correct-btn');
  const wrongBtn = document.getElementById('wrong-btn');
  const closeBtn = document.getElementById('close-btn');
  const burnoutBtn = document.getElementById('burnout-btn');
  showAnsBtn.addEventListener('click', () => {
    // Toggle answer visibility
    answerVisible = !answerVisible;
    const answerBlock = document.getElementById('answer-block');
    if (answerVisible) {
      answerBlock.style.display = 'block';
      showAnsBtn.textContent = 'Hide Answer';
    } else {
      answerBlock.style.display = 'none';
      showAnsBtn.textContent = 'Show Answer';
    }
  });
  correctBtn.addEventListener('click', () => {
    // Only award points and mark the question used if a team is selected
    if (currentQuestion && selectedTeamIdx !== null) {
      teams[selectedTeamIdx].score += currentQuestion.questionObj.value;
      updateScores();
      // Play a success sound
      playSound('correct');
      finishQuestion(true);
    }
  });
  wrongBtn.addEventListener('click', () => {
    // Incorrect answer: keep the question open and allow other teams to buzz.
    // Reset selected team and remove highlights
    selectedTeamIdx = null;
    document.querySelectorAll('#team-select .team-button').forEach(btn => {
      btn.classList.remove('selected');
      // Re-enable buttons in case they were disabled
      btn.disabled = false;
    });
    // Clear scoreboard highlight
    highlightScoreboard(-1);
    // Clear any running answer timer and reset timer display
    clearAnswerTimer();
    // Update the timer display to prompt for buzzing
    const display = document.getElementById('timer-display');
    if (display) display.textContent = 'Buzz now!';
    // Re-open remote buzzers if available
    if (window.phones && typeof window.phones.openRemote === 'function') {
      window.phones.openRemote();
    }
    // Play a wrong-answer sound
    playSound('wrong');
    // Do not close the modal or mark the cell; host may select another team.
  });
  burnoutBtn.addEventListener('click', () => {
    // Burnout: mark the tile as used without awarding any points
    finishQuestion(true);
  });
  closeBtn.addEventListener('click', () => {
    // Closing behaves like wrong (no change to board)
    finishQuestion(false);
  });
}

// Update the scoreboard numbers
function updateScores() {
  teams.forEach((team, idx) => {
    const el = document.getElementById(`team-score-${idx}`);
    if (el) el.textContent = team.score;
  });
}

// Finish the question: optionally mark the cell used (only when correct)
// then hide the modal and reset state variables.
function finishQuestion(markUsed = true) {
  if (currentQuestion) {
    // Mark the cell used if requested
    if (markUsed && currentQuestion.cellEl) {
      currentQuestion.cellEl.classList.add('used');
      currentQuestion.cellEl.textContent = '';
    }
  }
  // Clear any running reading or answer timers and countdown display
  clearReadingTimer();
  clearAnswerTimer();
  currentQuestion = null;
  selectedTeamIdx = null;
  answerVisible = false;
  document.getElementById('modal').classList.add('hidden');
  // Always re-enable show answer button for next question
  document.getElementById('show-answer').disabled = false;

  // Remove scoreboard highlight when finishing the question
  highlightScoreboard(-1);

  // If phone buzzers are enabled, close remote buzzers after question finishes.
  if (window.phones && typeof window.phones.closeRemote === 'function') {
    window.phones.closeRemote();
  }
  // If we removed a tile, check if the game has ended
  if (markUsed) {
    checkGameEnd();
  }
}