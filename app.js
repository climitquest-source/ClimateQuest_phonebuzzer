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
          question: "What are three Rs for waste management?",
          answer: "Reuse, Reduce and Recycle"
        },
        {
          value: 400,
          question: "How does one dispose of batteries?",
          answer: "City of Toronto’s Drop‑off Depots or drop off on a community environment day"
        },
        {
          value: 600,
          question: "True or false: contaminated pizza boxes go in the green bin?",
          answer: "True"
        },
        {
          value: 800,
          question: "Which bin do coffee cups go in Toronto?",
          answer: "Green bin"
        },
        {
          value: 1000,
          question: "How should you deal with a small amount of used cooking oil?",
          answer: "Wipe with kitchen towels and leave the kitchen towels in the green bin"
        }
      ]
    },
    {
      name: "Prepare for Climate Emergencies",
      questions: [
        {
          value: 200,
          question: "Climate Crisis comes as a result of Global…",
          answer: "Warming"
        },
        {
          value: 400,
          question: "Which climate emergency often leads to ‘cooling centres’ being opened in cities?",
          answer: "Heatwaves"
        },
        {
          value: 600,
          question: "What is the largest source of electricity generated in Ontario today?",
          answer: "Nuclear"
        },
        {
          value: 800,
          question: "What is the safest place to shelter during a tornado?",
          answer: "A basement or an interior room on the lowest floor, away from windows."
        },
        {
          value: 1000,
          question: "Where should the downspouts connect to?",
          answer: "Disconnect to the city's sewer system; better at 2 metres away from the foundation"
        }
      ]
    },
    {
      name: "Community Gardens",
      questions: [
        {
          value: 200,
          question: "What is the best way to have a sustainable source of food in your community?",
          answer: "Community Gardens"
        },
        {
          value: 400,
          question: "What is called to add food scraps and yard waste back into the soil to enrich gardens?",
          answer: "Composting"
        },
        {
          value: 600,
          question: "What are the most common vegetables that grow in Community Gardens in Toronto? Name three:",
          answer: "Leafy greens like lettuce, kale, and swiss chard, as well as tomatoes, peppers, and beans. Root vegetables like beets and carrots are also popular choices. Additionally, cucumbers, squash, and zucchini are frequently cultivated"
        },
        {
          value: 800,
          question: "Can you give some examples of Community Gardens in the City of Toronto?",
          answer: "Wychwood Barns, MFRC Gardens, Eglinton Park Community Garden and the Rockcliffe Demonstration and Teaching Garden and Greenhouses. Other locations include Emmett Ave. Community Garden, New Horizons Community Garden, and Gate House Transformational Healing Garden."
        },
        {
          value: 1000,
          question: "What would you do if you were to start a Community Garden?",
          answer: "When considering a Community garden, key questions include site suitability (sunlight, soil, and space), resource availability (water, tools, and materials), and community engagement (participation, accessibility, and maintenance). Additionally, understanding the purpose of the garden (personal enjoyment, food production, or community building) and budgeting for its development are crucial"
        }
      ]
    },
    {
      name: "Sustainability",
      questions: [
        {
          value: 200,
          question: "Urban gardens also support biodiversity by attracting these important pollinators.",
          answer: "Bees"
        },
        {
          value: 400,
          question: "Growing food locally reduces greenhouse gases which results in a lower:",
          answer: "Carbon footprint"
        },
        {
          value: 600,
          question: "What are the top 3 green commute options?",
          answer: "Walking, biking, and using public transportation"
        },
        {
          value: 800,
          question: "The UN created these 17 goals in 2015 to guide global efforts toward a more sustainable future.",
          answer: "Sustainable Development Goals (SDGs)"
        },
        {
          value: 1000,
          question: "What type of economy focuses on designing out waste and keeping products and materials in use?",
          answer: "Circular Economy"
        }
      ]
    },
    {
      name: "Food Security",
      questions: [
        {
          value: 200,
          question: "True/False: Food Security entails that people don’t have access to affordable food sources?",
          answer: "False"
        },
        {
          value: 400,
          question: "What is the difference between ‘food insecurity’ and ‘hunger’?",
          answer: "Food insecurity is the lack of reliable access to sufficient, affordable, nutritious food; hunger is the physical sensation of not having enough food."
        },
        {
          value: 600,
          question: "What is Food Security?",
          answer: "Food security is defined as a situation that exists when all people, at all times, have physical, social and economic access to sufficient, safe and nutritious food that meets their dietary needs and food preferences for an active and healthy life."
        },
        {
          value: 800,
          question: "Which areas have potential food security challenges?",
          answer: "Inner City Suburbs, particularly Priority Investment Neighbourhoods (PINs)"
        },
        {
          value: 1000,
          question: "Which groups in the city are most prone to being food insecure?",
          answer: "The risk of food insecurity is higher for individuals and families that are racialized (especially Black people), are Indigenous, are part of the 2SLGBTQIA+ community, have a low income, receive social assistance such as Ontario Works or Ontario Disability Support Program, live with a disability, rent their home, live in households led by lone parents (especially female lone parents), or are new to Canada."
        }
      ]
    }
  ],
  // Final question used if you wish to add a final round. Not used in current UI.
  final_question: {
    question: "This Canadian program, started in 2019, aims to reduce household food insecurity by improving access to healthy food for school‑aged children.",
    answer: "What is the Canada Food Policy / School Food Program?"
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

  // Start the game: gather names/colours and construct the UI
  startGameBtn.addEventListener('click', () => {
    const count = parseInt(teamCountSelect.value);
    teams = [];
    for (let i = 0; i < count; i++) {
      const input = document.getElementById(`team-name-${i}`);
      const name = input && input.value ? input.value.trim() : COLOUR_OPTIONS[i].defaultName;
      const { color } = COLOUR_OPTIONS[i];
      teams.push({ name, color, score: 0 });
    }
    // Expose teams on the window so phones.js can read them when creating
    // a remote buzzer room. Without this, window.teams would be undefined.
    window.teams = teams;
    // Build the scoreboard and board
    buildScoreboard();
    buildBoard();
    // Hide the setup overlay
    const overlay = document.getElementById('setup-modal');
    if (overlay) overlay.style.display = 'none';
    // Show the instructions section if present
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
  document.getElementById('modal-answer').textContent = questionObj.answer;
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
      selectedTeamIdx = idx;
      document.querySelectorAll('.team-button').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');
    });
    teamSelect.appendChild(btn);
  });
  // Show modal
  document.getElementById('modal').classList.remove('hidden');
  // Reset show/hide button text and enabled state
  const showAnsBtn = document.getElementById('show-answer');
  showAnsBtn.textContent = 'Show Answer';
  showAnsBtn.disabled = false;

  // If phone buzzers are available, open remote buzzers for this question.
  // This sets buzzersOpen flag and allows remote players to buzz once.
  if (window.phones && typeof window.phones.openRemote === 'function') {
    window.phones.openRemote();
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
      finishQuestion(true);
    }
  });
  wrongBtn.addEventListener('click', () => {
    // On wrong answer, keep the question open and allow other teams to buzz.
    // Reset the selected team and remove highlights.
    selectedTeamIdx = null;
    document.querySelectorAll('#team-select .team-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    // If phone buzzers are enabled, re‑open remote buzzing so another team can buzz in.
    if (window.phones && typeof window.phones.openRemote === 'function') {
      window.phones.openRemote();
    }
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
    if (markUsed && currentQuestion.cellEl) {
      currentQuestion.cellEl.classList.add('used');
      currentQuestion.cellEl.textContent = '';
    }
  }
  currentQuestion = null;
  selectedTeamIdx = null;
  answerVisible = false;
  document.getElementById('modal').classList.add('hidden');
  // Always re-enable show answer button for next question
  document.getElementById('show-answer').disabled = false;

  // If phone buzzers are enabled, close remote buzzers after question finishes.
  if (window.phones && typeof window.phones.closeRemote === 'function') {
    window.phones.closeRemote();
  }
}