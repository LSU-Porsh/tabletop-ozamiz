// Game Details Modal
const gameDetailsModal = document.getElementById("gameDetailsModal");
const gameDetailsCloseBtn = document.getElementById("gameDetailsCloseBtn");

// Game data
const gameDatabase = {
  unmatched: {
    title: "Unmatched",
    description:
      "Fast-paced tactical card battles featuring legendary characters in one-on-one duels. Each hero has unique abilities and strategies. Compete with strategic deck building and tactical decision-making in this thrilling card game.",
    image:
      "https://hotgamemagnet.com/wp-content/uploads/2023/08/UM-BoL2-box-render-left.png",
    players: "2 Players",
    duration: "20-40 minutes",
    type: "Tactical Card Game",
  },
  diceThrone: {
    title: "Dice Throne",
    description:
      "A competitive dice-rolling game where players take on the role of different characters, each with unique abilities. Roll dice, manage your status effects, and be the last player standing. Perfect for players who love luck and strategy combined.",
    image:
      "https://888lots.com/images/products/dice-throne-season-one-rerolled-battle-chest-888-1988884756-us_thumb.webp",
    players: "2-4 Players",
    duration: "30-45 minutes",
    type: "Dice Rolling Game",
  },
  flamecraft: {
    title: "Flamecraft",
    description:
      "A delightful game of collecting adorable dragons and crafting magical artifacts. Visit fantastical shops, collect ingredients, and fulfill orders to attract dragons. A perfect blend of strategy and charm for the whole family.",
    image:
      "https://geekbecois.com/wp-content/uploads/2022/10/flamecraft_wallpaper_1920x1080_fr.png",
    players: "2-4 Players",
    duration: "30-45 minutes",
    type: "Worker Placement",
  },
  surviveTheIsland: {
    title: "Survive the Island",
    description:
      "Work together or compete to gather resources and survive on a mysterious island. Make strategic decisions about resource management and exploration. A game of survival where every choice matters.",
    image:
      "https://m.media-amazon.com/images/S/aplus-media-library-service-media/77d1001a-d503-450c-bfa2-f7968449c157.__CR0,0,1940,1200_PT0_SX970_V1___.png",
    players: "3-4 Players",
    duration: "45-90 minutes",
    type: "Cooperative/Competitive",
  },
  scout: {
    title: "Scout",
    description:
      "A quick and clever card game where you build sequences of cards from 1-100. Simple rules hide deep strategy as you play cards in sequence with minimal information. A fast-paced classic perfect for any game night.",
    image:
      "https://i.etsystatic.com/22611795/r/il/692aab/4030621774/il_800x800.4030621774_fjc7.jpg",
    players: "2-4 Players",
    duration: "20-30 minutes",
    type: "Card Game",
  },
  deepRegrets: {
    title: "Deep Regrets",
    description:
      "A hilarious party game about confessing your deepest regrets in the funniest way possible. Make your friends laugh with absurd confessions and creative lies. Perfect for groups who love humor and chaos.",
    image:
      "https://tse3.mm.bing.net/th/id/OIP.H_BE2eUCisHBA6RyDDKeggHaHb?rs=1&pid=ImgDetMain&o=7&rm=3",
    players: "3-6 Players",
    duration: "30-45 minutes",
    type: "Party Game",
  },
};

// Function to open game details modal
function openGameDetails(gameId) {
  const game = gameDatabase[gameId];
  if (!game) return;

  document.getElementById("gameDetailsImage").src = game.image;
  document.getElementById("gameDetailsImage").alt = game.title;
  document.getElementById("gameDetailsTitle").textContent = game.title;
  document.getElementById("gameDetailsDescription").textContent =
    game.description;
  document.getElementById("gameDetailsPlayers").textContent = game.players;
  document.getElementById("gameDetailsDuration").textContent = game.duration;
  document.getElementById("gameDetailsType").textContent = game.type;

  gameDetailsModal.classList.add("show");
  gameDetailsModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Function to close game details modal
function closeGameDetails() {
  gameDetailsModal.classList.remove("show");
  gameDetailsModal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Close button event listener
gameDetailsCloseBtn.addEventListener("click", closeGameDetails);

// Close modal when clicking outside of it
window.addEventListener("click", function (event) {
  if (event.target === gameDetailsModal) {
    closeGameDetails();
  }
});

// Add click listeners to all "View Details" buttons
document.addEventListener("DOMContentLoaded", function () {
  const viewDetailsButtons = document.querySelectorAll(".action-btn");
  const gameIds = [
    "unmatched",
    "diceThrone",
    "flamecraft",
    "surviveTheIsland",
    "scout",
    "deepRegrets",
  ];

  viewDetailsButtons.forEach((button, index) => {
    if (index < gameIds.length) {
      button.addEventListener("click", function () {
        openGameDetails(gameIds[index]);
      });
    }
  });
});

// Add click listeners to all game cards
document.addEventListener("DOMContentLoaded", function () {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const gameIds = [
    "unmatched",
    "diceThrone",
    "flamecraft",
    "surviveTheIsland",
    "scout",
    "deepRegrets",
  ];

  galleryItems.forEach((item, index) => {
    if (index < gameIds.length) {
      item.addEventListener("click", function () {
        openGameDetails(gameIds[index]);
      });
    }
  });
});
