
import { getDatabase, ref, onValue, set, get, remove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { app } from "./firebase.js";

const database = getDatabase(app);

// ==================== Admin Authentication ====================
let isAdmin = localStorage.getItem("isAdmin") === "true";
const ADMIN_PASSWORD = "admin123"; // Change this to your desired password

document.addEventListener("DOMContentLoaded", () => {
    const gameType = document.body.dataset.gameType;
    if (!gameType) return;

    const rankingsRef = ref(database, `rankings/${gameType}`);

    // =========== DOM Elements ===========
    const leaderboardBody = document.querySelector(".leaderboard-body");
    const adminBtn = document.getElementById("adminBtn");
    const adminLoginModal = document.getElementById("adminLoginModal");
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminMessage = document.getElementById("adminMessage");
    const addPlayerBtn = document.getElementById("addPlayerBtn");
    const playerModal = document.getElementById("playerModal");
    const editPlayerModal = document.getElementById("editPlayerModal");

    // =========== Admin UI ===========
    function updateAdminUI() {
        const adminElements = document.querySelectorAll(".actions-col");

        if (isAdmin) {
            adminBtn.textContent = "🔓 Logout";
            adminBtn.classList.add("logout");
            if(addPlayerBtn) addPlayerBtn.style.display = "block";
            if(adminElements) adminElements.forEach(el => el.style.display = "flex");
            addAdminDataButtons();
        } else {
            adminBtn.textContent = "🔒 Admin";
            adminBtn.classList.remove("logout");
            if(addPlayerBtn) addPlayerBtn.style.display = "none";
            if(adminElements) adminElements.forEach(el => el.style.display = "none");
            removeAdminDataButtons();
        }
    }

    if (adminBtn) {
        adminBtn.addEventListener("click", () => {
            if (isAdmin) {
                isAdmin = false;
                localStorage.setItem("isAdmin", "false");
                updateAdminUI();
                if(adminMessage) adminMessage.style.display = "none";
            } else {
                if(adminLoginModal) adminLoginModal.classList.add("show");
            }
        });
    }

    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const password = document.getElementById("adminPassword").value;
            if (password === ADMIN_PASSWORD) {
                isAdmin = true;
                localStorage.setItem("isAdmin", "true");
                updateAdminUI();
                if(adminMessage) {
                    adminMessage.classList.remove("error");
                    adminMessage.classList.add("success");
                    adminMessage.textContent = "✓ Login successful!";
                    adminMessage.style.display = "block";
                }
                setTimeout(() => {
                    if(adminLoginModal) adminLoginModal.classList.remove("show");
                    if(adminMessage) adminMessage.style.display = "none";
                    adminLoginForm.reset();
                }, 1500);
            } else {
                if(adminMessage) {
                    adminMessage.classList.remove("success");
                    adminMessage.classList.add("error");
                    adminMessage.textContent = "✗ Incorrect password";
                    adminMessage.style.display = "block";
                }
            }
        });
    }

    // =========== Leaderboard Rendering ===========
    function renderLeaderboard() {
        if (!leaderboardBody) return;
        get(rankingsRef).then((snapshot) => {
            const data = snapshot.val();
            leaderboardBody.innerHTML = "";

            if (data) {
                const players = Object.entries(data).map(([id, player]) => ({ ...player, id }));
                players.sort((a, b) => b.rating - a.rating);

                players.forEach((player, index) => {
                    const rank = index + 1;
                    const row = document.createElement("div");
                    row.classList.add("leaderboard-row");
                    row.innerHTML = `
                        <div class="rank-col">${rank}</div>
                        <div class="player-col">${player.name}</div>
                        <div class="wins-col">${player.wins}</div>
                        <div class="ratio-col">${player.winRate}%</div>
                        <div class="points-col">${player.rating}</div>
                        <div class="actions-col" style="display: ${isAdmin ? 'flex' : 'none'};">
                            <button class="edit-btn" data-id="${player.id}">✏️ Edit</button>
                            <button class="delete-btn" data-id="${player.id}">🗑️ Delete</button>
                        </div>
                    `;
                    leaderboardBody.appendChild(row);
                });
            }
        });
    }

    // =========== CRUD Operations ===========
    if (addPlayerBtn) {
        addPlayerBtn.addEventListener("click", () => {
            if (!isAdmin) {
                alert("Admin access required. Please log in.");
                if (adminLoginModal) adminLoginModal.classList.add("show");
                return;
            }
            if (playerModal) playerModal.classList.add("show");
        });
    }
    
    const addPlayerForm = document.getElementById("addPlayerForm");
    if (addPlayerForm) {
        addPlayerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const playerName = document.getElementById("playerName").value;
            const playerWins = parseInt(document.getElementById("playerWins").value);
            const playerLosses = parseInt(document.getElementById("playerLosses").value);
            const playerPoints = parseInt(document.getElementById("playerPoints").value);

            const winRate = calculateWinRate(playerWins, playerLosses);
            const rating = calculateRating(playerPoints);

            const newPlayerRef = ref(database, `rankings/${gameType}/${Date.now()}`);
            set(newPlayerRef, {
                name: playerName,
                wins: playerWins,
                losses: playerLosses,
                winRate: winRate,
                rating: rating
            }).then(() => {
                alert("Player added successfully!");
                addPlayerForm.reset();
                if (playerModal) playerModal.classList.remove("show");
                renderLeaderboard();
            }).catch((error) => {
                alert("Error adding player: " + error.message);
            });
        });
    }
    
    const editPlayerForm = document.getElementById("editPlayerForm");
    if (editPlayerForm) {
        editPlayerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const playerId = document.getElementById("editPlayerId").value;
            const playerName = document.getElementById("editPlayerName").value;
            const playerWins = parseInt(document.getElementById("editPlayerWins").value);
            const playerLosses = parseInt(document.getElementById("editPlayerLosses").value);
            const playerPoints = parseInt(document.getElementById("editPlayerPoints").value);

            const winRate = calculateWinRate(playerWins, playerLosses);
            const rating = calculateRating(playerPoints);

            const playerRef = ref(database, `rankings/${gameType}/${playerId}`);
            set(playerRef, {
                name: playerName,
                wins: playerWins,
                losses: playerLosses,
                winRate: winRate,
                rating: rating
            }).then(() => {
                alert("Player updated successfully!");
                editPlayerForm.reset();
                if (editPlayerModal) editPlayerModal.classList.remove("show");
                renderLeaderboard();
            }).catch((error) => {
                alert("Error updating player: " + error.message);
            });
        });
    }

    if (leaderboardBody) {
        leaderboardBody.addEventListener("click", (e) => {
            if (!isAdmin) return;

            if (e.target.classList.contains("delete-btn")) {
                const playerId = e.target.dataset.id;
                if (confirm("Are you sure you want to delete this player?")) {
                    const playerRef = ref(database, `rankings/${gameType}/${playerId}`);
                    remove(playerRef).then(() => {
                        alert("Player deleted successfully!");
                        renderLeaderboard();
                    }).catch((error) => {
                        alert("Error deleting player: " + error.message);
                    });
                }
            }

            if (e.target.classList.contains("edit-btn")) {
                const playerId = e.target.dataset.id;
                const playerRef = ref(database, `rankings/${gameType}/${playerId}`);
                get(playerRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        const player = snapshot.val();
                        document.getElementById("editPlayerId").value = playerId;
                        document.getElementById("editPlayerName").value = player.name;
                        document.getElementById("editPlayerWins").value = player.wins;
                        document.getElementById("editPlayerLosses").value = player.losses;
                        document.getElementById("editPlayerPoints").value = (player.rating - 1000) * 10;
                        if(editPlayerModal) editPlayerModal.classList.add("show");
                    }
                });
            }
        });
    }

    // =========== Characters Carousel ===========
    async function loadCharactersCarousel(carouselId, jsonFile) {
        try {
            const response = await fetch(jsonFile);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const characters = await response.json();
            const carouselContainer = document.getElementById(carouselId);
    
            if (carouselContainer) {
                characters.forEach(character => {
                    const cell = document.createElement('div');
                    cell.classList.add('carousel-cell');
                    cell.innerHTML = `
                        <div class="character-card card">
                            <img src="${character.image_url}" alt="${character.name}" class="character-image">
                            <div class="card-content">
                                <h3>${character.name}</h3>
                                <p>${character.set || ''}</p>
                            </div>
                        </div>
                    `;
                    carouselContainer.appendChild(cell);
                });
    
                // Initialize Flickity
                const flkty = new Flickity(carouselContainer, {
                    contain: true,
                    wrapAround: true,
                    autoPlay: 3000,
                    pageDots: true,
                    prevNextButtons: true,
                    cellAlign: 'left'
                });

                // Hero Reveal Animation
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-revealed');
                        } else {
                            entry.target.classList.remove('is-revealed');
                        }
                    });
                }, {
                    threshold: 0.1
                });

                flkty.cells.forEach(cell => observer.observe(cell.element));
            }
        } catch (error) {
            console.error("Could not load characters for carousel:", error);
        }
    }
    
    // =========== Data Management ===========
    function exportDataFromFirebase() {
        get(rankingsRef).then((snapshot) => {
            const data = snapshot.val();
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${gameType}-rankings-${new Date().toISOString().split("T")[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    function importDataFromFirebase(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (confirm("Are you sure you want to overwrite current data? This cannot be undone.")) {
                set(rankingsRef, data).then(() => {
                    alert("✓ Data imported successfully!");
                    renderLeaderboard();
                }).catch((error) => {
                    alert("Error importing data: " + error.message);
                });
            }
        } catch (error) {
            alert("Error parsing JSON: " + error.message);
        }
    }

    function clearDataFromFirebase() {
        if (confirm("⚠️ Are you sure you want to clear all player data for this game? This action cannot be undone.")) {
            remove(rankingsRef).then(() => {
                alert("✓ All player data cleared!");
                renderLeaderboard();
            }).catch((error) => {
                alert("Error clearing data: " + error.message);
            });
        }
    }

    function addAdminDataButtons() {
        const container = adminBtn.parentElement;
        if (!container || document.getElementById("exportBtn")) return;
        
        const exportBtn = document.createElement("button");
        exportBtn.id = "exportBtn";
        exportBtn.className = "admin-btn";
        exportBtn.textContent = "📥 Export";
        exportBtn.onclick = exportDataFromFirebase;

        const importBtn = document.createElement("button");
        importBtn.id = "importBtn";
        importBtn.className = "admin-btn";
        importBtn.textContent = "📤 Import";
        importBtn.onclick = () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => importDataFromFirebase(event.target.result);
                reader.readAsText(file);
            };
            input.click();
        };

        const clearBtn = document.createElement("button");
        clearBtn.id = "clearBtn";
        clearBtn.className = "admin-btn danger";
        clearBtn.textContent = "🗑️ Clear";
        clearBtn.onclick = clearDataFromFirebase;
        
        container.insertBefore(exportBtn, adminBtn);
        container.insertBefore(importBtn, adminBtn);
        container.insertBefore(clearBtn, adminBtn);
    }

    function removeAdminDataButtons() {
        const exportBtn = document.getElementById("exportBtn");
        const importBtn = document.getElementById("importBtn");
        const clearBtn = document.getElementById("clearBtn");
        if (exportBtn) exportBtn.remove();
        if (importBtn) importBtn.remove();
        if (clearBtn) clearBtn.remove();
    }
    
    // =========== Modal Closing Logic ===========
    const modals = [adminLoginModal, playerModal, editPlayerModal].filter(m => m != null);
    modals.forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });

        const closeButtons = modal.querySelectorAll(".close, .cancel-btn");
        closeButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                modal.classList.remove("show");
            });
        });
    });

    // =========== Initial Load ===========
    renderLeaderboard();
    updateAdminUI();
    if (document.getElementById('charactersCarousel')) {
        loadCharactersCarousel('charactersCarousel', './unmatched_characters.json');
    }
    if (document.getElementById('diceThroneCarousel')) {
        loadCharactersCarousel('diceThroneCarousel', './dice_throne_heroes.json');
    }
});

// ==================== Helper Functions ====================
function calculateWinRate(wins, losses) {
    const total = wins + losses;
    if (total === 0) return 0;
    return ((wins / total) * 100).toFixed(1);
}

function calculateRating(points) {
    return Math.floor(points / 10) + 1000;
}
