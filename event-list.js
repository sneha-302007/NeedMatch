import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDjPD3ELSzyF6xbnRYrCU30MBZO78-ozfs",
  authDomain: "login-final-18101.firebaseapp.com",
  databaseURL: "https://login-final-18101-default-rtdb.firebaseio.com",
  projectId: "login-final-18101",
  storageBucket: "login-final-18101.appspot.com",
  messagingSenderId: "355958069407",
  appId: "1:355958069407:web:7f1d794071d7c846b4aaaa"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔹 Load Events
const eventList = document.getElementById("eventList");

async function loadEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  eventList.innerHTML = "";

  onAuthStateChanged(auth, async (user) => {
    snapshot.forEach(async (docSnap) => {
      const event = docSnap.data();
      const eventId = docSnap.id;

      const date = event.Date?.toDate
        ? event.Date.toDate().toDateString()
        : event.Date || "Date not available";

      const isParticipating =
        user && Array.isArray(event.participatingNgos)
          ? event.participatingNgos.includes(user.uid)
          : false;

      const card = document.createElement("div");
      card.classList.add("event-card");

      card.innerHTML = `
        <img src="${event.image || 'photos/default-event.jpg'}" alt="${event.Title}">
        <div class="event-details">
          <h3>${event.Title}</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p>${event.Description || ""}</p>
        </div>
        <button class="participate-btn ${isParticipating ? 'participated' : ''}"
                data-id="${eventId}">
          ${isParticipating ? 'Participated' : 'Participate'}
        </button>
      `;

      eventList.appendChild(card);
    });

    // Wait for all buttons to be added
    setTimeout(() => {
      document.querySelectorAll(".participate-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          handleParticipation(btn.dataset.id, btn)
        );
      });
    }, 500);
  });
}

// 🔹 Handle participation toggle
async function handleParticipation(eventId, btn) {
  const user = auth.currentUser;
  if (!user) {
    alert("Please log in to participate.");
    return;
  }

  const eventRef = doc(db, "events", eventId);
  const eventSnap = await getDoc(eventRef);

  if (!eventSnap.exists()) {
    alert("Event not found!");
    return;
  }

  const data = eventSnap.data();
  const isParticipating =
    Array.isArray(data.participatingNgos) &&
    data.participatingNgos.includes(user.uid);

  if (!isParticipating) {
    // ✅ Join Event
    await updateDoc(eventRef, {
      participatingNgos: arrayUnion(user.uid),
    });

    btn.textContent = "Participated";
    btn.classList.add("participated");
    alert("🎉 Successfully registered your NGO for this event!");
  } else {
    // ⚠️ Confirm Exit
    const confirmExit = confirm(
      "Are you sure you want to exit this event?"
    );
    if (confirmExit) {
      await updateDoc(eventRef, {
        participatingNgos: arrayRemove(user.uid),
      });

      btn.textContent = "Participate";
      btn.classList.remove("participated");
      alert("You have exited the event.");
    }
  }
}

// 🔹 Run
loadEvents();
