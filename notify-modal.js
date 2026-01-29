// Notify Me Modal
let notifyModal;
let notifyCloseBtn;
let notifyBtn;
let notifyForm;
let notifyFormCancelBtn;
let moreGamesLink;

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  notifyModal = document.getElementById("notifyModal");
  notifyCloseBtn = document.getElementById("notifyCloseBtn");
  notifyBtn = document.getElementById("notifyMeBtn");
  notifyForm = document.getElementById("notifyForm");
  notifyFormCancelBtn = document.getElementById("notifyFormCancelBtn");
  moreGamesLink = document.querySelector(".more-games-link");

  // Event listeners
  if (notifyBtn) {
    notifyBtn.addEventListener("click", openNotifyModal);
  }
  if (moreGamesLink) {
    moreGamesLink.addEventListener("click", openNotifyModal);
  }
  if (notifyCloseBtn) {
    notifyCloseBtn.addEventListener("click", closeNotifyModal);
  }
  if (notifyFormCancelBtn) {
    notifyFormCancelBtn.addEventListener("click", closeNotifyModal);
  }
  if (notifyForm) {
    notifyForm.addEventListener("submit", handleFormSubmit);
  }

  // Close modal when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === notifyModal) {
      closeNotifyModal();
    }
  });
});

// Open notify modal
function openNotifyModal() {
  notifyModal.classList.add("show");
  notifyModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close notify modal
function closeNotifyModal() {
  notifyModal.classList.remove("show");
  notifyModal.style.display = "none";
  document.body.style.overflow = "auto";
  notifyForm.reset();
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("notifyName").value;
  const email = document.getElementById("notifyEmail").value;
  const suggestion = document.getElementById("suggestGame").value;

  // Display success message
  alert(
    `Thank you, ${name}! We'll notify you about new games at ${email}.\n\nThank you for your suggestion!`,
  );

  // Close modal
  closeNotifyModal();
}
