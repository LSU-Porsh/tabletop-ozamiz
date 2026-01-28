import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { app } from "./firebase.js";

const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
  const galleryContainer = document.getElementById("eventGallery");
  const adminControls = document.getElementById("galleryAdminControls");
  const addPhotoBtn = document.getElementById("addPhotoBtn");
  const deletePhotoModeBtn = document.getElementById("deletePhotoModeBtn");
  const addPhotoModal = document.getElementById("addPhotoModal");
  const addPhotoForm = document.getElementById("addPhotoForm");
  const addPhotoCloseBtn = document.getElementById("addPhotoCloseBtn");
  const photoFormCancelBtn = document.getElementById("photoFormCancelBtn");

  let isAdmin = localStorage.getItem("isAdmin") === "true";
  let isDeleteMode = false;

  const galleryRef = ref(database, "eventGallery");

  // Load gallery from Firebase
  function loadGallery() {
    get(galleryRef)
      .then((snapshot) => {
        const data = snapshot.val();
        galleryContainer.innerHTML = "";

        if (data && Array.isArray(data)) {
          data.forEach((photo) => {
            addPhotoToGallery(photo);
          });
        } else if (!data) {
          // If no Firebase data, load from JSON file
          loadFromJSON();
        }
      })
      .catch(() => {
        // Fallback to JSON if Firebase fails
        loadFromJSON();
      });
  }

  function loadFromJSON() {
    fetch("./event_gallery.json")
      .then((response) => response.json())
      .then((data) => {
        if (data.gallery && Array.isArray(data.gallery)) {
          data.gallery.forEach((photo) => {
            addPhotoToGallery(photo);
          });
        }
      })
      .catch((error) => {
        console.error("Error loading gallery:", error);
        galleryContainer.innerHTML =
          '<div class="gallery-empty">No photos available yet.</div>';
      });
  }

  function addPhotoToGallery(photo) {
    const photoDate = new Date(photo.date).toLocaleDateString();
    const card = document.createElement("div");
    card.classList.add("gallery-card");
    card.dataset.photoId = photo.id;
    card.innerHTML = `
      <div class="gallery-image-wrapper">
        <img src="${photo.imageUrl}" alt="${photo.title}" class="gallery-image" />
        <div class="gallery-overlay">
          <div style="color: white;">
            <p style="margin: 0; font-size: 0.9rem;">${photo.date || "No date"}</p>
          </div>
        </div>
        ${isAdmin && isDeleteMode ? `<button class="gallery-delete-btn" data-photo-id="${photo.id}">Delete</button>` : ""}
      </div>
      <div class="gallery-card-info">
        <h3 class="gallery-title">${photo.title}</h3>
        <p class="gallery-description">${photo.description || ""}</p>
        <div class="gallery-meta">
          <span class="gallery-category">${photo.category || "other"}</span>
          <span>${photoDate}</span>
        </div>
      </div>
    `;
    galleryContainer.appendChild(card);
  }

  // Update admin controls visibility
  function updateAdminUI() {
    if (isAdmin) {
      adminControls.style.display = "flex";
    } else {
      adminControls.style.display = "none";
      isDeleteMode = false;
      galleryContainer.classList.remove("delete-mode");
    }
  }

  // Add photo
  if (addPhotoBtn) {
    addPhotoBtn.addEventListener("click", () => {
      if (!isAdmin) {
        alert("Admin access required.");
        return;
      }
      addPhotoModal.classList.add("show");
    });
  }

  if (addPhotoForm) {
    addPhotoForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const photoTitle = document.getElementById("photoTitle").value;
      const photoDescription =
        document.getElementById("photoDescription").value;
      const photoCategory = document.getElementById("photoCategory").value;
      const photoUrl = document.getElementById("photoUrl").value;
      const photoDate =
        document.getElementById("photoDate").value ||
        new Date().toISOString().split("T")[0];

      const newPhotoRef = ref(database, `eventGallery/${Date.now()}`);

      set(newPhotoRef, {
        id: Date.now(),
        title: photoTitle,
        description: photoDescription,
        category: photoCategory,
        imageUrl: photoUrl,
        date: photoDate,
      })
        .then(() => {
          alert("✓ Photo added successfully!");
          addPhotoForm.reset();
          addPhotoModal.classList.remove("show");
          loadGallery();
        })
        .catch((error) => {
          alert("Error adding photo: " + error.message);
        });
    });
  }

  // Delete photo mode toggle
  if (deletePhotoModeBtn) {
    deletePhotoModeBtn.addEventListener("click", () => {
      if (!isAdmin) return;

      isDeleteMode = !isDeleteMode;
      deletePhotoModeBtn.style.opacity = isDeleteMode ? "0.8" : "1";
      galleryContainer.classList.toggle("delete-mode");

      // Refresh gallery to show/hide delete buttons
      loadGallery();
    });
  }

  // Delete photo event delegation
  galleryContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("gallery-delete-btn") && isDeleteMode) {
      const photoId = e.target.dataset.photoId;
      if (confirm("Are you sure you want to delete this photo?")) {
        const photoRef = ref(database, `eventGallery/${photoId}`);
        remove(photoRef)
          .then(() => {
            alert("✓ Photo deleted successfully!");
            loadGallery();
          })
          .catch((error) => {
            alert("Error deleting photo: " + error.message);
          });
      }
    }
  });

  // Modal close handlers
  const modals = [addPhotoModal].filter((m) => m != null);
  modals.forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });

    const closeButtons = modal.querySelectorAll(".close, .cancel-btn");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        modal.classList.remove("show");
      });
    });
  });

  // Initial load
  updateAdminUI();
  loadGallery();

  // Listen for admin status changes (from other tabs/windows)
  window.addEventListener("storage", () => {
    isAdmin = localStorage.getItem("isAdmin") === "true";
    updateAdminUI();
  });
});
