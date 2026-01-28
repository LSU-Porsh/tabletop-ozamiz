// Admin Authentication
let isAdmin = localStorage.getItem("isAdmin") === "true";
const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

const adminBtn = document.getElementById("adminBtn");
const adminLoginModal = document.getElementById("adminLoginModal");
const adminCloseBtn = document.getElementById("adminCloseBtn");
const adminCancelBtn = document.getElementById("adminCancelBtn");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");
const addPlayerBtn = document.getElementById("addPlayerBtn");

// Update admin button display
function updateAdminUI() {
  const addPlayerBtn = document.getElementById("addPlayerBtn");
  if (isAdmin) {
    addPlayerBtn.style.display = "block";
    adminBtn.textContent = "🔓 Logout";
    adminBtn.classList.add("logout");
    addAdminDataButtons(); // Add export/import/clear buttons
  } else {
    addPlayerBtn.style.display = "none";
    adminBtn.textContent = "🔒 Admin";
    adminBtn.classList.remove("logout");
    removeAdminDataButtons(); // Remove export/import/clear buttons
  }
}

// Initialize admin UI
updateAdminUI();

// Admin button click
adminBtn.addEventListener("click", () => {
  if (isAdmin) {
    // Logout
    isAdmin = false;
    localStorage.setItem("isAdmin", "false");
    updateAdminUI();
    adminMessage.style.display = "none";
  } else {
    // Open login modal
    adminLoginModal.classList.add("show");
  }
});

// Close admin modal
adminCloseBtn.addEventListener("click", () => {
  adminLoginModal.classList.remove("show");
  adminMessage.style.display = "none";
});

adminCancelBtn.addEventListener("click", () => {
  adminLoginModal.classList.remove("show");
  adminMessage.style.display = "none";
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === adminLoginModal) {
    adminLoginModal.classList.remove("show");
    adminMessage.style.display = "none";
  }
});

// Admin login form submission
adminLoginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const password = document.getElementById("adminPassword").value;

  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    localStorage.setItem("isAdmin", "true");
    updateAdminUI();

    // Show success message
    adminMessage.classList.remove("error");
    adminMessage.classList.add("success");
    adminMessage.textContent = "✓ Login successful!";
    adminMessage.style.display = "block";

    // Close modal after 1.5 seconds
    setTimeout(() => {
      adminLoginModal.classList.remove("show");
      adminMessage.style.display = "none";
      adminLoginForm.reset();
    }, 1500);
  } else {
    // Show error message
    adminMessage.classList.remove("success");
    adminMessage.classList.add("error");
    adminMessage.textContent = "✗ Incorrect password";
    adminMessage.style.display = "block";
  }
});

// Player Data Management (localStorage + JSON export/import)
const STORAGE_KEY = "unmatchedPlayers";

// Load players from localStorage
function loadPlayersFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Save players to localStorage
function savePlayersToStorage(players) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
}

// Get all players from leaderboard
function getAllPlayers() {
  const players = [];
  document.querySelectorAll(".leaderboard-row").forEach((row) => {
    const playerCol = row.querySelector(".player-col");
    const winsCol = row.querySelector(".wins-col");
    const ratioCol = row.querySelector(".ratio-col");
    const pointsCol = row.querySelector(".points-col");

    if (playerCol && winsCol) {
      const playerName = playerCol.textContent
        .replace(/Pro|Elite|\(exists\)/g, "")
        .trim();
      const wins = parseInt(winsCol.textContent);
      const ratio = parseFloat(ratioCol.textContent);
      const points = parseInt(pointsCol.textContent.replace(/,/g, ""));

      players.push({
        name: playerName,
        wins: wins,
        winRate: ratio,
        rating: points,
      });
    }
  });
  return players;
}

// Export players to JSON file
function exportPlayersToJSON() {
  const players = getAllPlayers();
  const jsonData = JSON.stringify(players, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `unmatched-players-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  // Also save to localStorage
  savePlayersToStorage(players);
  alert("✓ Players exported and saved!");
}

// Import players from JSON file
function importPlayersFromJSON(jsonData) {
  try {
    const players = JSON.parse(jsonData);
    if (!Array.isArray(players)) {
      alert("Invalid JSON format. Expected an array of players.");
      return false;
    }

    savePlayersToStorage(players);
    alert(
      "✓ Players imported successfully! Refresh the page to see updated data.",
    );
    return true;
  } catch (error) {
    alert("Error parsing JSON: " + error.message);
    return false;
  }
}

// Clear all player data
function clearPlayerData() {
  if (
    confirm(
      "⚠️ Are you sure you want to clear all player data? This action cannot be undone.",
    )
  ) {
    localStorage.removeItem(STORAGE_KEY);
    alert("✓ All player data cleared!");
    location.reload();
  }
}

// Add export/import/clear buttons to admin panel
function addAdminDataButtons() {
  const leaderboardSection = document.querySelector(".leaderboard");
  if (!leaderboardSection) return;

  // Check if buttons already exist
  if (document.getElementById("exportBtn")) return;

  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.className = "admin-btn";
  exportBtn.textContent = "📥 Export Data";
  exportBtn.style.marginLeft = "1rem";
  exportBtn.onclick = exportPlayersToJSON;

  const importBtn = document.createElement("button");
  importBtn.id = "importBtn";
  importBtn.className = "admin-btn";
  importBtn.textContent = "📤 Import Data";
  importBtn.style.marginLeft = "0.5rem";
  importBtn.onclick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        importPlayersFromJSON(event.target.result);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const clearBtn = document.createElement("button");
  clearBtn.id = "clearBtn";
  clearBtn.className = "admin-btn";
  clearBtn.textContent = "🗑️ Clear Data";
  clearBtn.style.marginLeft = "0.5rem";
  clearBtn.style.backgroundColor = "#dc3545";
  clearBtn.style.borderColor = "#dc3545";
  clearBtn.onclick = clearPlayerData;

  // Find the admin button container and add buttons
  const adminBtnContainer =
    document.querySelector(".add-player-btn").parentElement;
  if (adminBtnContainer) {
    adminBtnContainer.appendChild(exportBtn);
    adminBtnContainer.appendChild(importBtn);
    adminBtnContainer.appendChild(clearBtn);
  }
}

// Remove export/import/clear buttons from admin panel
function removeAdminDataButtons() {
  const exportBtn = document.getElementById("exportBtn");
  const importBtn = document.getElementById("importBtn");
  const clearBtn = document.getElementById("clearBtn");

  if (exportBtn) exportBtn.remove();
  if (importBtn) importBtn.remove();
  if (clearBtn) clearBtn.remove();
}

// Initialize admin buttons on page load
document.addEventListener("DOMContentLoaded", () => {
  if (isAdmin) {
    addAdminDataButtons();
  }
});

// Mobile Menu Toggle
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("active");
  });
}

// Get all existing player names from leaderboard
function getExistingPlayers() {
  const players = [];
  document.querySelectorAll(".player-col").forEach((col) => {
    const text = col.textContent.trim();
    const playerName = text.replace(/Pro|Elite|\(exists\)/g, "").trim();
    if (playerName) players.push(playerName);
  });
  return players;
}

// Add Player Modal Logic
const modal = document.getElementById("playerModal");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancelBtn");
const addPlayerForm = document.getElementById("addPlayerForm");
const playerNameInput = document.getElementById("playerName");
const suggestionsList = document.getElementById("suggestions");
const nameError = document.getElementById("nameError");

// Open modal - Check admin status
if (addPlayerBtn) {
  addPlayerBtn.addEventListener("click", () => {
    if (!isAdmin) {
      alert("Admin access required to add players. Please log in.");
      adminLoginModal.classList.add("show");
      return;
    }
    modal.classList.add("show");
    playerNameInput.focus();
  });
}

// Close modal
closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

cancelBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
  }
});

// Autocomplete functionality
playerNameInput.addEventListener("input", (e) => {
  const input = e.target.value.trim();
  const existingPlayers = getExistingPlayers();
  nameError.classList.remove("show");
  nameError.textContent = "";
  suggestionsList.innerHTML = "";

  if (input.length === 0) {
    suggestionsList.classList.remove("show");
    return;
  }

  // Filter players that match the input
  const matches = existingPlayers.filter((player) =>
    player.toLowerCase().includes(input.toLowerCase()),
  );

  if (matches.length > 0) {
    suggestionsList.classList.add("show");
    matches.forEach((match) => {
      const item = document.createElement("div");
      item.className = "suggestion-item exists";
      item.textContent = match;
      item.addEventListener("click", () => {
        playerNameInput.value = match;
        suggestionsList.classList.remove("show");
        showPlayerExistsError(match);
      });
      suggestionsList.appendChild(item);
    });
  } else {
    suggestionsList.classList.remove("show");
  }
});

// Show error when player exists
function showPlayerExistsError(playerName) {
  nameError.classList.add("show");
  nameError.textContent = `⚠️ "${playerName}" already exists! Please use a different name or update their stats.`;
}

// Check if player exists before submission
function playerExists(name) {
  const existingPlayers = getExistingPlayers();
  return existingPlayers.some((p) => p.toLowerCase() === name.toLowerCase());
}

// Calculate win rate
function calculateWinRate(wins, losses) {
  const total = wins + losses;
  if (total === 0) return 0;
  return ((wins / total) * 100).toFixed(1);
}

// Calculate rating based on points
function calculateRating(points) {
  return Math.floor(points / 10) + 1000;
}

// Form submission
addPlayerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = playerNameInput.value.trim();
  const wins = parseInt(document.getElementById("playerWins").value);
  const losses = parseInt(document.getElementById("playerLosses").value);
  const points = parseInt(document.getElementById("playerPoints").value);
  const time = parseFloat(document.getElementById("playerTime").value);

  // Validate name doesn't exist
  if (playerExists(name)) {
    showPlayerExistsError(name);
    return;
  }

  // Validate inputs
  if (!name || wins < 0 || losses < 0 || points < 0 || time < 0) {
    alert("Please fill in all fields with valid values.");
    return;
  }

  // Calculate stats
  const winRate = calculateWinRate(wins, losses);
  const rating = calculateRating(points);

  // Create new player row
  const newRow = document.createElement("div");
  newRow.className = "leaderboard-row";

  const totalWins = wins;
  const rank = document.querySelectorAll(".leaderboard-row").length + 1;

  newRow.innerHTML = `
        <div class="rank-col">${rank}</div>
        <div class="player-col">${name}</div>
        <div class="wins-col">${totalWins}</div>
        <div class="ratio-col">${winRate}%</div>
        <div class="points-col">${rating}</div>
        <div class="actions-col">
          <button class="edit-btn" data-player="${name}" data-wins="${totalWins}" data-losses="${losses}" data-points="${points}" data-time="${time}">✏️ Edit</button>
        </div>
    `;

  // Add to leaderboard
  const leaderboardBody = document.querySelector(".leaderboard-body");
  leaderboardBody.appendChild(newRow);

  // Save to localStorage
  const players = getAllPlayers();
  savePlayersToStorage(players);

  // Show success message
  const submitBtn = addPlayerForm.querySelector(".submit-btn");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "✓ Player Added!";
  submitBtn.style.background =
    "linear-gradient(135deg, #10b981 0%, #059669 100%)";

  // Reset form
  addPlayerForm.reset();
  suggestionsList.classList.remove("show");
  nameError.classList.remove("show");

  // Reset button and close modal after 1.5 seconds
  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.style.background = "";
    modal.classList.remove("show");
  }, 1500);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      if (navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        hamburger.classList.remove("active");
      }
    }
  });
});

// Form submission handler
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get form values
    const name = contactForm.querySelector('input[type="text"]').value;
    const email = contactForm.querySelector('input[type="email"]').value;
    const character =
      contactForm.querySelectorAll('input[type="text"]')[1]?.value;

    // Simple validation
    if (name && email && character) {
      // Show success message
      const submitBtn = contactForm.querySelector(".submit-button");
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Registration Complete! ✓";
      submitBtn.style.background =
        "linear-gradient(135deg, #10b981 0%, #059669 100%)";

      // Reset form
      contactForm.reset();

      // Reset button after 3 seconds
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = "";
      }, 3000);
    }
  });
}

// Add scroll animation to feature cards
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.animation = "fadeInUp 0.6s ease forwards";
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe feature cards and game cards
document.querySelectorAll(".feature-card, .game-card").forEach((card) => {
  card.style.opacity = "0";
  observer.observe(card);
});

// Add animation keyframe
const style = document.createElement("style");
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Add scroll effect to navbar
let lastScrollTop = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    // Scrolling down
    navbar.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.2)";
  } else {
    // Scrolling up
    navbar.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  }
  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
});

// Load and display characters
async function loadCharacters() {
  const charactersGrid = document.getElementById("charactersGrid");

  if (!charactersGrid) return; // Exit if not on the characters page

  try {
    const response = await fetch("unmatched_characters.json");
    const characters = await response.json();

    characters.forEach((character) => {
      const characterCard = document.createElement("div");
      characterCard.className = "character-card";

      characterCard.innerHTML = `
        <div class="character-image">
          <img src="${character.image}" alt="${character.name}" />
        </div>
        <div class="character-info">
          <h3>${character.name}</h3>
          <p class="character-set">${character.set}</p>
          <p class="character-description">${character.description}</p>
        </div>
      `;

      charactersGrid.appendChild(characterCard);
    });
  } catch (error) {
    console.error("Error loading characters:", error);
    if (charactersGrid) {
      charactersGrid.innerHTML =
        "<p>Error loading characters. Please try again later.</p>";
    }
  }
}

// Load characters when the page loads
document.addEventListener("DOMContentLoaded", loadCharacters);

// Edit Player Modal Logic
const editModal = document.getElementById("editPlayerModal");
const editCloseBtn = document.getElementById("editCloseBtn");
const editCancelBtn = document.getElementById("editCancelBtn");
const editPlayerForm = document.getElementById("editPlayerForm");
let currentEditingRow = null;

// Close edit modal
editCloseBtn.addEventListener("click", () => {
  editModal.classList.remove("show");
});

editCancelBtn.addEventListener("click", () => {
  editModal.classList.remove("show");
});

// Close edit modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === editModal) {
    editModal.classList.remove("show");
  }
});

// Handle edit button clicks
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    if (!isAdmin) {
      alert("Admin access required to edit players. Please log in.");
      adminLoginModal.classList.add("show");
      return;
    }

    const button = e.target;
    const playerName = button.getAttribute("data-player");
    const wins = button.getAttribute("data-wins");
    const losses = button.getAttribute("data-losses");
    const points = button.getAttribute("data-points");
    const time = button.getAttribute("data-time");

    // Populate edit form
    document.getElementById("editPlayerName").value = playerName;
    document.getElementById("editPlayerWins").value = wins;
    document.getElementById("editPlayerLosses").value = losses;
    document.getElementById("editPlayerPoints").value = points;
    document.getElementById("editPlayerTime").value = time;

    // Store the row for updating later
    currentEditingRow = button.closest(".leaderboard-row");

    // Open modal
    editModal.classList.add("show");
  }
});

// Handle edit form submission
editPlayerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const wins = parseInt(document.getElementById("editPlayerWins").value);
  const losses = parseInt(document.getElementById("editPlayerLosses").value);
  const points = parseInt(document.getElementById("editPlayerPoints").value);

  if (wins < 0 || losses < 0 || points < 0) {
    alert("Please enter valid values.");
    return;
  }

  // Calculate stats
  const winRate = calculateWinRate(wins, losses);
  const rating = calculateRating(points);

  // Update the row
  if (currentEditingRow) {
    currentEditingRow.querySelector(".wins-col").textContent = wins;
    currentEditingRow.querySelector(".ratio-col").textContent = winRate + "%";
    currentEditingRow.querySelector(".points-col").textContent = rating;

    // Update button data attributes
    const editBtn = currentEditingRow.querySelector(".edit-btn");
    editBtn.setAttribute("data-wins", wins);
    editBtn.setAttribute("data-losses", losses);
    editBtn.setAttribute("data-points", points);
  }

  // Save to localStorage
  const players = getAllPlayers();
  savePlayersToStorage(players);

  // Show success message
  const submitBtn = editPlayerForm.querySelector(".submit-btn");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "✓ Updated!";
  submitBtn.style.background =
    "linear-gradient(135deg, #10b981 0%, #059669 100%)";

  // Reset button and close modal after 1.5 seconds
  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.style.background = "";
    editModal.classList.remove("show");
  }, 1500);
});

// ==================== Firebase Database Functions ====================
// Upload local JSON data to Firebase (run once to populate)
async function uploadDataToFirebase() {
  try {
    console.log("Starting data upload to Firebase...");

    // Upload Unmatched boards
    const boardsResponse = await fetch("unmatched_board.json");
    const boards = await boardsResponse.json();
    await db.ref("unmatched/boards").set(boards);
    console.log("✅ Boards uploaded");

    // Upload Unmatched characters
    const charactersResponse = await fetch("unmatched_characters.json");
    const characters = await charactersResponse.json();
    await db.ref("unmatched/characters").set(characters);
    console.log("✅ Characters uploaded");

    // Upload Unmatched sets
    const setsResponse = await fetch("unmatched_set.json");
    const sets = await setsResponse.json();
    await db.ref("unmatched/sets").set(sets);
    console.log("✅ Sets uploaded");

    alert("✅ All data uploaded to Firebase successfully!");
  } catch (error) {
    console.error("❌ Error uploading data:", error);
    alert("Error uploading data: " + error.message);
  }
}

// Save player ranking to Firebase
function saveRankingToFirebase(gameType, playerData) {
  const timestamp = new Date().toISOString();
  db.ref(`rankings/${gameType}/${timestamp}`)
    .set(playerData)
    .then(() => console.log("✅ Ranking saved to Firebase"))
    .catch((error) => console.error("❌ Error saving ranking:", error));
}

// Load rankings from Firebase
function loadRankingsFromFirebase(gameType) {
  db.ref(`rankings/${gameType}`).on("value", (snapshot) => {
    const rankings = snapshot.val();
    console.log(`${gameType} Rankings:`, rankings);
    // Update your UI with rankings here
  });
}

// Export data from Firebase
function exportDataFromFirebase(gameType) {
  db.ref(`rankings/${gameType}`).once("value", (snapshot) => {
    const data = snapshot.val();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${gameType}-rankings-${new Date().toISOString()}.json`;
    link.click();
  });
}
